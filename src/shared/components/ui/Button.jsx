import React from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary/90 shadow-sm",
        outline: "border border-border bg-background text-text-primary hover:bg-secondary hover:text-text-primary",
        ghost: "text-text-primary hover:bg-secondary hover:text-text-primary",
        link: "text-primary underline-offset-4 hover:underline active:scale-100 p-0 h-auto bg-transparent",
        destructive: "bg-danger text-danger-foreground hover:bg-danger/90 active:bg-danger/80 shadow-sm",
        fab: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active rounded-full shadow-lg hover:shadow-xl translate-y-0 hover:-translate-y-0.5",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm rounded-md",
        sm: "h-8 px-3 py-1.5 text-xs rounded-sm",
        lg: "h-11 px-6 py-3 text-base rounded-lg",
        icon: "h-9 w-9 rounded-md p-0",
        fab: "h-12 w-12 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export const Button = React.forwardRef(
  ({ className, variant, size, isLoading, children, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export { buttonVariants };
