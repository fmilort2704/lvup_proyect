import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Si no viene desde navigate (no hay token), redirige al home
    if (!location.state?.fromNavigate) {
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  // Si hay token, renderiza el contenido protegido
  return children;
}