// components/ui-detail/DetailFAQ.tsx
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import type { FAQ } from "@/types/faqs";

interface FAQResponse {
  data: FAQ[];
  message?: string;
  status?: string;
}

const DetailFAQ = () => {
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
        setFaqs(response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

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
        className="bg-white rounded-2xl shadow-xl w-full h-[600px] p-6"
      >
        <div className="flex flex-col items-center justify-center h-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">FAQ</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-white rounded-2xl shadow-xl w-full h-[600px] p-6"
    >
      <div className="flex flex-col h-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h2 className="text-3xl font-bold text-gray-800">FAQ</h2>
        </motion.div>
        <Accordion 
          type="single" 
          collapsible 
          className="w-full flex-1 overflow-y-auto overflow-x-hidden"
          value={activeIndex}
          onValueChange={setActiveIndex}
        >
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4 pb-4"
          >
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                variants={itemVariants}
                whileHover="hover"
                className="bg-card rounded-lg shadow-md overflow-hidden"
              >
                <AccordionItem value={`item-${faq.id}`} className="border-none">
                  <AccordionTrigger className="text-base font-semibold text-foreground flex justify-between items-center px-4 py-3 hover:bg-accent/50 transition-colors duration-200">
                    <span className="text-left pr-4">{faq.question}</span>
                    <motion.div
                      animate={{ 
                        rotate: activeIndex === `item-${faq.id}` ? 180 : 0,
                        scale: activeIndex === `item-${faq.id}` ? 1.1 : 1
                      }}
                      transition={{ duration: 0.3 }}
                      className="bg-yellow-500 rounded-full p-1 flex-shrink-0"
                    >
                      <FaChevronDown className="w-4 h-4 text-white" />
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
                        <AccordionContent className="px-4 py-3 text-sm text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AccordionItem>
              </motion.div>
            ))}
          </motion.div>
        </Accordion>
      </div>
    </motion.section>
  );
};

export default DetailFAQ;