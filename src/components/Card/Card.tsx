import type { ReactNode } from 'react';

export type CardProps = {
  title?: ReactNode;
  value?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function Card({ title, value, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {title && <h3>{title}</h3>}
      {value !== undefined && <p>{value}</p>}
      {children}
    </div>
  );
}
