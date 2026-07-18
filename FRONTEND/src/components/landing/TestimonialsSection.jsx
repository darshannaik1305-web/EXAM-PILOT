import Container from "../common/Container";
import Card from "../ui/Card";
import { Star } from "lucide-react";

function TestimonialsSection() {
  const reviews = [
    {
      name: "Abhishek K.",
      role: "Exam Candidate",
      initials: "AK",
      text: "ExamPilot's Gemini-driven parsing resolved algebraic and LaTeX formulas from my PDFs flawlessly. The timer pacing metric changed how I practice.",
    },
    {
      name: "Sneha M.",
      role: "Pre-Med Student",
      initials: "SM",
      text: "Ingesting biology sample papers takes seconds. Being able to review step-by-step solutions instantly on diagrams has saved me hours of manual study.",
    },
    {
      name: "Varun S.",
      role: "College Candidate",
      initials: "VS",
      text: "The dark theme interface looks premium and professional. It feels like actual competitive testing portal setups. A must-have tool.",
    },
  ];

  return (
    <section className="py-20 md:py-24">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-text font-outfit">
            Aspirant Testimonials
          </h2>
          <p className="text-muted text-sm sm:text-base leading-relaxed">
            Here is how competitive exam candidates are leveraging ExamPilot to streamline their test preparation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <Card key={rev.name} className="flex flex-col justify-between hover:border-slate-600 transition-colors">
              <p className="text-xs sm:text-sm text-muted leading-relaxed italic mb-6">
                "{rev.text}"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-border text-primary flex items-center justify-center font-bold text-xs">
                  {rev.initials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text">{rev.name}</h4>
                  <p className="text-[10px] text-muted font-medium">{rev.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default TestimonialsSection;
