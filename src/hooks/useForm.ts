// Hook personnalisé pour la gestion optimisée des formulaires
import { useState, useCallback, useRef, useEffect } from 'react';
import { useValidation, ValidationSchema } from '@/utils/validation';
import { useDebounce } from '@/utils/performance';

export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  onSubmit?: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  // Actions
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearFieldError: (field: keyof T) => void;
  clearErrors: () => void;
  resetForm: () => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  
  // Getters
  getFieldProps: (field: keyof T) => {
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  };
  getFieldError: (field: keyof T) => string;
  isFieldTouched: (field: keyof T) => boolean;
  isFieldValid: (field: keyof T) => boolean;
}

export const useForm = <T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> => {
  const {
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true,
    debounceMs = 300
  } = options;

  // États du formulaire
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation
  const validation = validationSchema ? useValidation(validationSchema) : null;
  const errors = validation?.errors || {};
  
  // Références
  const initialValuesRef = useRef(initialValues);
  const submitCountRef = useRef(0);
  
  // Valeurs debouncées pour la validation
  const debouncedValues = useDebounce(values, debounceMs);
  
  // Calculer si le formulaire est "dirty"
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
  
  // Calculer si le formulaire est valide
  const isValid = Object.keys(errors).length === 0;
  
  // Validation automatique des valeurs debouncées
  useEffect(() => {
    if (validation && validateOnChange && submitCountRef.current > 0) {
      validation.validate(debouncedValues);
    }
  }, [debouncedValues, validation, validateOnChange]);
  
  // Définir une valeur de champ
  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validation immédiate si le champ a été touché
    if (validation && validateOnChange && touched[field as string]) {
      setTimeout(() => {
        validation.validateField(field as string, value, values);
      }, 0);
    }
  }, [validation, validateOnChange, touched, values]);
  
  // Définir plusieurs valeurs
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);
  
  // Définir une erreur de champ
  const setFieldError = useCallback((field: keyof T, error: string) => {
    if (validation) {
      validation.clearFieldError(field as string);
      // Ajouter la nouvelle erreur
      const fieldErrors = { [field as string]: [error] };
      validation.validate({ ...values, ...fieldErrors });
    }
  }, [validation, values]);
  
  // Effacer l'erreur d'un champ
  const clearFieldError = useCallback((field: keyof T) => {
    if (validation) {
      validation.clearFieldError(field as string);
    }
  }, [validation]);
  
  // Effacer toutes les erreurs
  const clearErrors = useCallback(() => {
    if (validation) {
      validation.clearErrors();
    }
  }, [validation]);
  
  // Réinitialiser le formulaire
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setIsSubmitting(false);
    submitCountRef.current = 0;
    if (validation) {
      validation.clearErrors();
    }
  }, [initialValues, validation]);
  
  // Gestionnaire de changement
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    
    // Gestion des types spéciaux
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value === '' ? '' : Number(value);
    } else if (type === 'file') {
      finalValue = (e.target as HTMLInputElement).files?.[0] || null;
    }
    
    setValue(name as keyof T, finalValue);
  }, [setValue]);
  
  // Gestionnaire de blur
  const handleBlur = useCallback((
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    
    // Marquer le champ comme touché
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validation sur blur
    if (validation && validateOnBlur) {
      validation.validateField(name, values[name as keyof T], values);
    }
  }, [validation, validateOnBlur, values]);
  
  // Gestionnaire de soumission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    submitCountRef.current += 1;
    
    // Marquer tous les champs comme touchés
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    // Validation complète
    let isFormValid = true;
    if (validation) {
      isFormValid = validation.validate(values);
    }
    
    if (!isFormValid) {
      return;
    }
    
    if (!onSubmit) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validation, onSubmit]);
  
  // Obtenir les props d'un champ
  const getFieldProps = useCallback((field: keyof T) => ({
    name: field as string,
    value: values[field] || '',
    onChange: handleChange,
    onBlur: handleBlur
  }), [values, handleChange, handleBlur]);
  
  // Obtenir l'erreur d'un champ
  const getFieldError = useCallback((field: keyof T) => {
    const fieldErrors = errors[field as string];
    return fieldErrors?.[0] || '';
  }, [errors]);
  
  // Vérifier si un champ a été touché
  const isFieldTouched = useCallback((field: keyof T) => {
    return touched[field as string] || false;
  }, [touched]);
  
  // Vérifier si un champ est valide
  const isFieldValid = useCallback((field: keyof T) => {
    return !errors[field as string] || errors[field as string].length === 0;
  }, [errors]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    
    // Actions
    setValue,
    setValues: setFormValues,
    setFieldError,
    clearFieldError,
    clearErrors,
    resetForm,
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Getters
    getFieldProps,
    getFieldError,
    isFieldTouched,
    isFieldValid
  };
};

// Hook spécialisé pour les formulaires avec étapes
export const useMultiStepForm = <T extends Record<string, any>>(
  options: UseFormOptions<T> & {
    steps: string[];
    stepValidationSchemas?: Record<string, ValidationSchema>;
  }
) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { steps, stepValidationSchemas, ...formOptions } = options;
  
  // Utiliser le schéma de validation de l'étape courante
  const currentStepSchema = stepValidationSchemas?.[steps[currentStep]];
  const form = useForm({
    ...formOptions,
    validationSchema: currentStepSchema
  });
  
  const nextStep = useCallback(async () => {
    // Valider l'étape courante avant de passer à la suivante
    if (currentStepSchema) {
      const isStepValid = form.validation?.validate(form.values) || true;
      if (!isStepValid) {
        return false;
      }
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentStep, steps.length, currentStepSchema, form]);
  
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      return true;
    }
    return false;
  }, [currentStep]);
  
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      return true;
    }
    return false;
  }, [steps.length]);
  
  return {
    ...form,
    currentStep,
    currentStepName: steps[currentStep],
    totalSteps: steps.length,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    nextStep,
    prevStep,
    goToStep
  };
};