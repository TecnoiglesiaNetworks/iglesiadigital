import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { VideoSection } from "@/components/site/VideoSection";
import { Marquee } from "@/components/site/Marquee";
import { ProblemBento } from "@/components/site/ProblemBento";
import { Stats } from "@/components/site/Stats";
import { GrantHighlight } from "@/components/site/GrantHighlight";
import { Pillars } from "@/components/site/Pillars";
import { ProgramSteps } from "@/components/site/ProgramSteps";
import { Showcase } from "@/components/site/Showcase";
import { Button } from "@/components/ui/button";
import { Testimonials } from "@/components/site/Testimonials";
import { ForWhom } from "@/components/site/ForWhom";
import { Founder } from "@/components/site/Founder";
import { Pricing } from "@/components/site/Pricing";
import { Faq } from "@/components/site/Faq";
import { FinalCta } from "@/components/site/FinalCta";
import { Platforms } from "@/components/site/Platforms";
import { Footer } from "@/components/site/Footer";
import { Lock } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqGraph } from "@/lib/structured-data";
import { faqs } from "@/components/site/faq-data";
import { AuroraBackground } from "@/components/ui/animated-background";

export default function Home() {
  return (
    <main>
      <JsonLd data={faqGraph(faqs)} />
      <Navbar />
      <Hero />
      <VideoSection />
      <Marquee />
      <ProblemBento />
      <Stats />
      <GrantHighlight />
      <Pillars />
      <ProgramSteps />
      <Showcase />
      <section id="diagnostico" className="relative">
        <AuroraBackground className="border-y border-line py-24">
        <div className="container">
          <div className="mx-auto max-w-[640px] text-center">
            <span className="mb-5 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent before:h-px before:w-5 before:bg-accent before:opacity-70 before:content-['']">
              Empieza aquí · Gratis
            </span>
            <h2 className="font-display text-[clamp(28px,4.4vw,44px)] font-bold leading-[1.08] tracking-tight">
              Descubre qué tan lista está tu iglesia para crecer
            </h2>
            <p className="mt-4 text-[17.5px] text-muted">
              Responde 8 preguntas y recibe al instante un diagnóstico personalizado con los 3 pasos
              que más impacto tendrían en tu iglesia hoy.
            </p>
            <div className="mt-8 flex justify-center">
              <Button href="/diagnostico" variant="accent" size="lg">
                Hacer mi diagnóstico gratis →
              </Button>
            </div>
            <p className="mt-3.5 inline-flex items-center gap-1.5 text-[13px] text-muted"><Lock size={13} /> Sin costo · 3 minutos · Resultado al instante</p>
          </div>
        </div>
        </AuroraBackground>
      </section>
      <Testimonials />
      <ForWhom />
      <Founder />
      <Pricing />
      <Faq />
      <FinalCta />
      <Platforms />
      <Footer />
    </main>
  );
}
