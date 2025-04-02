// components/ui-detail/DetailFAQ.tsx
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaChevronDown } from "react-icons/fa";

interface FAQItem {
  question: string;
  answer: string;
}

interface DetailFAQProps {
  faqs: FAQItem[];
}

const DetailFAQ: React.FC<DetailFAQProps> = ({ faqs }) => {
  return (
    <section className="pt-12 px-4 md:px-8 bg-white h-[545px] rounded-2xl shadow-xl"> {/* 1. Ubah mx-h menjadi h-[500px] */}
      <div className="max-w-6xl mx-auto h-full flex flex-col"> {/* 2. Tambahkan h-full dan flex-col */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">FAQ</h2>
        <Accordion type="single" collapsible className="w-full flex-1 overflow-y-auto"> {/* 3. Tambahkan flex-1 dan overflow */}
          <div className="space-y-4 pb-4"> {/* 4. Tambahkan padding-bottom */}
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 bg-[#FCFBFB] shadow-md rounded-lg hover:underline data-[state=open]:rounded-b-none">
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