interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`glass rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h3 className={`text-lg font-semibold text-slate-100 ${className}`}>
      {children}
    </h3>
  );
}

function CardDescription({ children, className = "" }: CardProps) {
  return (
    <p className={`text-sm text-slate-400 ${className}`}>
      {children}
    </p>
  );
}

function CardContent({ children, className = "" }: CardProps) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = "" }: CardProps) {
  return (
    <div className={`flex items-center p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
