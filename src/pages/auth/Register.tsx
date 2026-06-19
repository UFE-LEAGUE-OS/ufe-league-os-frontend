import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import leagueBanner from '../../assets/league-os-mark.svg';
import { AuthTopBar, PageShell } from '../../components/site/LeagueUI.js';
import { register as registerAccount } from '../../services/authService.js';
import {
  buildPhoneNumber,
  mapRegisterApiErrors,
  nameMaxLength,
  normalizePhoneInput,
  validateRegisterForm,
  type RegisterFormErrors,
  type RegisterFormValues,
} from './registerUtils.js';
import { usePasswordValidation } from '../../hooks/usePasswordValidation.js';
import '../../styles/pages/register.css';

const features = [
  {
    title: 'Follow Your Teams',
    copy: 'Get updates on your favorite teams and players.',
    tone: 'feature-purple',
    icon: GroupsOutlinedIcon,
  },
  {
    title: 'Live Scores & Updates',
    copy: 'Real-time scores, results and match highlights.',
    tone: 'feature-orange',
    icon: EmojiEventsOutlinedIcon,
  },
  {
    title: 'Never Miss a Moment',
    copy: 'Personalized schedules and important alerts.',
    tone: 'feature-blue',
    icon: EventNoteOutlinedIcon,
  },
];

const menu = [
  'Sport',
  'Leagues',
  'Teams',
  'Competitions',
  'News',
  'Membership',
  'Tickets',
];

const phoneCountries = [
  { code: '+256', label: 'Uganda' },
  { code: '+254', label: 'Kenya' },
  { code: '+255', label: 'Tanzania' },
  { code: '+250', label: 'Rwanda' },
  { code: '+257', label: 'Burundi' },
];

const initialFormValues: RegisterFormValues = {
  firstName: '',
  lastName: '',
  countryCode: '+256',
  phoneNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  termsAccepted: false,
};

function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <span className="field-icon-ghost" aria-hidden="true">
      {children}
    </span>
  );
}

