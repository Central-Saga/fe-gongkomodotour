import LandingHero from "@/components/ui-home/LandingHero";
import TripHighlight from "@/components/ui-home/TripHighlight";
import AboutUs from "@/components/ui-home/AboutUs";
import WhyChooseUs from "@/components/ui-home/WhyChooseUs";
import Testimonials from "@/components/ui-home/Testimonials";
import FAQ from "@/components/ui-home/FAQ";
import Gallery from "@/components/ui-home/Gallery";

export default function Home() {
  return (
    <>
      <LandingHero />
      <TripHighlight />
      <AboutUs />
      <WhyChooseUs />
      <Gallery />
      <Testimonials />
      <FAQ />
    </>
  );
}
