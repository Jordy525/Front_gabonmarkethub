// Système de validation centralisé
export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

export class Validator {
  // Règles de validation communes
  static rules = {
    required: (message = 'Ce champ est obligatoire'): ValidationRule => ({
      test: (value) => value !== null && value !== undefined && value !== '',
      message
    }),

    email: (message = 'Email invalide'): ValidationRule => ({
      test: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message
    }),

    minLength: (min: number, message?: string): ValidationRule => ({
      test: (value) => !value || value.length >= min,
      message: message || `Minimum ${min} caractères requis`
    }),

    maxLength: (max: number, message?: string): ValidationRule => ({
      test: (value) => !value || value.length <= max,
      message: message || `Maximum ${max} caractères autorisés`
    }),

    pattern: (regex: RegExp, message = 'Format invalide'): ValidationRule => ({
      test: (value) => !value || regex.test(value),
      message
    }),

    phone: (message = 'Numéro de téléphone invalide'): ValidationRule => ({
      test: (value) => !value || /^(\+241|241)?[0-9]{8,9}$/.test(value.replace(/\s/g, '')),
      message
    }),

    password: (message = 'Le mot de passe doit contenir au moins 6 caractères'): ValidationRule => ({
      test: (value) => !value || value.length >= 6,
      message
    }),

    numeric: (message = 'Doit être un nombre'): ValidationRule => ({
      test: (value) => !value || !isNaN(Number(value)),
      message
    }),

    positiveNumber: (message = 'Doit être un nombre positif'): ValidationRule => ({
      test: (value) => !value || (Number(value) > 0),
      message
    }),

    url: (message = 'URL invalide'): ValidationRule => ({
      test: (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message
    }),

    match: (otherField: string, message = 'Les champs ne correspondent pas'): ValidationRule => ({
      test: (value, data) => !value || value === data?.[otherField],
      message
    }),

    fileSize: (maxSizeMB: number, message?: string): ValidationRule => ({
      test: (file) => {
        if (!file || !file.size) return true;
        const maxBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxBytes;
      },
      message: message || `Fichier trop volumineux (max ${maxSizeMB}MB)`
    }),

    fileType: (allowedTypes: string[], message?: string): ValidationRule => ({
      test: (file) => {
        if (!file || !file.type) return true;
        return allowedTypes.includes(file.type);
      },
      message: message || `Type de fichier non autorisé (${allowedTypes.join(', ')})`
    })
  };

  // Valider un objet selon un schéma
  static validate(data: Record<string, any>, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string[]> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const fieldErrors: string[] = [];
      const value = data[field];

      for (const rule of rules) {
        if (!rule.test(value, data)) {
          fieldErrors.push(rule.message);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Valider un champ spécifique
  static validateField(value: any, rules: ValidationRule[], data?: Record<string, any>): string[] {
    const errors: string[] = [];

    for (const rule of rules) {
      if (!rule.test(value, data)) {
        errors.push(rule.message);
      }
    }

    return errors;
  }
}

// Schémas de validation prédéfinis
export const validationSchemas = {
  login: {
    email: [Validator.rules.required(), Validator.rules.email()],
    mot_de_passe: [Validator.rules.required()]
  },

  register: {
    email: [Validator.rules.required(), Validator.rules.email()],
    mot_de_passe: [Validator.rules.required(), Validator.rules.password()],
    confirm_password: [
      Validator.rules.required(),
      Validator.rules.match('mot_de_passe', 'Les mots de passe ne correspondent pas')
    ],
    nom: [Validator.rules.required(), Validator.rules.minLength(2)],
    prenom: [Validator.rules.minLength(2)],
    telephone: [Validator.rules.phone()]
  },

  product: {
    nom: [Validator.rules.required(), Validator.rules.minLength(3)],
    description: [Validator.rules.required(), Validator.rules.minLength(10)],
    prix: [Validator.rules.required(), Validator.rules.positiveNumber()],
    quantite_stock: [Validator.rules.required(), Validator.rules.numeric()],
    categorie_id: [Validator.rules.required()]
  },

  supplier: {
    'entreprise.nom_entreprise': [Validator.rules.required(), Validator.rules.minLength(2)],
    'entreprise.telephone_professionnel': [Validator.rules.required(), Validator.rules.phone()],
    'entreprise.secteur_activite_id': [Validator.rules.required()],
    'entreprise.type_entreprise_id': [Validator.rules.required()],
    'entreprise.adresse_ligne1': [Validator.rules.required()],
    'entreprise.ville': [Validator.rules.required()],
    'entreprise.code_postal': [Validator.rules.required()],
    'entreprise.numero_siret': [Validator.rules.required()]
  },

  profile: {
    nom: [Validator.rules.required(), Validator.rules.minLength(2)],
    prenom: [Validator.rules.minLength(2)],
    telephone: [Validator.rules.phone()],
    email: [Validator.rules.required(), Validator.rules.email()]
  }
};

// Hook React pour la validation
import { useState, useCallback } from 'react';

export const useValidation = (schema: ValidationSchema) => {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validate = useCallback((data: Record<string, any>) => {
    const result = Validator.validate(data, schema);
    setErrors(result.errors);
    return result.isValid;
  }, [schema]);

  const validateField = useCallback((field: string, value: any, data?: Record<string, any>) => {
    const rules = schema[field];
    if (!rules) return [];

    const fieldErrors = Validator.validateField(value, rules, data);
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors
    }));

    return fieldErrors;
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0,
    getFieldError: (field: string) => errors[field]?.[0] || ''
  };
};

// Utilitaires pour les messages d'erreur
export const formatValidationErrors = (errors: Record<string, string[]>): string => {
  return Object.entries(errors)
    .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
    .join('\n');
};

export const getFirstError = (errors: Record<string, string[]>): string => {
  const firstField = Object.keys(errors)[0];
  return firstField ? errors[firstField][0] : '';
};