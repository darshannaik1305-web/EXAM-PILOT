import Container from "../common/Container";

function TrustedBySection() {
  const stats = [
    { value: "48,000+", label: "Practice Papers Processed", description: "Competitive exam PDFs successfully parsed" },
    { value: "99.4%", label: "Gemini Model Parsing Accuracy", description: "Near-flawless structure and answer key extraction" },
    { value: "18 Minutes", label: "Average Time Saved", description: "Eliminated manual answer key matching per test" },
    { value: "24%", label: "Average Score Improvement", description: "Measured score increase over 8 weeks of targeted practice" },
  ];

  return (
    <section className="bg-slate-900 text-slate-100 py-12 border-y border-slate-800">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent font-outfit">
                {stat.value}
              </span>
              <span className="mt-2 text-sm sm:text-base font-semibold text-slate-200">
                {stat.label}
              </span>
              <span className="mt-1 text-xs text-slate-400 max-w-[200px]">
                {stat.description}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default TrustedBySection;
