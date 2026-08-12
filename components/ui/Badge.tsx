import React from "react";

export type BadgeVariant =
  | "approved"
  | "active"
  | "published"
  | "paid"
  | "pending"
  | "under-review"
  | "rejected"
  | "cancelled"
  | "failed"
  | "need-more-documents"
  | "action-required"
  | "draft"
  | "inactive"
  | "admin"
  | "maroon"
  | "gold";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = "draft", className = "", children, ...props }: BadgeProps) {
  const variantClass = `badge-${variant}`;
  return (
    <span className={`badge-luxury ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
