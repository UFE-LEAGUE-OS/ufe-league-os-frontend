import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

type BackButtonProps = {
  label?: string;
  className?: string;
};

export default function BackButton({
  label = 'Back',
  className = '',
}: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={`back-button ${className}`.trim()}
      onClick={() => navigate(-1)}
    >
      <ArrowBackIcon aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
