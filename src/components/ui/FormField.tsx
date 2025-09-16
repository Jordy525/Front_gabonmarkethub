// Composant FormField optimisé avec validation intégrée
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export interface FormFieldProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'file';
  placeholder?: string;
  value?: any;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  rows?: number;
  accept?: string; // Pour les fichiers
  multiple?: boolean; // Pour les fichiers
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  hintClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  children?: React.ReactNode; // Pour les options de select personnalisées
}

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  required = false,
  disabled = false,
  readOnly = false,
  error,
  hint,
  icon,
  options = [],
  rows = 3,
  accept,
  multiple = false,
  className,
  inputClassName,
  labelClassName,
  errorClassName,
  hintClassName,
  onChange,
  onBlur,
  onFocus,
  children,
  ...props
}, ref) => {
  const hasError = !!error;
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const baseInputProps = {
    id: fieldId,
    name,
    value,
    defaultValue,
    placeholder,
    required,
    disabled,
    readOnly,
    onChange,
    onBlur,
    onFocus,
    'aria-invalid': hasError,
    'aria-describedby': cn(
      error && errorId,
      hint && hintId
    ) || undefined,
    className: cn(
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      inputClassName
    ),
    ...props
  };

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...baseInputProps}
            rows={rows}
            ref={ref as React.Ref<HTMLTextAreaElement>}
          />
        );

      case 'select':
        if (children) {
          return (
            <Select
              value={value?.toString()}
              onValueChange={(newValue) => {
                const syntheticEvent = {
                  target: { name, value: newValue }
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange?.(syntheticEvent);
              }}
              disabled={disabled}
            >
              <SelectTrigger
                className={cn(
                  hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                  inputClassName
                )}
                aria-invalid={hasError}
                aria-describedby={cn(
                  error && errorId,
                  hint && hintId
                ) || undefined}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {children}
              </SelectContent>
            </Select>
          );
        }

        return (
          <Select
            value={value?.toString()}
            onValueChange={(newValue) => {
              const syntheticEvent = {
                target: { name, value: newValue }
              } as React.ChangeEvent<HTMLSelectElement>;
              onChange?.(syntheticEvent);
            }}
            disabled={disabled}
          >
            <SelectTrigger
              className={cn(
                hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                inputClassName
              )}
              aria-invalid={hasError}
              aria-describedby={cn(
                error && errorId,
                hint && hintId
              ) || undefined}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value.toString()}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'file':
        return (
          <Input
            {...baseInputProps}
            type="file"
            accept={accept}
            multiple={multiple}
            ref={ref as React.Ref<HTMLInputElement>}
          />
        );

      default:
        return (
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {icon}
              </div>
            )}
            <Input
              {...baseInputProps}
              type={type}
              className={cn(
                icon && 'pl-10',
                baseInputProps.className
              )}
              ref={ref as React.Ref<HTMLInputElement>}
            />
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium text-gray-700',
            required && "after:content-['*'] after:text-red-500 after:ml-1",
            disabled && 'text-gray-400',
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      {renderInput()}

      {hint && !error && (
        <p
          id={hintId}
          className={cn(
            'text-sm text-gray-500',
            hintClassName
          )}
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className={cn(
            'text-sm text-red-600',
            errorClassName
          )}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// Composant wrapper pour les groupes de champs
export interface FormGroupProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className={cn(
              'text-lg font-semibold text-gray-900',
              titleClassName
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(
              'text-sm text-gray-600',
              descriptionClassName
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

// Composant pour les champs en ligne
export interface FormRowProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  className,
  cols = 2,
  gap = 'md'
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(
      'grid',
      colClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};