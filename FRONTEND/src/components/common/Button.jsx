function Button({
  children,
  text,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  bgColor = "", // Support legacy prop
  className = "",
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus-visible:outline-visible focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]";

  const variantStyles = {
    primary: bgColor ? `${bgColor} text-white shadow-md` : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:shadow-indigo-500/20 active:opacity-90",
    secondary: bgColor ? `${bgColor} text-white` : "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    ghost: "text-slate-600 hover:bg-slate-50",
    danger: "bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {text || children}
    </button>
  );
}

export default Button;