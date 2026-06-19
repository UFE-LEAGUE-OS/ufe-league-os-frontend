export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues | 'form', string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordLengthRange = { min: 8, max: 32 };

export const nameMaxLength = 150;

type RegisterErrorField = keyof RegisterFormValues | 'form';

const backendFieldMap: Record<string, RegisterErrorField> = {
  first_name: 'firstName',
  last_name: 'lastName',
  phone_number: 'phoneNumber',
  email: 'email',
  password: 'password',
  confirm_password: 'confirmPassword',
  non_field_errors: 'form',
  detail: 'form',
};

function collectErrorMessages(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectErrorMessages);
  }

  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).flatMap(collectErrorMessages);
  }

  return [];
}

export function mapRegisterApiErrors(responseData: unknown): RegisterFormErrors {
  if (!responseData || typeof responseData !== 'object' || Array.isArray(responseData)) {
    return {};
  }

  const errors: RegisterFormErrors = {};

  for (const [key, value] of Object.entries(responseData as Record<string, unknown>)) {
    const message = collectErrorMessages(value).join(' ');

    if (!message) {
      continue;
    }

    const field = backendFieldMap[key] ?? 'form';
    errors[field] = errors[field] ? `${errors[field]} ${message}` : message;
  }

  return errors;
}

export function normalizePhoneInput(value: string) {
  return value.replace(/[^\d\s-]/g, '');
}

export function buildPhoneNumber(countryCode: string, phoneNumber: string) {
  const countryDigits = countryCode.replace(/\D/g, '');
  let digits = phoneNumber.replace(/\D/g, '');

  if (digits.startsWith(countryDigits)) {
    digits = digits.slice(countryDigits.length);
  }

  digits = digits.replace(/^0+/, '');

  return `${countryCode}${digits}`;
}

export function validateRegisterForm(values: RegisterFormValues) {
  const errors: RegisterFormErrors = {};

  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim().toLowerCase();
  const phoneDigits = values.phoneNumber.replace(/\D/g, '');
  const password = values.password;
  const confirmPassword = values.confirmPassword;

  if (!firstName) {
    errors.firstName = 'First name is required.';
  } else if (firstName.length > nameMaxLength) {
    errors.firstName = `First name must be ${nameMaxLength} characters or fewer.`;
  }

  if (!lastName) {
    errors.lastName = 'Last name is required.';
  } else if (lastName.length > nameMaxLength) {
    errors.lastName = `Last name must be ${nameMaxLength} characters or fewer.`;
  }

  if (!phoneDigits) {
    errors.phoneNumber = 'Phone number is required.';
  } else if (!/^\d+$/.test(phoneDigits)) {
    errors.phoneNumber = 'Phone number can contain digits only.';
  } else if (phoneDigits.length < 7 || phoneDigits.length > 12) {
    errors.phoneNumber = 'Phone number must be 7 to 12 digits long.';
  }

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (email.length > 254) {
    errors.email = 'Email address is too long.';
  } else if (!emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < passwordLengthRange.min) {
    errors.password = `Password must be at least ${passwordLengthRange.min} characters.`;
  } else if (password.length > passwordLengthRange.max) {
    errors.password = `Password must be ${passwordLengthRange.max} characters or fewer.`;
  } else if (!/[a-z]/.test(password)) {
    errors.password = 'Password must include at least one lowercase letter.';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must include at least one uppercase letter.';
  } else if (!/\d/.test(password)) {
    errors.password = 'Password must include at least one number.';
  } else if (!/[^\w\s]/.test(password)) {
    errors.password = 'Password must include at least one special character.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (password && confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!values.termsAccepted) {
    errors.termsAccepted = 'You must agree to the terms to continue.';
  }

  return errors;
}