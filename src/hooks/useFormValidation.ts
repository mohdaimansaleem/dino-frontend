import { useState, useCallback } from 'react';
import { ValidationRules, validateField, validateForm, ValidationResult } from '../utils/validation';

/**
 * Enhanced form validation hook with real-time validation and error handling
 */
export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  resetOnSubmit?: boolean;
}

export interface UseFormValidationReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  handleChange: (field: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  reset: () => void;
  submit: (onSubmit: (values: T) => Promise<void> | void) => Promise<void>;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn<T> => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSubmit = false,
  } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Set a single field value
   */
  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    // Validate on change if enabled and field has been touched
    if (validateOnChange && touched[field]) {
      const fieldRules = validationRules[field];
      if (fieldRules) {
        const result = validateField(value, fieldRules);
        setErrorsState(prev => ({
          ...prev,
          [field]: result.isValid ? undefined : result.error,
        }));
      }
    }
  }, [validationRules, touched, validateOnChange]);

  /**
   * Set multiple field values
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
    
    // Validate changed fields if enabled
    if (validateOnChange) {
      const newErrors = { ...errors };
      let hasChanges = false;
      
      for (const field in newValues) {
        if (touched[field]) {
          const fieldRules = validationRules[field];
          if (fieldRules) {
            const result = validateField(newValues[field], fieldRules);
            newErrors[field] = result.isValid ? undefined : result.error;
            hasChanges = true;
          }
        }
      }
      
      if (hasChanges) {
        setErrorsState(newErrors);
      }
    }
  }, [errors, touched, validationRules, validateOnChange]);

  /**
   * Set an error for a specific field
   */
  const setError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Clear error for a specific field
   */
  const clearError = useCallback((field: keyof T) => {
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  /**
   * Handle input change events
   */
  const handleChange = useCallback((field: keyof T) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.type === 'checkbox' 
        ? (event.target as HTMLInputElement).checked
        : event.target.value;
      setValue(field, value);
    };
  }, [setValue]);

  /**
   * Handle input blur events
   */
  const handleBlur = useCallback((field: keyof T) => {
    return () => {
      // Mark field as touched
      setTouchedState(prev => ({ ...prev, [field]: true }));
      
      // Validate on blur if enabled
      if (validateOnBlur) {
        const fieldRules = validationRules[field];
        if (fieldRules) {
          const result = validateField(values[field], fieldRules);
          setErrorsState(prev => ({
            ...prev,
            [field]: result.isValid ? undefined : result.error,
          }));
        }
      }
    };
  }, [values, validationRules, validateOnBlur]);

  /**
   * Validate a single field manually
   */
  const validateFieldManually = useCallback((field: keyof T): boolean => {
    const fieldRules = validationRules[field];
    if (!fieldRules) return true;

    const result = validateField(values[field], fieldRules);
    
    setErrorsState(prev => ({
      ...prev,
      [field]: result.isValid ? undefined : result.error,
    }));
    
    setTouchedState(prev => ({ ...prev, [field]: true }));
    
    return result.isValid;
  }, [values, validationRules]);

  /**
   * Validate all fields
   */
  const validateAll = useCallback((): boolean => {
    const result = validateForm(values, validationRules);
    
    setErrorsState(result.errors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setTouchedState(allTouched);
    
    return result.isValid;
  }, [values, validationRules]);

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Submit form with validation
   */
  const submit = useCallback(async (onSubmit: (values: T) => Promise<void> | void) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const isValid = validateAll();
      
      if (isValid) {
        await onSubmit(values);
        
        if (resetOnSubmit) {
          reset();
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateAll, values, resetOnSubmit, reset]);

  /**
   * Check if form is valid (no errors and has been validated)
   */
  const isValid = Object.keys(errors).length === 0 && Object.keys(touched).length > 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    handleChange,
    handleBlur,
    validateField: validateFieldManually,
    validateAll,
    reset,
    submit,
  };
};

/**
 * Simplified form validation hook for basic use cases
 */
export const useSimpleFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  return useFormValidation(initialValues, validationRules, {
    validateOnChange: true,
    validateOnBlur: true,
    resetOnSubmit: false,
  });
};

/**
 * Form validation hook optimized for performance (validates only on blur and submit)
 */
export const usePerformantFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>
) => {
  return useFormValidation(initialValues, validationRules, {
    validateOnChange: false,
    validateOnBlur: true,
    resetOnSubmit: false,
  });
};

export default useFormValidation;