function PasswordStrengthIndicator({
  status,
  message,
  score,
}: {
  status: string;
  message: string;
  score: number;
}) {
  if (!status || status === 'idle') return null;

  const statusClass = `status-${status}`;

  return (
    <div className={`password-status ${statusClass}`}>
      <span className="password-status-text">{message}</span>
      {status === 'medium' || status === 'strong' ? (
        <div className="password-strength-bar" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`password-strength-bar-segment${i <= score ? ' active' : ''}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [formValues, setFormValues] =
    useState<RegisterFormValues>(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState<RegisterFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const { validation, validatePassword } = usePasswordValidation();
  const canSubmit = !isSubmitting && !validation.disabled;

  const isFormEmpty =
    !formValues.firstName.trim() &&
    !formValues.lastName.trim() &&
    !formValues.phoneNumber.trim() &&
    !formValues.email.trim() &&
    !formValues.password &&
    !formValues.confirmPassword;

  const updateField = <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));

    setSubmitMessage('');

    setFieldErrors((current) => {
      const nextErrors = { ...current };

      delete nextErrors.form;
      delete nextErrors[field];

      if (field === 'password' || field === 'confirmPassword') {
        delete nextErrors.password;
        delete nextErrors.confirmPassword;
      }

      if (field === 'phoneNumber' || field === 'countryCode') {
        delete nextErrors.phoneNumber;
      }

      return nextErrors;
    });

    if (field === 'password' && typeof value === 'string') {
      void validatePassword(value);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateRegisterForm(formValues);

    setFieldErrors(nextErrors);
    setSubmitMessage('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (validation.disabled) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        first_name: formValues.firstName.trim(),
        last_name: formValues.lastName.trim(),
        phone_number: buildPhoneNumber(
          formValues.countryCode,
          formValues.phoneNumber,
        ),
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
        confirm_password: formValues.confirmPassword,
      };

      await registerAccount(payload);

      navigate('/personalize', {
        replace: true,
        state: {
          email: payload.email,
        },
      });
    } catch (error) {
      const isTimeoutError =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'ECONNABORTED';

      if (isTimeoutError) {
        setSubmitMessage(
          'The registration request timed out. Please try again in a moment.',
        );
        return;
      }

      const responseData = (error as { response?: { data?: unknown } })
        ?.response?.data;

      const apiErrors = mapRegisterApiErrors(responseData);

      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors);
        return;
      }

      setSubmitMessage(
        'We could not complete registration right now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell className="register-page">
      <AuthTopBar menuItems={menu} />

      <main className="register-main" id="register">
        <section className="register-story">
          <div className="register-story-copy">
            <h1>
              <span className="register-story-title">Join League OS</span>
              <span>Be Part of Uganda's Game.</span>
            </h1>

            <p>
              Create your account and unlock the ultimate sports experience.
              Follow. Engage. Support.
            </p>
          </div>

          <div className="register-feature-list">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className={`register-feature ${feature.tone}`}
                >
                  <span className="feature-icon" aria-hidden="true">
                    <Icon className="feature-icon-svg" />
                  </span>

                  <div>
                    <strong>{feature.title}</strong>
                    <p>{feature.copy}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="register-panel">
          <div className="register-panel-inner">
            <div className="register-panel-header">
              <div className="register-panel-copy">
                <h2>
                  Create Your <span>Account</span>
                </h2>

                <p>Join the League OS community and be part of the action.</p>
              </div>

              <div className="register-panel-logo">
                <img
                  src={leagueBanner}
                  alt="League OS"
                  className="register-panel-banner"
                />
              </div>
            </div>

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="field-grid">
                <label
                  className={fieldErrors.firstName ? 'has-error' : undefined}
                  htmlFor="register-first-name"
                >
                  First name

                  <div className="field-shell">
                    <FieldIcon>
                      <PersonOutlinedIcon />
                    </FieldIcon>

                    <input
                      id="register-first-name"
                      name="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      autoComplete="given-name"
                      maxLength={nameMaxLength}
                      value={formValues.firstName}
                      onChange={(event) =>
                        updateField('firstName', event.target.value)
                      }
                      aria-invalid={Boolean(fieldErrors.firstName)}
                      aria-describedby={
                        fieldErrors.firstName
                          ? 'register-first-name-error'
                          : undefined
                      }
                    />
                  </div>

                  {fieldErrors.firstName ? (
                    <span
                      id="register-first-name-error"
                      className="field-error"
                      role="alert"
                    >
                      {fieldErrors.firstName}
                    </span>
                  ) : null}
                </label>

                <label
                  className={fieldErrors.lastName ? 'has-error' : undefined}
                  htmlFor="register-last-name"
                >
                  Last name

                  <div className="field-shell">
                    <FieldIcon>
                      <PersonOutlinedIcon />
                    </FieldIcon>

                    <input
                      id="register-last-name"
                      name="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      autoComplete="family-name"
                      maxLength={nameMaxLength}
                      value={formValues.lastName}
                      onChange={(event) =>
                        updateField('lastName', event.target.value)
                      }
                      aria-invalid={Boolean(fieldErrors.lastName)}
                      aria-describedby={
                        fieldErrors.lastName
                          ? 'register-last-name-error'
                          : undefined
                      }
                    />
                  </div>

                  {fieldErrors.lastName ? (
                    <span
                      id="register-last-name-error"
                      className="field-error"
                      role="alert"
                    >
                      {fieldErrors.lastName}
                    </span>
                  ) : null}
                </label>
              </div>

              <label
                className={fieldErrors.phoneNumber ? 'has-error' : undefined}
                htmlFor="register-phone-number"
              >
                Phone number

                <div className="phone-input">
                  <select
                    className="phone-country"
                    id="register-country-code"
                    name="countryCode"
                    value={formValues.countryCode}
                    onChange={(event) =>
                      updateField('countryCode', event.target.value)
                    }
                    aria-label="Country code"
                  >
                    {phoneCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.label} {country.code}
                      </option>
                    ))}
                  </select>

                  <span className="field-divider" aria-hidden="true">
                    <KeyboardArrowDownIcon />
                  </span>

                  <input
                    id="register-phone-number"
                    name="phoneNumber"
                    type="tel"
                    placeholder="7XX XXX XXX"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={formValues.phoneNumber}
                    onChange={(event) =>
                      updateField(
                        'phoneNumber',
                        normalizePhoneInput(event.target.value),
                      )
                    }
                    aria-invalid={Boolean(fieldErrors.phoneNumber)}
                    aria-describedby={
                      fieldErrors.phoneNumber
                        ? 'register-phone-number-error'
                        : undefined
                    }
                  />
                </div>

                {fieldErrors.phoneNumber ? (
                  <span
                    id="register-phone-number-error"
                    className="field-error"
                    role="alert"
                  >
                    {fieldErrors.phoneNumber}
                  </span>
                ) : null}
              </label>

              <label
                className={fieldErrors.email ? 'has-error' : undefined}
                htmlFor="register-email"
              >
                Email address

                <div className="field-shell">
                  <FieldIcon>
                    <MailOutlinedIcon />
                  </FieldIcon>

                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={formValues.email}
                    onChange={(event) =>
                      updateField('email', event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? 'register-email-error' : undefined
                    }
                  />
                </div>

                {fieldErrors.email ? (
                  <span
                    id="register-email-error"
                    className="field-error"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </span>
                ) : null}
              </label>

              <label
                className={fieldErrors.password ? 'has-error' : undefined}
                htmlFor="register-password"
              >
                Password

                <div className="password-field">
                  <FieldIcon>
                    <LockOutlinedIcon />
                  </FieldIcon>

                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    value={formValues.password}
                    onChange={(event) =>
                      updateField('password', event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={
                      fieldErrors.password
                        ? 'register-password-error'
                        : undefined
                    }
                  />

                  <button
                    type="button"
                    className="field-icon"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                    aria-pressed={showPassword}
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                  >
                    {showPassword ? (
                      <VisibilityOutlinedIcon />
                    ) : (
                      <VisibilityOffOutlinedIcon />
                    )}
                  </button>
                </div>

                <PasswordStrengthIndicator
                  status={validation.status}
                  message={validation.message}
                  score={validation.score}
                />

                {fieldErrors.password ? (
                  <span
                    id="register-password-error"
                    className="field-error"
                    role="alert"
                  >
                    {fieldErrors.password}
                  </span>
                ) : null}
              </label>

              <label
                className={
                  fieldErrors.confirmPassword ? 'has-error' : undefined
                }
                htmlFor="register-confirm-password"
              >
                Confirm password

                <div className="password-field">
                  <FieldIcon>
                    <LockOutlinedIcon />
                  </FieldIcon>

                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    value={formValues.confirmPassword}
                    onChange={(event) =>
                      updateField('confirmPassword', event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.confirmPassword)}
                    aria-describedby={
                      fieldErrors.confirmPassword
                        ? 'register-confirm-password-error'
                        : undefined
                    }
                  />

                  <button
                    type="button"
                    className="field-icon"
                    aria-label={
                      showConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                    aria-pressed={showConfirmPassword}
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                  >
                    {showConfirmPassword ? (
                      <VisibilityOutlinedIcon />
                    ) : (
                      <VisibilityOffOutlinedIcon />
                    )}
                  </button>
                </div>

                {fieldErrors.confirmPassword ? (
                  <span
                    id="register-confirm-password-error"
                    className="field-error"
                    role="alert"
                  >
                    {fieldErrors.confirmPassword}
                  </span>
                ) : null}
              </label>

              <label className="terms-row">
                <input
                  type="checkbox"
                  checked={formValues.termsAccepted}
                  onChange={(event) =>
                    updateField('termsAccepted', event.target.checked)
                  }
                  aria-invalid={Boolean(fieldErrors.termsAccepted)}
                  aria-describedby={
                    fieldErrors.termsAccepted
                      ? 'register-terms-error'
                      : undefined
                  }
                />

                <span>
                  I agree to the <a href="#register">Terms of Service</a> and{' '}
                  <a href="#register">Privacy Policy</a>.
                </span>
              </label>

              {fieldErrors.termsAccepted ? (
                <span
                  id="register-terms-error"
                  className="field-error terms-error"
                  role="alert"
                >
                  {fieldErrors.termsAccepted}
                </span>
              ) : null}

              {fieldErrors.form ? (
                <p className="register-form-message" role="alert">
                  {fieldErrors.form}
                </p>
              ) : null}

              {submitMessage ? (
                <p className="register-form-message" role="alert">
                  {submitMessage}
                </p>
              ) : null}

              <button
                type="submit"
                className={`button button-primary button-full register-submit ${
                  isFormEmpty ? 'register-submit-empty' : ''
                }`.trim()}
                disabled={!canSubmit}
                aria-disabled={!canSubmit}
              >
                {isSubmitting
                  ? 'Signing Up...'
                  : isFormEmpty
                    ? 'Start Registration'
                    : 'Sign Up'}

                <span className="button-arrow" aria-hidden="true">
                  >
                </span>
              </button>

              <p className="register-footnote">
                Already have an account? <Link to="/login">Log In</Link>
              </p>
            </form>
          </div>
        </section>
      </main>
    </PageShell>
  );
}