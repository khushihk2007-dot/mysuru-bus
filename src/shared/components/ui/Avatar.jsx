import React, { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export const Avatar = ({
  src,
  alt = "User avatar",
  initials,
  icon = <User className="h-4 w-4" />,
  size = "md",
  className,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const renderContent = () => {
    if (src && !hasError) {
      return (
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover rounded-full"
        />
      );
    }

    if (initials) {
      return (
        <span className="font-semibold uppercase tracking-wider text-text-secondary select-none">
          {initials.slice(0, 2)}
        </span>
      );
    }

    return <span className="text-text-secondary shrink-0">{icon}</span>;
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full bg-secondary border border-border overflow-hidden",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {renderContent()}
    </div>
  );
};

Avatar.displayName = "Avatar";
