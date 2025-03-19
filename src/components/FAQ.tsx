"use client";

import { useState } from "react";

export default function FAQ() {
  const faqs = [
    {
      question: "Apa yang termasuk dalam paket tour?",
      answer:
        "Paket tour kami mencakup transportasi, panduan, makan, dan akomodasi. Detail lengkap akan disesuaikan dengan jenis trip yang Anda pilih.",
    },
    {
      question: "Berapa lama durasi perjalanan?",
      answer:
        "Durasi perjalanan bervariasi dari 1 hari hingga 7 hari, tergantung pada paket yang Anda pilih. Silakan cek opsi kami untuk detailnya.",
    },
    {
      question: "Apakah ada panduan berbahasa Inggris?",
      answer:
        "Ya, kami menyediakan panduan berbahasa Inggris untuk wisatawan internasional. Silakan beri tahu kami kebutuhan Anda saat pemesanan.",
    },
  ];

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">FAQ</h2>
          <p className="text-gray-600 mt-2">Frequently Asked Questions</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const [isOpen, setIsOpen] = useState(false);

            return (
              <div key={index} className="bg-white shadow-md rounded-lg">
                <button
                  className="w-full text-left p-4 text-lg font-semibold text-gray-800 flex justify-between items-center"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {faq.question}
                  <span
                    className="transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                  {">"}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}