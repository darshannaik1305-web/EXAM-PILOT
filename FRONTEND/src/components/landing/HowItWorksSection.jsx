import Container from "../common/Container";

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "PDF Upload",
      desc: "Drag past exam question sheets directly into the workspace dropzone.",
    },
    {
      step: "02",
      title: "Gemini Parsing",
      desc: "Google Gemini models extract mathematical symbols, formulas, and structural layouts.",
    },
    {
      step: "03",
      title: "Simulate Mocks",
      desc: "Practice with custom timers, interactive widgets, and instant scoring reviews.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-24">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-text font-outfit">
            How ExamPilot Works
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            Transition from flat papers to high-fidelity timed mock practices in three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="space-y-4 border-l-2 border-border pl-6 relative">
              <div className="text-3xl font-extrabold text-primary font-mono">
                {item.step}
              </div>
              <h3 className="text-lg font-bold text-text font-outfit">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default HowItWorksSection;
