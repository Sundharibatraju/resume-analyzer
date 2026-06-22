import AppLayout from "../components/layout/AppLayout";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Testimonials from "../components/landing/Testimonials";
import CTA from "../components/landing/CTA";

export default function LandingPage() {
  return (
    <AppLayout>
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </AppLayout>
  );
}
