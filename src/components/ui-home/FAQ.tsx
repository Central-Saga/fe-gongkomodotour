"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaChevronDown } from "react-icons/fa";

// Definisikan tipe untuk data FAQ
interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  { question: "Pertanyaan 1", answer: "Jawaban untuk Pertanyaan 1." },
  { question: "Pertanyaan 2", answer: "Jawaban untuk Pertanyaan 2." },
  { question: "Pertanyaan 3", answer: "Jawaban untuk Pertanyaan 3." },
  { question: "Pertanyaan 4", answer: "Jawaban untuk Pertanyaan 4." },
  { question: "Pertanyaan 5", answer: "Jawaban untuk Pertanyaan 5." },
  { question: "Pertanyaan 6", answer: "Jawaban untuk Pertanyaan 6." },
];

// Definisikan tipe untuk props komponen (opsional, karena ini default export)
const FAQ = () => {
  const faqsKiri: FAQItem[] = faqs.slice(0, 3);
  const faqsKanan: FAQItem[] = faqs.slice(3, 6);

  return (
    <section className="py-20 bg-background">
      <div className="container max-w-screen-lg px-4 mx-auto text-center">
        {" "}
        {/* Added mx-auto and text-center */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground">
            Hight Light Question (FAQ)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Frequently Asked Questions
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-center">
            {" "}
            {/* Added justify-center */}
            <div className="space-y-3">
              {faqsKiri.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm font-semibold text-foreground flex justify-between items-center p-3 bg-card shadow-md rounded-md hover:underline data-[state=open]:rounded-b-none">
                    <span>{faq.question}</span>
                    <FaChevronDown
                      className="w-5 h-5 text-white transition-transform duration-300 rounded-full p-1 bg-yellow-500 data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </AccordionTrigger>
                  <AccordionContent className="p-3 text-xs text-muted-foreground bg-card rounded-b-md overflow-hidden transition-all duration-500 ease-in-out data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
            <div className="space-y-3">
              {faqsKanan.map((faq, index) => (
                <AccordionItem key={index + 3} value={`item-${index + 3}`}>
                  <AccordionTrigger className="text-sm font-semibold text-foreground flex justify-between items-center p-3 bg-card shadow-md rounded-md hover:underline data-[state=open]:rounded-b-none">
                    <span>{faq.question}</span>
                    <FaChevronDown
                      className="w-5 h-5 text-white transition-transform duration-300 rounded-full p-1 bg-yellow-500 data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </AccordionTrigger>
                  <AccordionContent className="p-3 text-xs text-muted-foreground bg-card rounded-b-md overflow-hidden transition-all duration-500 ease-in-out data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
          </div>
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
