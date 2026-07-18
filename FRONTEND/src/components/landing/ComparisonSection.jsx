import { Check, X } from "lucide-react";
import Container from "../common/Container";
import SectionHeader from "../common/SectionHeader";

function ComparisonSection() {
  const traditionalPoints = [
    "Untracked practice time (no pacing gauges)",
    "Manual answer grading (matching letters to keys page-by-page)",
    "No explanation support for wrong answers",
    "Untracked topic performance (cannot identify weaknesses)",
    "Repeating entire exam papers just to practice specific topics",
  ];

  const exampilotPoints = [
    "Automatic timed mock simulations with active pacing alerts",
    "Immediate interactive grading with visual option diffs",
    "Gemini-extracted step-by-step mathematical & logical explanations",
    "Heat maps displaying subject-level accuracy weaknesses",
    "Adaptive 5-question mini-tests targeting weak subjects",
  ];

  return (
    <section id="why-us" className="py-20 md:py-28 bg-slate-50">
      <Container>
        <SectionHeader
          badge="Why ExamPilot"
          title="Traditional PDFs vs. AI-Powered Mock Practice"
          description="Understand the difference between static past paper files and a modern learning feedback loop."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Traditional Card */}
          <div className="p-8 rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <X size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Traditional Past Papers
              </h3>
            </div>
            <ul className="space-y-4 flex-1">
              {traditionalPoints.map((point) => (
                <li key={point} className="flex items-start text-slate-500 text-sm sm:text-base">
                  <span className="text-rose-500 mr-2.5 mt-1 font-bold">✕</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ExamPilot Card */}
          <div className="p-8 rounded-2xl border border-indigo-100 bg-white shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col relative overflow-hidden">
            {/* Top border decoration */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500"></div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Check size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                ExamPilot AI Platform
              </h3>
            </div>
            <ul className="space-y-4 flex-1">
              {exampilotPoints.map((point) => (
                <li key={point} className="flex items-start text-slate-700 text-sm sm:text-base">
                  <span className="text-emerald-500 mr-2.5 mt-0.5 font-bold">✓</span>
                  <span className="font-medium">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default ComparisonSection;
