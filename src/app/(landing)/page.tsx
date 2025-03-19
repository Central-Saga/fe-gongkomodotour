import LandingHero from "@/components/LandingHero";
import TripHighlight from "@/components/TripHighlight";
import AboutUs from "@/components/AboutUs";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Gallery from "@/components/Gallery";

export default function Home() {
  return (
    <>
      <LandingHero />
      <TripHighlight/>
      <AboutUs />
      <WhyChooseUs />
      <Gallery/>
      <Testimonials />
      <FAQ />
     
      </>
  );
}