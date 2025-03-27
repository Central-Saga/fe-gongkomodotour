// components/ui-detail/DetailFAQ.tsx
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaChevronDown } from "react-icons/fa";

// Definisikan tipe untuk data FAQ
interface FAQItem {
  question: string;
  answer: string;
}

// Definisikan tipe untuk props komponen
interface DetailFAQProps {
  faqs: FAQItem[];
}

// Gunakan React.FC dengan tipe props yang tepat
const DetailFAQ: React.FC<DetailFAQProps> = ({ faqs }) => {
  return (
    <section className="py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">FAQ</h2>
        <Accordion type="single" collapsible className="w-full">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 bg-white shadow-md rounded-lg hover:underline data-[state=open]:rounded-b-none">
                  <span>{faq.question}</span>
                  <FaChevronDown
                    className="w-6 h-6 text-white transition-transform duration-300 rounded-full p-1 bg-yellow-500 data-[state=open]:rotate-180"
                    aria-hidden
                  />
                </AccordionTrigger>
                <AccordionContent
                  className="p-4 text-muted-foreground bg-white rounded-b-lg overflow-hidden transition-all duration-500 ease-in-out data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </div>
        </Accordion>
      </div>
    </section>
  );
};

export default DetailFAQ;