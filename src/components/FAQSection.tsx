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
      "Our solar readiness assessment typically takes 3-5 minutes to complete. We've designed it to be quick and straightforward while still gathering all the essential information needed for accurate results.",
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
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-headline mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get answers to common questions about our solar readiness assessment
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border/20 rounded-lg px-6 bg-card/50 backdrop-blur-sm scroll-reveal"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <AccordionTrigger className="text-left text-foreground font-semibold hover:no-underline border border-black rounded-md px-3 py-2">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
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
