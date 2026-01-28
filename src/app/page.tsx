
import Hero from "@/components/Hero";
import ToolsSection from "@/components/ToolsSection";
import LabSection from "@/components/LabSection";
import StorySection from "@/components/StorySection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between">
      <Hero />
      <ToolsSection />
      <LabSection />
      <StorySection />
      <Footer />
    </main>
  );
}
