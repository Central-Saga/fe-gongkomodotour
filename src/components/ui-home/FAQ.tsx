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
import { motion, AnimatePresence } from "framer-motion";

interface FAQResponse {
  data: FAQ[];
  message?: string;
  status?: string;
}

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response: FAQResponse = await apiRequest<FAQResponse>(
          'GET',
          '/api/landing-page/faq'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const faqsKiri = faqs.slice(0, Math.ceil(faqs.length / 2));
  const faqsKanan = faqs.slice(Math.ceil(faqs.length / 2));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3
      }
    },
    visible: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3
      }
    }
  };

  if (loading) {
    return (
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-30 bg-background"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-foreground">
              Hight Light Question (FAQ)
            </h2>
            <p className="text-muted-foreground mt-2">Loading...</p>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="py-30 bg-background"
    >
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-foreground mb-4">Hight Light Question (FAQ)</h2>
          <p className="text-lg text-muted-foreground">Frequently Asked Questions</p>
        </motion.div>
        <Accordion 
          type="single" 
          collapsible 
          className="w-full"
          value={activeIndex}
          onValueChange={setActiveIndex}
        >
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5"
          >
            {/* Kolom Kiri */}
            <motion.div variants={itemVariants} className="space-y-4">
              {faqsKiri.map((faq) => (
                <motion.div
                  key={faq.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-card rounded-lg shadow-md overflow-hidden"
                >
                  <AccordionItem value={`item-${faq.id}`}>
                    <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 hover:bg-accent/50 transition-colors duration-200">
                      <span>{faq.question}</span>
                      <motion.div
                        animate={{ 
                          rotate: activeIndex === `item-${faq.id}` ? 180 : 0,
                          scale: activeIndex === `item-${faq.id}` ? 1.1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className="bg-yellow-500 rounded-full p-1"
                      >
                        <FaChevronDown className="w-6 h-6 text-white" />
                      </motion.div>
                    </AccordionTrigger>
                    <AnimatePresence>
                      {activeIndex === `item-${faq.id}` && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={contentVariants}
                        >
                          <AccordionContent className="p-4 text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AccordionItem>
                </motion.div>
              ))}
            </motion.div>
            {/* Kolom Kanan */}
            <motion.div variants={itemVariants} className="space-y-4">
              {faqsKanan.map((faq) => (
                <motion.div
                  key={faq.id}
                  variants={itemVariants}
                  whileHover="hover"
                  className="bg-card rounded-lg shadow-md overflow-hidden"
                >
                  <AccordionItem value={`item-${faq.id}`}>
                    <AccordionTrigger className="text-lg font-semibold text-foreground flex justify-between items-center p-4 hover:bg-accent/50 transition-colors duration-200">
                      <span>{faq.question}</span>
                      <motion.div
                        animate={{ 
                          rotate: activeIndex === `item-${faq.id}` ? 180 : 0,
                          scale: activeIndex === `item-${faq.id}` ? 1.1 : 1
                        }}
                        transition={{ duration: 0.3 }}
                        className="bg-yellow-500 rounded-full p-1"
                      >
                        <FaChevronDown className="w-6 h-6 text-white" />
                      </motion.div>
                    </AccordionTrigger>
                    <AnimatePresence>
                      {activeIndex === `item-${faq.id}` && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          variants={contentVariants}
                        >
                          <AccordionContent className="p-4 text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AccordionItem>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </Accordion>
      </div>
    </motion.section>
  );
};

export default FAQ;
