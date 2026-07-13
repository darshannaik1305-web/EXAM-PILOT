import Container from "../common/Container";
import Card from "../ui/Card";
import { BrainCircuit, Milestone, Hourglass } from "lucide-react";

function AiShowcaseSection() {
  const showcases = [
    {
      title: "Interactive AI Prompts",
      desc: "Instant solution walkthroughs explaining logic, mathematical equations, and concept rules.",
      icon: BrainCircuit,
    },
    {
      title: "Diagnostic Trackers",
      desc: "Identifies weak and strong topics automatically based on completed practice runs.",
      icon: Milestone,
    },
    {
      title: "Speed Metrics Pacing",
      desc: "Simulate test timing pressure with custom question counters and active pacing analysis.",
      icon: Hourglass,
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-surface border-t border-b border-border">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-text font-outfit">
            AI-Powered Study Mentoring
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            ExamPilot V2 matches standard competitive test conditions with advanced AI parsing helpers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {showcases.map((show) => {
            const Icon = show.icon;
            return (
              <Card key={show.title} className="flex flex-col justify-between hover:border-slate-600 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-border flex items-center justify-center text-primary mb-5">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-base font-bold text-text mb-2.5 font-outfit">
                    {show.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    {show.desc}
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

export default AiShowcaseSection;
