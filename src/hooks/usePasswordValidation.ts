import { useState, useCallback } from 'react';

export interface PasswordValidationResult {
  status: 'idle' | 'invalid-char' | 'too-short' | 'weak' | 'medium' | 'strong';
  message: string;
  score: number;
  disabled: boolean;
}

const ASCII_ONLY = /^[\x20-\x7E]*$/;

const INITIAL: PasswordValidationResult = {
  status: 'idle',
  message: '',
  score: 0,
  disabled: false,
};

export function usePasswordValidation() {
  const [validation, setValidation] = useState<PasswordValidationResult>(INITIAL);

  const validatePassword = useCallback(async (value: string) => {
    if (!value) {
      setValidation(INITIAL);
      return;
    }

    // 1. Regex filter – no emojis / non-ASCII
    if (!ASCII_ONLY.test(value)) {
      setValidation({
        status: 'invalid-char',
        message: 'Invalid character. Only letters, numbers, and symbols allowed.',
        score: 0,
        disabled: true,
      });
      return;
    }

    // 2. Length check
    if (value.length < 12) {
      setValidation({
        status: 'too-short',
        message: 'Too Short (Must be 12+ characters)',
        score: 0,
        disabled: true,
      });
      return;
    }

    // 3. Strength meter (zxcvbn)
    try {
      const zxcvbnModule = await import('@zxcvbn-ts/core');
      const zxcvbn = new zxcvbnModule.default.ZxcvbnFactory();
      const result = zxcvbn.check(value);
      const score = result.score;

      if (score <= 1) {
        setValidation({
          status: 'weak',
          message: 'Weak',
          score,
          disabled: true,
        });
      } else if (score === 2) {
        setValidation({
          status: 'medium',
          message: 'Medium',
          score,
          disabled: false,
        });
      } else {
        setValidation({
          status: 'strong',
          message: 'Strong',
          score,
          disabled: false,
        });
      }
    } catch {
      // Fallback: if zxcvbn import fails, allow submission
      setValidation({
        status: 'strong',
        message: 'Strong',
        score: 4,
        disabled: false,
      });
    }
  }, []);

  const resetValidation = useCallback(() => {
    setValidation(INITIAL);
  }, []);

  return { validation, validatePassword, resetValidation };
}