"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
interface FAQProps {}

const FAQ: React.FC<FAQProps> = () => {
  const faqsKiri: FAQItem[] = faqs.slice(0, 3);
  const faqsKanan: FAQItem[] = faqs.slice(3, 6);

  return (
    <section className="py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-foreground">Hight Light Question (FAQ)</h2>
          <p className="text-muted-foreground mt-2">Frequently Asked Questions</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              {faqsKiri.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 bg-card shadow-md rounded-lg hover:underline data-[state=open]:rounded-b-none">
                    <span>{faq.question}</span>
                    <FaChevronDown
                      className="w-6 h-6 text-white transition-transform duration-300 rounded-full p-1 bg-yellow-500 data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-muted-foreground bg-card rounded-b-lg">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
            {/* Kolom Kanan */}
            <div className="space-y-4">
              {faqsKanan.map((faq, index) => (
                <AccordionItem key={index + 3} value={`item-${index + 3}`}>
                  <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 bg-card shadow-md rounded-lg hover:underline data-[state=open]:rounded-b-none">
                    <span>{faq.question}</span>
                    <FaChevronDown
                      className="w-6 h-6 text-white transition-transform duration-300 rounded-full p-1 bg-yellow-500 data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-muted-foreground bg-card rounded-b-lg">
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