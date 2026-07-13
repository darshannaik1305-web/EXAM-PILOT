import { Link } from "react-router-dom";
import Container from "../common/Container";
import Button from "../common/Button";

function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-24 bg-slate-900 text-white">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full filter blur-3xl -z-10 animate-pulse motion-reduce:animate-none"></div>

      <Container className="text-center max-w-4xl">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 font-outfit">
          Ready to Turn Static PDFs Into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Interactive Mock Tests?</span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of students optimizing their pacing speed and accuracy metrics. Ingest your first PDF and start practicing immediately.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full">
              Start Practicing Free
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800">
              Login to Workspace
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}

export default CtaSection;
