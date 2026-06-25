import HeroSection from "@/components/sections/HeroSection";
import StatsSection from "@/components/sections/StatsSection";
import MembersSection from "@/components/sections/MembersSection";
import Footer from "@/components/layout/Footer";
import FeaturedSection from "./_sections/FeaturedSection";
import BenefitsSection from "./_sections/BenefitsSection";

export default function HomePage() {
  return (
    <>
      <HeroSection
        image="/buildings/building-aerial-1.png"
        title="Find Your Perfect Workspace at Rupiah Building"
        ctaLabel="Explore Workspace"
        ctaHref="/workspace"
        minHeight="min-h-[85vh]"
        objectPosition="center 20%"
      />
      <StatsSection />
      <FeaturedSection />
      <BenefitsSection />
      <MembersSection />
      <Footer />
    </>
  );
}
