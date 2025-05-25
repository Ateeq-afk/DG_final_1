import React, { ReactNode } from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "glass" | "gradient" | "outline";
  size?: "sm" | "md" | "lg";
  withHover?: boolean;
  withAnimation?: boolean;
  animationDelay?: number;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps & MotionProps>(
  ({ 
    className, 
    children, 
    variant = "default", 
    size = "md", 
    withHover = true, 
    withAnimation = true,
    animationDelay = 0,
    ...props 
  }, ref) => {
    const variants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.4, 
          ease: [0.25, 0.1, 0.25, 1.0],
          delay: animationDelay
        }
      }
    };

    const hoverAnimation = withHover ? {
      whileHover: { 
        y: -5, 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        transition: { duration: 0.2 }
      },
      whileTap: { scale: 0.98 }
    } : {};

    const variantStyles = {
      default: "bg-white border border-gray-200",
      glass: "bg-white/80 backdrop-blur-md border border-white/20",
      gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-200",
      outline: "bg-white border-2 border-gray-200"
    };

    const sizeStyles = {
      sm: "p-4",
      md: "p-6",
      lg: "p-8"
    };

    const shadowStyles = "shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1),_0_2px_8px_-3px_rgba(0,0,0,0.05)]";

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl",
          shadowStyles,
          variantStyles[variant],
          sizeStyles[size],
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
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
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
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
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
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-4", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
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
CardFooter.displayName = "CardFooter";

export interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  color?: "blue" | "green" | "amber" | "purple" | "indigo" | "rose" | "gray";
}

export const CardIcon = React.forwardRef<HTMLDivElement, CardIconProps>(
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
      <div
        ref={ref}
        className={cn(
          "p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4",
          colorStyles[color],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardIcon.displayName = "CardIcon";