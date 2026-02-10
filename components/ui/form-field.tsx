import * as React from "react";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible Form Field Component
 * Combines label, input, error message and hint with proper ARIA attributes
 */
export function FormField({
  id,
  label,
  required,
  error,
  hint,
  children,
  className = "",
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {React.cloneElement(children as React.ReactElement, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? "true" : undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface AccessibleInputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

/**
 * Pre-built accessible input field with label and error handling
 */
export function InputField({
  id,
  label,
  required,
  error,
  hint,
  className = "",
  ...props
}: AccessibleInputFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        aria-describedby={describedBy}
        error={!!error}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface AccessibleTextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

/**
 * Pre-built accessible textarea field with label and error handling
 */
export function TextareaField({
  id,
  label,
  required,
  error,
  hint,
  className = "",
  ...props
}: AccessibleTextareaFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={id}
        aria-describedby={describedBy}
        error={!!error}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
