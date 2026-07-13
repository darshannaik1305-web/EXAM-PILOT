function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
