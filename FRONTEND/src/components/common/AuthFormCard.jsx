import { Link } from "react-router-dom";

function AuthFormCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="bg-card p-8 rounded-2xl border border-border shadow-xl w-full max-w-md relative overflow-hidden">
        {/* Decorative Top Accent Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 to-cyan-500"></div>

        {/* Branding Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent font-outfit">
              ExamPilot
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-text mt-4 font-outfit">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted text-sm mt-1.5 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Form slot */}
        {children}
      </div>
    </div>
  );
}

export default AuthFormCard;
