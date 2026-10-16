import {
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from 'react';
interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  id: string;
}
export function Field({ label, hint, error, children, required = false, id }: FieldProps) {
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
type FeedbackProps = { label: string; hint?: string; error?: string };
export function Input({
  label,
  hint,
  error,
  id: providedId,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & FeedbackProps) {
  const generated = useId(),
    id = providedId || generated;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={props.required}>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
    </Field>
  );
}
export function Select({
  label,
  hint,
  error,
  id: providedId,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & FeedbackProps) {
  const generated = useId(),
    id = providedId || generated;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={props.required}>
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}
export function Textarea({
  label,
  hint,
  error,
  id: providedId,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FeedbackProps) {
  const generated = useId(),
    id = providedId || generated;
  return (
    <Field id={id} label={label} hint={hint} error={error} required={props.required}>
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
    </Field>
  );
}
