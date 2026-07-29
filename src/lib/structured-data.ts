import { SITE, KEYWORDS } from "./site";

const ORG_ID = `${SITE.url}/#organization`;
const PERSON_ID = `${SITE.url}/#pedro-abiu`;
const WEBSITE_ID = `${SITE.url}/#website`;
const COURSE_ID = `${SITE.url}/#course`;

/* Grafo principal de la marca: se incrusta en el layout (todo el sitio). */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "EducationalOrganization"],
        "@id": ORG_ID,
        name: "Tecnoiglesia",
        alternateName: "Iglesia Digital",
        url: SITE.url,
        logo: SITE.logo,
        founder: { "@id": PERSON_ID },
        description:
          "Tecnoiglesia ayuda a iglesias a usar la tecnología con propósito para llegar a más personas. Su programa Iglesia Digital enseña evangelismo digital: presencia en Google y redes, Google Ad Grant, servicio en línea y seguimiento.",
        knowsAbout: KEYWORDS,
        areaServed: ["Latinoamérica", "Estados Unidos", "Europa"],
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Pedro Abiú",
        jobTitle: "Fundador de Tecnoiglesia y del programa Iglesia Digital",
        worksFor: { "@id": ORG_ID },
        url: SITE.url,
        description:
          "Pedro Abiú es fundador de Tecnoiglesia y del programa Iglesia Digital. Con más de 16 años de experiencia ha ayudado a miles de iglesias a crecer en internet mediante evangelismo digital.",
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE.url,
        name: SITE.name,
        inLanguage: SITE.lang,
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "Course",
        "@id": COURSE_ID,
        name: "Iglesia Digital",
        url: SITE.url,
        description:
          "Programa de 16 semanas para pastores y líderes: aprende cómo hacer crecer tu iglesia en internet y redes sociales, activar el Google Ad Grant (hasta $10,000 USD/mes en publicidad gratuita), construir tu servicio en línea, el embudo espiritual y dar seguimiento a cada persona desde el primer clic hasta la decisión de fe.",
        inLanguage: SITE.lang,
        provider: { "@id": ORG_ID },
        author: { "@id": PERSON_ID },
        about: KEYWORDS,
        teaches: [
          "Cómo hacer crecer tu iglesia en redes sociales e internet",
          "Cómo usar las redes para llevar personas a la iglesia",
          "Activar el Google Ad Grant para iglesias",
          "Construir un servicio de iglesia en línea (Church Online)",
          "Embudo espiritual digital y seguimiento de nuevos creyentes",
        ],
        hasCourseInstance: {
          "@type": "CourseInstance",
          courseMode: "online",
          courseWorkload: "P16W",
          inLanguage: SITE.lang,
        },
      },
    ],
  };
}

/* FAQPage: se incrusta en la página con las preguntas frecuentes (home). */
export function faqGraph(faqs: readonly (readonly [string, string])[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
