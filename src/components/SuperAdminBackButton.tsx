import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SuperAdminBackButton.css';

type SuperAdminBackButtonProps = {
  /** Optional destination path. If omitted, goes back one entry in history. */
  to?: string;
  /** Optional label override. Defaults to "Back". */
  label?: string;
  /** Optional className to extend/override positioning from the parent page. */
  className?: string;
};

export default function SuperAdminBackButton({
  to,
  label = 'Back',
  className = '',
}: SuperAdminBackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      className={`super-admin-back-btn ${className}`.trim()}
      onClick={handleClick}
      aria-label={label}
    >
      <ArrowLeft size={16} />
      <span>{label}</span>
    </button>
  );
}