/**
 * ActionFormField Component
 *
 * Renders a form field based on action schema property type.
 * Handles different VB data types and provides appropriate input controls.
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { VBDataType, getInputType } from '@/types/action-schema';

// =============================================================================
// INTERFACES
// =============================================================================

/** Shared props for all field controls */
interface BaseControlProps {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
  placeholder?: string;
}

/** Props for NumberControl with integer option */
interface NumberControlProps extends BaseControlProps {
  isInteger?: boolean;
}

/** Props for FieldWrapper component */
interface FieldWrapperProps {
  name: string;
  label: string;
  required?: boolean;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

/** Props for the main ActionFormField component */
interface ActionFormFieldProps {
  /** Field name (used for form data key) */
  name: string;
  /** Display label */
  label: string;
  /** VB data type */
  type: VBDataType | string;
  /** Whether field is required */
  required?: boolean;
  /** Whether field is read-only */
  readOnly?: boolean;
  /** Current field value */
  value: unknown;
  /** Callback when value changes */
  onChange: (value: unknown) => void;
  /** Field description/help text */
  description?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether field is a list */
  isList?: boolean;
  /** Custom class name */
  className?: string;
  /** Render as multi-line textarea (for string fields) */
  multiline?: boolean;
}

/** Props for ReadOnlyField component */
interface ReadOnlyFieldProps {
  label: string;
  value: unknown;
  className?: string;
}

// =============================================================================
// REUSABLE CONTROL COMPONENTS
// =============================================================================

/** Boolean checkbox control */
export function BooleanControl({ name, value, onChange, disabled }: BaseControlProps) {
  return (
    <Checkbox
      id={name}
      checked={Boolean(value)}
      onCheckedChange={(checked) => onChange(checked)}
      disabled={disabled}
    />
  );
}

/** Multi-line textarea control */
export function TextareaControl({ name, value, onChange, disabled, placeholder }: BaseControlProps) {
  return (
    <Textarea
      id={name}
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={4}
    />
  );
}

/** Numeric input control */
export function NumberControl({ name, value, onChange, disabled, placeholder, isInteger = false }: NumberControlProps) {
  return (
    <Input
      id={name}
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        if (val === '') {
          onChange(undefined);
        } else {
          onChange(isInteger ? parseInt(val, 10) : parseFloat(val));
        }
      }}
      placeholder={placeholder}
      disabled={disabled}
      step={isInteger ? 1 : 'any'}
    />
  );
}

/** Date input control */
export function DateControl({ name, value, onChange, disabled }: BaseControlProps) {
  return (
    <Input
      id={name}
      type="date"
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  );
}

/** Text input control */
export function TextControl({ name, value, onChange, disabled, placeholder }: BaseControlProps) {
  return (
    <Input
      id={name}
      type="text"
      value={String(value ?? '')}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

/** Field wrapper with label and description */
export function FieldWrapper({ name, label, required, description, className = '', children }: FieldWrapperProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label
        htmlFor={name}
        className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
      >
        {label}
      </Label>
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENTS
// =============================================================================

/**
 * Renders an appropriate input control based on VB data type
 *
 * @example
 * ```tsx
 * <ActionFormField
 *   name="reviewerComments"
 *   label="Comments"
 *   type={VBDataType.String}
 *   required={true}
 *   value={formData.reviewerComments}
 *   onChange={(value) => updateField('reviewerComments', value)}
 *   multiline={true}
 * />
 * ```
 */
export function ActionFormField({
  name,
  label,
  type,
  required = false,
  readOnly = false,
  value,
  onChange,
  description,
  placeholder,
  isList = false,
  className = '',
  multiline = false,
}: ActionFormFieldProps) {
  const inputType = getInputType(type);
  const defaultPlaceholder = placeholder || `Enter ${label.toLowerCase()}`;

  // Handle checkbox/boolean type
  if (type === VBDataType.Boolean) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <BooleanControl name={name} value={value} onChange={onChange} disabled={readOnly} />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor={name}
            className={`text-sm font-medium ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
          >
            {label}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    );
  }

  // Handle textarea for multiline strings
  if (multiline && type === VBDataType.String) {
    return (
      <FieldWrapper name={name} label={label} required={required} description={description} className={className}>
        <TextareaControl name={name} value={value} onChange={onChange} disabled={readOnly} placeholder={defaultPlaceholder} />
      </FieldWrapper>
    );
  }

  // Handle number types
  if (inputType === 'number') {
    const isInteger = [
      VBDataType.Int16,
      VBDataType.Int32,
      VBDataType.Int64,
      VBDataType.UInt16,
      VBDataType.UInt32,
      VBDataType.UInt64,
    ].includes(type as VBDataType);

    return (
      <FieldWrapper name={name} label={label} required={required} description={description} className={className}>
        <NumberControl name={name} value={value} onChange={onChange} disabled={readOnly} placeholder={defaultPlaceholder} isInteger={isInteger} />
      </FieldWrapper>
    );
  }

  // Handle date type
  if (type === VBDataType.DateOnly) {
    return (
      <FieldWrapper name={name} label={label} required={required} description={description} className={className}>
        <DateControl name={name} value={value} onChange={onChange} disabled={readOnly} />
      </FieldWrapper>
    );
  }

  // Default text input
  return (
    <FieldWrapper name={name} label={label} required={required} description={description} className={className}>
      <TextControl name={name} value={value} onChange={onChange} disabled={readOnly} placeholder={defaultPlaceholder} />
    </FieldWrapper>
  );
}

/**
 * Read-only display field for input values
 */
export function ReadOnlyField({ label, value, className = '' }: ReadOnlyFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-muted-foreground">{label}</Label>
      <div className="px-3 py-2 bg-muted rounded-md text-sm">
        {value === null || value === undefined ? (
          <span className="text-muted-foreground italic">Not provided</span>
        ) : (
          String(value)
        )}
      </div>
    </div>
  );
}
