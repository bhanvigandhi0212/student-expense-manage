
import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(onClose, 3500);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast" role="status">
      <CheckCircle2 size={20} />
      <span>{message}</span>
    </div>
  );
}

export default Toast;
