import Card from "../ui/Card";

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <Card className="flex items-start justify-between bg-card border-border hover:border-slate-600 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative group overflow-hidden cursor-pointer select-none">
      {/* Subtle radial glow on card hover */}
      <div className="absolute -inset-px bg-gradient-to-tr from-primary/10 to-cyan-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="space-y-3.5 relative z-10">
        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{title}</span>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-text font-mono leading-none tracking-tight">
          {value}
        </h3>
        {description && (
          <p className="text-xs text-muted font-medium">
            {description}
          </p>
        )}
      </div>
      {Icon && (
        <div className="p-3.5 bg-slate-900 border border-border text-primary rounded-xl group-hover:text-cyan-400 group-hover:border-slate-600 transition-colors relative z-10">
          <Icon size={24} />
        </div>
      )}
    </Card>
  );
}

export default StatCard;
