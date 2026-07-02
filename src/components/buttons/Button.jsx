/**
 * @file Button.jsx
 * @description Reusable button components mapping all required semantic variants, sizes, and states.
 * Uses design tokens for colors, spacing, radius, and animations.
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { colors } from "@/design/colors";
import { radius } from "@/design/radius";
import { animations } from "@/design/animations";
import { spacing } from "@/design/spacing";

// Class Variance Authority config linking design tokens
const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
    animations.transitions.all,
    animations.durations.veryFast,
    animations.easings.default
  ),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary/90 shadow-sm",
        outline: "border border-border bg-background text-text-primary hover:bg-secondary hover:text-text-primary",
        ghost: "text-text-primary hover:bg-secondary hover:text-text-primary",
        link: "text-primary underline-offset-4 hover:underline active:scale-100 p-0 h-auto bg-transparent",
        destructive: "bg-danger text-danger-foreground hover:bg-danger/90 active:bg-danger/80 shadow-sm",
        success: "bg-success text-success-foreground hover:bg-success/90 active:bg-success/85 shadow-sm",
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

/**
 * Core Button component supporting standard variants, loading states, and icons.
 * 
 * @param {Object} props
 * @param {string} [props.variant='primary'] - Button variant ('primary', 'secondary', 'outline', 'ghost', 'link', 'destructive', 'success', 'fab')
 * @param {string} [props.size='default'] - Button size ('default', 'sm', 'lg', 'icon', 'fab')
 * @param {boolean} [props.isLoading=false] - If true, displays spinner and disables clicks
 * @param {React.ReactNode} [props.leftIcon] - Icon to display before children
 * @param {React.ReactNode} [props.rightIcon] - Icon to display after children
 */
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

// Specific Compose Component Helper Wrappers

export const PrimaryButton = (props) => <Button variant="primary" {...props} />;
PrimaryButton.displayName = "PrimaryButton";

export const SecondaryButton = (props) => <Button variant="secondary" {...props} />;
SecondaryButton.displayName = "SecondaryButton";

export const OutlineButton = (props) => <Button variant="outline" {...props} />;
OutlineButton.displayName = "OutlineButton";

export const GhostButton = (props) => <Button variant="ghost" {...props} />;
GhostButton.displayName = "GhostButton";

export const LinkButton = (props) => <Button variant="link" {...props} />;
LinkButton.displayName = "LinkButton";

export const DestructiveButton = (props) => <Button variant="destructive" {...props} />;
DestructiveButton.displayName = "DestructiveButton";

export const SuccessButton = (props) => <Button variant="success" {...props} />;
SuccessButton.displayName = "SuccessButton";

export const IconButton = ({ icon, ...props }) => (
  <Button variant="ghost" size="icon" leftIcon={icon} {...props} />
);
IconButton.displayName = "IconButton";

export const FloatingActionButton = ({ icon, ...props }) => (
  <Button variant="fab" size="fab" leftIcon={icon} {...props} />
);
FloatingActionButton.displayName = "FloatingActionButton";

export const LoadingButton = (props) => <Button isLoading={true} {...props} />;
LoadingButton.displayName = "LoadingButton";

export const DisabledButton = (props) => <Button disabled={true} {...props} />;
DisabledButton.displayName = "DisabledButton";
