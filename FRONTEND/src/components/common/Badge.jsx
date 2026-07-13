function Badge({ status }) {
  const statusConfig = {
    UPLOADING: {
      bg: "bg-amber-50",
      text: "text-amber-700 border-amber-200/50",
      label: "Uploading",
    },
    EXTRACTING: {
      bg: "bg-indigo-50",
      text: "text-indigo-700 border-indigo-200/50",
      label: "Processing AI",
    },
    READY: {
      bg: "bg-emerald-50",
      text: "text-emerald-700 border-emerald-200/50",
      label: "Ready to Practice",
    },
    FAILED: {
      bg: "bg-rose-50",
      text: "text-rose-700 border-rose-200/50",
      label: "Failed",
    },
  };

  const config = statusConfig[status] || {
    bg: "bg-slate-50",
    text: "text-slate-600 border-slate-200/50",
    label: status,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} transition-colors`}>
      {config.label}
    </span>
  );
}

export default Badge;
