import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { useCallback, useState } from 'react';

interface VisualPdfExportOptions {
  planId: string;
  businessName: string;
  onProgress?: (stage: string) => void;
}

export function useVisualPdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportVisualPdf = useCallback(async (options: VisualPdfExportOptions) => {
    const { planId, businessName, onProgress } = options;
    setIsExporting(true);
    setExportError(null);
    
    try {
      onProgress?.('Fetching business plan with charts...');
      
      const response = await fetch(`/api/view/html/${planId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch business plan HTML');
      }
      
      const htmlContent = await response.text();
      
      onProgress?.('Rendering content...');
      
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position: fixed; top: -10000px; left: -10000px; width: 794px; height: auto; border: none;';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('Could not access iframe document');
      }
      
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
      
      // Wait for fonts and resources to load
      onProgress?.('Loading fonts and images...');
      await new Promise<void>(async (resolve) => {
        try {
          // Wait for fonts to load
          if (iframeDoc.fonts) {
            await iframeDoc.fonts.ready;
          }
          
          // Wait for all images to load
          const images = iframeDoc.querySelectorAll('img');
          await Promise.all(Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(r => {
              img.onload = r;
              img.onerror = r;
            });
          }));
          
          // Give SVGs time to render
          await new Promise(r => setTimeout(r, 1500));
          
          // Wait for next animation frame to ensure paint
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        } catch (e) {
          console.warn('Resource loading warning:', e);
        }
        resolve();
      });
      
      const contentDiv = iframeDoc.querySelector('.content') as HTMLElement;
      const coverPage = iframeDoc.querySelector('.cover-page') as HTMLElement;
      
      if (!contentDiv) {
        throw new Error('Could not find content in HTML');
      }
      
      onProgress?.('Capturing pages as images...');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      if (coverPage) {
        try {
          coverPage.style.width = '794px';
          coverPage.style.height = '1123px';
          coverPage.style.overflow = 'hidden';
          
          const coverDataUrl = await toPng(coverPage, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          
          pdf.addImage(coverDataUrl, 'PNG', 0, 0, pageWidth, pageHeight);
          pdf.addPage();
        } catch (e) {
          console.error('Failed to capture cover page:', e);
        }
      }
      
      onProgress?.('Converting to PDF...');
      
      const sections = contentDiv.querySelectorAll('h2');
      let currentPage = coverPage ? 2 : 1;
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        let sectionContent = section.outerHTML;
        let nextSibling = section.nextElementSibling;
        while (nextSibling && nextSibling.tagName !== 'H2') {
          sectionContent += (nextSibling as HTMLElement).outerHTML;
          nextSibling = nextSibling.nextElementSibling;
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sectionContent;
        tempDiv.style.cssText = `
          width: 750px;
          padding: 20px;
          background: white;
          font-family: Georgia, serif;
          line-height: 1.6;
          color: #1a1a1a;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
          h2 { font-size: 18pt; color: #005EB8; margin-bottom: 15px; }
          h3 { font-size: 14pt; color: #1a1a1a; margin-top: 20px; }
          p { font-size: 11pt; text-align: justify; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; color: #005EB8; }
          ul, ol { margin: 15px 0; padding-left: 25px; }
          li { margin-bottom: 6px; }
          .chart-container { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 20px 0; }
          svg { max-width: 100%; height: auto; }
        `;
        tempDiv.prepend(style);
        
        document.body.appendChild(tempDiv);
        
        try {
          const sectionDataUrl = await toPng(tempDiv, {
            quality: 0.92,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          
          const img = new Image();
          img.src = sectionDataUrl;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          
          const imgAspect = img.height / img.width;
          const imgWidth = contentWidth;
          const imgHeight = imgWidth * imgAspect;
          
          if (currentPage > 1 || i > 0) {
            pdf.addPage();
          }
          
          let yPos = margin;
          const availableHeight = pageHeight - (margin * 2);
          
          if (imgHeight <= availableHeight) {
            pdf.addImage(sectionDataUrl, 'PNG', margin, yPos, imgWidth, imgHeight);
          } else {
            const pages = Math.ceil(imgHeight / availableHeight);
            for (let p = 0; p < pages; p++) {
              if (p > 0) pdf.addPage();
              
              const srcY = (p * availableHeight / imgHeight) * img.height;
              const srcHeight = Math.min((availableHeight / imgHeight) * img.height, img.height - srcY);
              
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = srcHeight;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, srcY, img.width, srcHeight, 0, 0, img.width, srcHeight);
                const partDataUrl = canvas.toDataURL('image/png', 0.92);
                const partHeight = (srcHeight / img.width) * imgWidth;
                pdf.addImage(partDataUrl, 'PNG', margin, yPos, imgWidth, partHeight);
              }
            }
          }
          
          currentPage++;
        } catch (e) {
          console.error(`Failed to capture section ${i}:`, e);
        } finally {
          document.body.removeChild(tempDiv);
        }
        
        onProgress?.(`Processing section ${i + 1} of ${sections.length}...`);
      }
      
      pdf.addPage();
      pdf.setFontSize(10);
      pdf.setTextColor(180, 83, 9);
      pdf.text('IMPORTANT LEGAL NOTICE', margin, 30);
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const disclaimer = 'This document was generated by the UK Innovator Founder Visa Assistant and provides general guidance only. It does NOT constitute regulated immigration advice under the Immigration and Asylum Act 1999.';
      const disclaimerLines = pdf.splitTextToSize(disclaimer, contentWidth);
      pdf.text(disclaimerLines, margin, 40);
      
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('UK Innovator Founder Visa Assistant | Generated: ' + new Date().toLocaleDateString('en-GB'), margin, pageHeight - 10);
      
      // Clean up iframe
      try {
        document.body.removeChild(iframe);
      } catch (e) {
        console.warn('Failed to remove iframe:', e);
      }
      
      onProgress?.('Saving PDF...');
      
      const filename = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-business-plan.pdf';
      pdf.save(filename);
      
      setIsExporting(false);
      return true;
    } catch (error: any) {
      console.error('Visual PDF export failed:', error);
      setExportError(error.message || 'Failed to export PDF');
      setIsExporting(false);
      
      // Clean up iframe on error
      const orphanIframe = document.querySelector('iframe[style*="-10000px"]');
      if (orphanIframe) {
        try {
          document.body.removeChild(orphanIframe);
        } catch (e) {
          console.warn('Failed to clean up orphan iframe:', e);
        }
      }
      
      return false;
    }
  }, []);

  return {
    exportVisualPdf,
    isExporting,
    exportError
  };
}
