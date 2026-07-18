import { Link } from "react-router-dom";
import Container from "../common/Container";
import Button from "../ui/Button";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";

function HeroSection() {
  const steps = [
    { title: "Upload PDF", desc: "Drag & drop static papers" },
    { title: "Gemini Analysis", desc: "Extract formulas & questions" },
    { title: "Timed Practice", desc: "Simulate test conditions" },
    { title: "Performance Review", desc: "Analyze accuracy & speed" },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-primary/10 to-transparent rounded-full filter blur-3xl -z-10"></div>

      <Container className="text-center max-w-4xl">
        {/* Badge alert */}
        <div className="inline-flex items-center space-x-2 bg-slate-900 border border-border px-3.5 py-1.5 rounded-full text-xs font-semibold text-primary mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse"></span>
          <span>ExamPilot V3.1 Engine Live</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 font-outfit text-text leading-tight sm:leading-none">
          Ingest Static Exam PDFs. <br />
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Practice as Interactive Mocks.
          </span>
        </h1>

        {/* Description */}
        <p className="text-muted text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          ExamPilot uses Google's Gemini models to parse mathematical equations, complex diagrams, and chemical notations from documents, instantly generating timed mock exams.
        </p>

        {/* Dual Actions CTAs */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2 cursor-pointer py-3.5">
              <span>Start Practicing Free</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full flex items-center justify-center gap-2 cursor-pointer py-3.5 border-border hover:bg-slate-800/40 text-text">
              <Play size={14} fill="currentColor" />
              <span>Login to Workspace</span>
            </Button>
          </Link>
        </div>

        {/* Product Workflow Preview stepper */}
        <div className="border border-border bg-card rounded-2xl p-6 md:p-8 shadow-xl max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 to-cyan-500"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {steps.map((step, idx) => (
              <div key={step.title} className="space-y-2 relative">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-border text-primary flex items-center justify-center font-bold text-xs font-mono">
                    {idx + 1}
                  </div>
                  <h3 className="text-sm font-bold text-text truncate">{step.title}</h3>
                </div>
                <p className="text-xs text-muted leading-normal">{step.desc}</p>
                {/* Stepper separator lines */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-3 right-0 translate-x-1/2 w-6 border-t border-dashed border-border z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;
