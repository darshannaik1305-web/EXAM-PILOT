import { Search } from "lucide-react";

function SearchBar({ className = "", value, onChange, placeholder = "Search...", ...props }) {
  return (
    <div className="relative w-full">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full pl-10 pr-4 py-2.5 text-sm border border-border bg-slate-900 focus:border-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text placeholder-muted transition-all ${className}`}
        {...props}
      />
    </div>
  );
}

export default SearchBar;
