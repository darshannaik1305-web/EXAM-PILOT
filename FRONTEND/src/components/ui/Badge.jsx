function Badge({ status }) {
  const statusConfig = {
    UPLOADING: {
      bg: "bg-amber-500/10",
      text: "text-amber-400 border-amber-500/20",
      label: "Uploading",
    },
    EXTRACTING: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-400 border-indigo-500/20",
      label: "Processing AI",
    },
    PROCESSING: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-400 border-indigo-500/20",
      label: "Processing AI",
    },
    READY: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400 border-emerald-500/20",
      label: "Ready",
    },
    FAILED: {
      bg: "bg-rose-500/10",
      text: "text-rose-400 border-rose-500/20",
      label: "Failed",
    },
  };

  const config = statusConfig[status] || {
    bg: "bg-slate-500/10",
    text: "text-slate-400 border-slate-500/20",
    label: status,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} transition-colors select-none`}>
      {config.label}
    </span>
  );
}

export default Badge;
