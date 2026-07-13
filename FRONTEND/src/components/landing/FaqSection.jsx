import { useState } from "react";
import Container from "../common/Container";
import Card from "../ui/Card";
import { ChevronDown, ChevronUp } from "lucide-react";

function FaqSection() {
  const faqs = [
    {
      q: "How does the AI extract math formulas and diagrams from my PDF?",
      a: "ExamPilot integrates Google's Gemini models. The pipeline uploads your document securely and reads raw context parameters, converting math notation, diagrams, and structures into dynamic mock formats.",
    },
    {
      q: "Is there a limit on the file size of PDF documents I can upload?",
      a: "Yes. To ensure fast, server-side processing speeds and avoid API timeouts, we limit uploads to a maximum of 50MB per PDF document.",
    },
    {
      q: "Can I review explanation logs after completing a timed practice session?",
      a: "Absolutely. Once mock tests are completed, the workspace summarizes score metrics and makes step-by-step AI explanation tutorials accessible.",
    },
  ];

  const [openIdx, setOpenIdx] = useState(null);

  function toggleFaq(idx) {
    setOpenIdx(openIdx === idx ? null : idx);
  }

  return (
    <section id="faq" className="py-20 md:py-24 bg-surface border-t border-border">
      <Container className="max-w-3xl">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-text font-outfit">
            Frequently Asked Questions
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            Quick responses to questions about PDF parsing and active simulation practices.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Card
                key={idx}
                className="p-4 cursor-pointer hover:border-slate-600 transition-colors"
                onClick={() => toggleFaq(idx)}
              >
                <div className="flex justify-between items-center gap-4">
                  <h3 className="text-sm sm:text-base font-bold text-text font-outfit">
                    {faq.q}
                  </h3>
                  <button className="text-muted hover:text-text focus:outline-none">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-muted mt-3 leading-relaxed border-t border-border/40 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default FaqSection;
