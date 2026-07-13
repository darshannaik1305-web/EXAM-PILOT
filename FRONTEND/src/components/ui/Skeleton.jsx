function Skeleton({ className = "", variant = "rect", ...props }) {
  const variantClasses = {
    rect: "rounded-xl",
    circle: "rounded-full",
    text: "rounded h-4 w-full",
  };

  return (
    <div
      className={`animate-pulse bg-slate-800/80 motion-reduce:animate-none ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export default Skeleton;
