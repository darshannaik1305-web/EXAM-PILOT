import Spinner from "./Spinner";

function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-primary text-text hover:opacity-90 shadow-sm border border-violet-500/10",
    secondary: "bg-secondary text-slate-950 hover:opacity-95 shadow-sm",
    outline: "border border-border text-text hover:bg-slate-800/40 hover:text-text",
    ghost: "text-muted hover:text-text hover:bg-slate-800/40",
    danger: "bg-danger text-text hover:bg-red-600 shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4.5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center space-x-1.5">
          <Spinner size="sm" color="current" />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
