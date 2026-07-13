import Container from "../common/Container";
import Card from "../ui/Card";
import { FileText, Cpu, LineChart, Award } from "lucide-react";

function FeaturesSection() {
  const features = [
    {
      title: "PDF Ingestion Pipeline",
      desc: "Upload official question sheets, classroom PDFs, or handwritten test templates up to 50MB.",
      icon: FileText,
    },
    {
      title: "Gemini Model Parsing",
      desc: "Google Gemini automatically parses diagrams, tabular formats, and complex LaTeX equations.",
      icon: Cpu,
    },
    {
      title: "Pacing & Speed Metrics",
      desc: "Live mock test timer keeps track of average question pacing speed compared to benchmark standards.",
      icon: LineChart,
    },
    {
      title: "Workspace Tracking",
      desc: "Centralized statistics monitoring accuracy scores, upload history lists, and test summary reports.",
      icon: Award,
    },
  ];

  return (
    <section id="features" className="py-20 md:py-24 bg-surface border-t border-b border-border">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-text font-outfit">
            Designed for High-Performance Practice
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            ExamPilot V2 matches standard competitive test conditions with advanced AI parsing helper integrations.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card key={feat.title} className="flex flex-col justify-between hover:border-slate-600 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-border flex items-center justify-center text-primary mb-5">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-base font-bold text-text mb-2.5 font-outfit">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export default FeaturesSection;
