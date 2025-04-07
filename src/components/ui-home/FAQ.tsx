"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaChevronDown } from "react-icons/fa";
import type { FAQ } from "@/types/faqs";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface FAQResponse {
  data: FAQ[];
  message?: string;
  status?: string;
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response: FAQResponse = await apiRequest<FAQResponse>(
          'GET',
          '/api/landing-page-faq'
        );
        setFaqs(response.data || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const faqsKiri = faqs.slice(0, Math.ceil(faqs.length / 2));
  const faqsKanan = faqs.slice(Math.ceil(faqs.length / 2));

  if (loading) {
    return (
      <section className="py-30 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground">Hight Light Question (FAQ)</h2>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-30 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-foreground">Hight Light Question (FAQ)</h2>
          <p className="text-muted-foreground mt-2">Frequently Asked Questions</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
            {/* Kolom Kiri */}
            <div className="space-y-4">
              {faqsKiri.map((faq) => (
                <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                  <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 bg-card shadow-md rounded-lg hover:underline data-[state=open]:rounded-b-none">
                    <span>{faq.question}</span>
                    <FaChevronDown
                      className="w-6 h-6 text-white transition-transform duration-300 rounded-full p-1 bg-yellow-500 data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </AccordionTrigger>
                  <AccordionContent
                    className="p-4 text-muted-foreground bg-card rounded-b-lg overflow-hidden transition-all duration-500 ease-in-out data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
                  >
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </div>
            {/* Kolom Kanan */}
            <div className="space-y-4">
              {faqsKanan.map((faq) => (
                <AccordionItem key={faq.id} value={`item-${faq.id}`}>
                  <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 bg-card shadow-md rounded-lg hover:underline data-[state=open]:rounded-b-none">
                    <span>{faq.question}</span>
                    <FaChevronDown
                      className="w-6 h-6 text-white transition-transform duration-300 rounded-full p-1 bg-yellow-500 data-[state=open]:rotate-180"
                      aria-hidden
                    />
                  </AccordionTrigger>
                  <AccordionContent
                    className="p-4 text-muted-foreground bg-card rounded-b-lg overflow-hidden transition-all duration-500 ease-in-out data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
                  >
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