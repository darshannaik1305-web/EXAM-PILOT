import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { ArrowLeft, Clock, Rocket, ShieldAlert } from "lucide-react";

function PlaceholderPage({
  title = "Module Coming Soon",
  description = "This feature is currently in active design and will be integrated with backend services in a future release.",
  icon: Icon = Rocket,
  roadmap = [],
  status = "In Development",
  buttonText = "Return to Dashboard",
  buttonLink = "/student/workspace",
}) {
  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in duration-200">
      {/* Back button link */}
      <div>
        <Link to="/student/workspace">
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted hover:text-text pl-0 cursor-pointer">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>

      {/* Main card */}
      <Card className="p-8 relative overflow-hidden bg-card border-border shadow-xl">
        {/* Glow overlay */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full filter blur-3xl"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-border flex items-center justify-center text-primary">
              <Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-text font-outfit">
                {title}
              </h2>
              <p className="text-muted text-xs sm:text-sm mt-1 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center space-x-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-xs font-bold font-mono">
            <Clock size={12} className="animate-pulse animate-duration-1000" />
            <span>{status}</span>
          </div>
        </div>

        {/* Feature roadmap */}
        {roadmap && roadmap.length > 0 && (
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-text uppercase tracking-wider">
              Integration Roadmap
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roadmap.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 p-3.5 bg-slate-900 border border-border rounded-xl"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-4 h-4 rounded-full border border-primary text-primary flex items-center justify-center text-[9px] font-bold font-mono bg-primary/5">
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-text">{item.title}</h4>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Card */}
        <div className="flex items-start space-x-3 p-4 bg-slate-900/60 border border-border rounded-xl text-xs text-muted mb-8">
          <ShieldAlert size={16} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Note: All user session tokens and security headers are ready. When Spring Boot backend controllers are deployed, this page will be bound directly to database schemas.
          </p>
        </div>

        {/* Action Button */}
        <div>
          <Link to={buttonLink}>
            <Button variant="primary" className="px-6 py-3 cursor-pointer">
              {buttonText}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default PlaceholderPage;
