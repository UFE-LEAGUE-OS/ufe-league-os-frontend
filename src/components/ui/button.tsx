import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'default', className = '', children, ...props }, ref) => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 600,
      borderRadius: '0.375rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: 'none',
      fontFamily: 'var(--font-heading, inherit)',
    };

    const variants = {
      default: {
        background: '#8135FA',
        color: '#fff',
      },
      outline: {
        background: 'transparent',
        color: '#fff',
        border: '1px solid #1F2937',
      },
      ghost: {
        background: 'transparent',
        color: '#9CA3AF',
      },
    };

    const sizes = {
      default: {
        padding: '8px 20px',
        fontSize: '0.8rem',
      },
      sm: {
        padding: '6px 14px',
        fontSize: '0.75rem',
      },
      lg: {
        padding: '12px 24px',
        fontSize: '0.9rem',
      },
    };

    const style = {
      ...baseStyles,
      ...variants[variant],
      ...sizes[size],
      ...(props.style || {}),
    };

    return (
      <button ref={ref} style={style} className={className} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };