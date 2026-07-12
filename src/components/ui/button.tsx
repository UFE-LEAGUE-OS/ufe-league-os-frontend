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
        background: '#8135fa',
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

    const hoverBackground = variant === 'default' ? '#f97316' : undefined;

    const style = {
      ...baseStyles,
      ...variants[variant],
      ...sizes[size],
      ...(hoverBackground && { transition: 'background 180ms ease, transform 180ms ease, box-shadow 180ms ease' }),
      ...(props.style || {}),
    };

    return (
      <button
        ref={ref}
        style={style}
        className={className}
        {...props}
        onMouseEnter={(e) => {
          if (hoverBackground) {
            e.currentTarget.style.background = hoverBackground;
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 10px 28px rgba(249, 115, 22, 0.45)';
          }
          if (props.onMouseEnter) props.onMouseEnter(e);
        }}
        onMouseLeave={(e) => {
          if (hoverBackground && variant === 'default') {
            e.currentTarget.style.background = '#8135fa';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(129, 53, 250, 0.35)';
          }
          if (props.onMouseLeave) props.onMouseLeave(e);
        }}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };