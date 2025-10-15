import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How long does the assessment take?",
    answer:
      "Our comprehensive solar assessment typically takes 45-60 minutes to complete. This detailed evaluation ensures we gather all necessary information about your property, roof structure, energy usage, and preferences for the most accurate solar recommendations. Professional surveyors conduct these assessments to ensure precision and compliance with local regulations.",
  },
  {
    question: "What data do you collect?",
    answer:
      "We collect basic information about your property (address, roof type, shading), energy usage patterns, and preferences. All data is encrypted and used solely to generate your personalized solar assessment. We never sell your information.",
  },
  {
    question: "Will I need to talk to anyone?",
    answer:
      "No! Our assessment is completely self-service. You'll receive your results immediately online with no phone calls or sales pressure. If you want to speak with someone, that's completely optional.",
  },
  {
    question: "How accurate are the estimates?",
    answer:
      "Our estimates are based on satellite imagery, local weather data, utility rates, and current incentive programs. While actual results may vary, our assessments typically provide accuracy within 10-15% of professional quotes.",
  },
  {
    question: "Is my information secure?",
    answer:
      "Yes, absolutely. We use bank-level encryption to protect your data. We never share your personal information with third parties without your explicit consent, and you control all communication preferences.",
  },
  {
    question: "What happens after I get my results?",
    answer:
      "After receiving your assessment, you can download your report, explore recommended next steps, or connect with vetted local installers if you choose. Everything is optional and at your own pace.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-headline mb-3 sm:mb-4 text-foreground font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Get answers to common questions about our solar readiness assessment
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-8 sm:space-y-10">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/20 rounded-lg bg-card/50 backdrop-blur-sm scroll-reveal"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline py-4 sm:py-5 px-4 sm:px-6 text-sm sm:text-base [&[data-state=open]]:bg-muted/30 transition-colors">
                  <span className="mr-4">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base px-4 sm:px-6 py-4 sm:py-5 bg-muted/20 rounded-b-lg">
                  <div className="pl-4 border-l-2 border-muted-foreground/20">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
