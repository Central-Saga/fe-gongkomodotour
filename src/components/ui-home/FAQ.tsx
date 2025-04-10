"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
          "GET",
          "/api/landing-page-faq"
        );
        if (!response || !response.data) {
          throw new Error("Invalid response structure");
        }
        setFaqs(response.data);
      } catch (error: any) {
        console.error("Error fetching FAQs:", error.message || error);
        console.error(
          "Stack trace:",
          error.stack || "No stack trace available"
        );
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
            <h2 className="text-3xl font-bold text-foreground">
              Hight Light Question (FAQ)
            </h2>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

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
