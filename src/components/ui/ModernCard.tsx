import React, { ReactNode } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "glass" | "gradient" | "elevated" | "bordered";
  color?: "default" | "blue" | "green" | "purple" | "amber" | "rose";
  withHover?: boolean;
  withAnimation?: boolean;
  animationDelay?: number;
}

export const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps & MotionProps>(
  ({ 
    className, 
    children, 
    variant = "default", 
    color = "default",
    withHover = true, 
    withAnimation = true,
    animationDelay = 0,
    ...props 
  }, ref) => {
    // Entrance animation
    const variants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.3, 
          ease: [0.22, 1, 0.36, 1],
          delay: animationDelay
        }
      }
    };

    // Hover animation
    const hoverAnimation = withHover ? {
      whileHover: { 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 17 
        }
      },
      whileTap: { 
        scale: 0.98,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 10 
        }
      }
    } : {};

    // Variant styles
    const variantStyles = {
      default: "bg-white border border-gray-200",
      glass: "bg-white/80 backdrop-blur-lg border border-white/20",
      gradient: getGradientStyle(color),
      elevated: "bg-white border border-gray-100",
      bordered: getBorderedStyle(color)
    };

    // Shadow styles based on variant
    const shadowStyles = variant === "elevated" 
      ? "shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1),_0_10px_10px_-5px_rgba(0,0,0,0.04)]"
      : "shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1),_0_2px_8px_-3px_rgba(0,0,0,0.05)]";

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl p-6",
          shadowStyles,
          variantStyles[variant],
          "transition-all duration-300 ease-out",
          className
        )}
        initial={withAnimation ? "hidden" : undefined}
        animate={withAnimation ? "visible" : undefined}
        variants={variants}
        {...hoverAnimation}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ModernCard.displayName = "ModernCard";

// Helper function to get gradient style based on color
function getGradientStyle(color: string): string {
  switch (color) {
    case "blue":
      return "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100";
    case "green":
      return "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100";
    case "purple":
      return "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100";
    case "amber":
      return "bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100";
    case "rose":
      return "bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100";
    default:
      return "bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200";
  }
}

// Helper function to get bordered style based on color
function getBorderedStyle(color: string): string {
  switch (color) {
    case "blue":
      return "bg-white border-2 border-blue-200";
    case "green":
      return "bg-white border-2 border-green-200";
    case "purple":
      return "bg-white border-2 border-purple-200";
    case "amber":
      return "bg-white border-2 border-amber-200";
    case "rose":
      return "bg-white border-2 border-rose-200";
    default:
      return "bg-white border-2 border-gray-200";
  }
}

export interface ModernCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const ModernCardContent = React.forwardRef<HTMLDivElement, ModernCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModernCardContent.displayName = "ModernCardContent";

export interface ModernCardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  color?: "blue" | "green" | "amber" | "purple" | "indigo" | "rose" | "gray";
}

export const ModernCardIcon = React.forwardRef<HTMLDivElement, ModernCardIconProps>(
  ({ className, children, color = "blue", ...props }, ref) => {
    const colorStyles = {
      blue: "bg-blue-50 text-blue-600",
      green: "bg-green-50 text-green-600",
      amber: "bg-amber-50 text-amber-600",
      purple: "bg-purple-50 text-purple-600",
      indigo: "bg-indigo-50 text-indigo-600",
      rose: "bg-rose-50 text-rose-600",
      gray: "bg-gray-100 text-gray-600"
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4",
          colorStyles[color],
          className
        )}
        whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
ModernCardIcon.displayName = "ModernCardIcon";

export interface ModernCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const ModernCardTitle = React.forwardRef<HTMLHeadingElement, ModernCardTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          "text-xl font-bold tracking-tight text-gray-900",
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
ModernCardTitle.displayName = "ModernCardTitle";

export interface ModernCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const ModernCardDescription = React.forwardRef<HTMLParagraphElement, ModernCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn("text-sm text-gray-500 mt-1", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);
ModernCardDescription.displayName = "ModernCardDescription";

export interface ModernCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const ModernCardFooter = React.forwardRef<HTMLDivElement, ModernCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-6 flex items-center", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ModernCardFooter.displayName = "ModernCardFooter";