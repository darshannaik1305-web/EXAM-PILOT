function SectionHeader({ badge, title, description, align = "center", className = "" }) {
  const isCenter = align === "center";
  return (
    <div className={`mb-12 ${isCenter ? "text-center" : "text-left"} ${className}`}>
      {badge && (
        <span className="inline-block text-xs font-bold tracking-wider text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full mb-3">
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-lg text-slate-600 max-w-3xl ${isCenter ? "mx-auto" : ""}`}>
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;
