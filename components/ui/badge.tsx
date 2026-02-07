interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline";
}

function Badge({ children, className = "", variant = "default" }: BadgeProps) {
  const variants = {
    default: "bg-orange-500/20 text-orange-400 border-transparent",
    secondary: "bg-slate-800 text-slate-400 border-transparent",
    outline: "border-slate-600 text-slate-400 bg-transparent",
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export { Badge };
