function Input({ className = "", error = "", type = "text", ...props }) {
  return (
    <div className="w-full">
      <input
        type={type}
        className={`w-full border rounded-xl p-3 text-sm transition-all focus:outline-none focus:ring-2 bg-slate-900 text-text placeholder-muted ${
          error
            ? "border-danger focus:ring-danger/20"
            : "border-border focus:border-primary focus:ring-primary/20"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-danger text-xs mt-1.5 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
