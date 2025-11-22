import { FileUploadConfig } from "@/components/FileUploadButton";

// File upload configurations for different tool types
export const fileUploadConfigs = {
  // Document verification tools
  documentVerification: {
    acceptedTypes: ['.pdf', '.jpg', '.jpeg', '.png', '.heic'],
    maxSizeMB: 10,
    label: 'Upload Document',
    description: 'Upload passport scan (JPG/PNG/HEIC) or documents (PDF)',
    allowCamera: true
  } as FileUploadConfig,

  // Evidence collection
  evidenceCollection: {
    acceptedTypes: ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png', '.heic'],
    maxSizeMB: 15,
    label: 'Upload Evidence',
    description: 'Upload evidence documents (PDF/DOCX) or photos (JPG/PNG/HEIC)',
    allowCamera: true
  } as FileUploadConfig,

  // Document organizer
  documentOrganizer: {
    acceptedTypes: ['.pdf', '.docx', '.doc', '.txt'],
    maxSizeMB: 20,
    label: 'Upload Document',
    description: 'Upload documents (PDF/DOCX/TXT)',
    allowCamera: false
  } as FileUploadConfig,

  // Legal templates
  legalTemplates: {
    acceptedTypes: ['.pdf', '.docx', '.doc'],
    maxSizeMB: 10,
    label: 'Upload Signed Document',
    description: 'Upload signed documents (PDF/DOCX)',
    allowCamera: true
  } as FileUploadConfig,

  // Cover letter / Personal statement
  writingDocuments: {
    acceptedTypes: ['.pdf', '.docx', '.doc', '.txt'],
    maxSizeMB: 5,
    label: 'Upload Draft',
    description: 'Upload your draft (PDF/DOCX/TXT)',
    allowCamera: false
  } as FileUploadConfig,

  // Company documents (history, bios, etc)
  companyDocuments: {
    acceptedTypes: ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png'],
    maxSizeMB: 10,
    label: 'Upload Company Document',
    description: 'Upload company documents or photos (PDF/DOCX/JPG/PNG)',
    allowCamera: true
  } as FileUploadConfig,

  // Financial documents
  financialDocuments: {
    acceptedTypes: ['.pdf', '.xlsx', '.xls', '.csv'],
    maxSizeMB: 15,
    label: 'Upload Financial Document',
    description: 'Upload financial statements (PDF/XLSX/CSV)',
    allowCamera: true
  } as FileUploadConfig,

  // ID / Passport photos
  idPhotos: {
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.heic'],
    maxSizeMB: 5,
    label: 'Upload Photo',
    description: 'Upload passport or ID photo (JPG/PNG/HEIC)',
    allowCamera: true
  } as FileUploadConfig,

  // General images
  images: {
    acceptedTypes: ['.jpg', '.jpeg', '.png', '.heic', '.webp'],
    maxSizeMB: 8,
    label: 'Upload Image',
    description: 'Upload images (JPG/PNG/HEIC/WEBP)',
    allowCamera: true
  } as FileUploadConfig,
};
