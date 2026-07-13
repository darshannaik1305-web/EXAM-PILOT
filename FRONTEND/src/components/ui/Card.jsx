function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-card border border-border rounded-2xl shadow-sm p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
