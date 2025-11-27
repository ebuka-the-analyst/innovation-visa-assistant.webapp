import VoiceBuilder from "@/components/VoiceBuilder";
import { SEOHead } from "@/components/SEOHead";

export default function VoiceBuilderPage() {
  return (
    <>
      <SEOHead
        title="Voice Builder - UK Innovator Founder Visa Assistant"
        description="Transform spoken ideas into professionally formatted UK visa documents. AI-powered speech-to-document technology for effortless visa applications."
        canonical="/tools/voice-builder"
      />
      <VoiceBuilder />
    </>
  );
}
