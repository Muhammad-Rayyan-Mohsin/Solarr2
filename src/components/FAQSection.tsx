import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQSection = () => {
  return (
    <section id="faq" className="py-12 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-headline mb-8 text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-border rounded-lg">
              <AccordionTrigger className="py-4 px-4 text-base sm:text-lg hover:no-underline">
                How long does the survey take?
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-base text-muted-foreground">
                Usually just a few minutes with structured questions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border border-border rounded-lg">
              <AccordionTrigger className="py-4 px-4 text-base sm:text-lg hover:no-underline">
                Do I need to sign up?
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-base text-muted-foreground">
                No signup required to complete the survey.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border border-border rounded-lg">
              <AccordionTrigger className="py-4 px-4 text-base sm:text-lg hover:no-underline">
                Can I view my submissions later?
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-base text-muted-foreground">
                Yes, use the Submissions page to review entries.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
