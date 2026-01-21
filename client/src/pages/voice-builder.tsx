import VoiceBuilder from "@/components/VoiceBuilder";
import { SEOHead } from "@/components/SEOHead";
import { ComingSoonOverlay } from "@/components/ComingSoonOverlay";

export default function VoiceBuilderPage() {
  return (
    <>
      <SEOHead
        title="Voice Builder - UK Innovator Founder Visa Assistant"
        description="Transform spoken ideas into professionally formatted UK visa documents. AI-powered speech-to-document technology for effortless visa applications."
        canonical="/tools/voice-builder"
      />
      <ComingSoonOverlay 
        title="Voice Builder" 
        description="Transform your spoken ideas into professionally formatted UK visa documents. Just speak naturally and our AI handles the rest."
      >
        <VoiceBuilder />
      </ComingSoonOverlay>
    </>
  );
}
