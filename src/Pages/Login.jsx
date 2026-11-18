import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL } from '../config';
import heroImg from '../assets/campo-hero.svg';
import logoVaca from '../assets/logo-vaca.png';

const Login = () => {
  // El formulario conserva las credenciales hasta enviarlas al servicio de autenticación.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  // Si el servidor valida las credenciales, inicia la sesión global y abre el dashboard.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'No se pudo conectar con el servidor. Verificá que el backend esté encendido.'
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-imagen d-none d-md-flex" style={{ backgroundImage: `url(${heroImg})` }}>
        <img
          src={logoVaca}
          alt="Logo del sistema ganadero"
          className="auth-logo"
        />
        <div className="auth-imagen-texto">
          <h1 className="h2 fw-bold">Sistema Ganadero</h1>
          <p className="mb-0">Animales, potreros, sanidad y pesajes en un solo lugar.</p>
        </div>
      </div>

      <div className="auth-form">
        <div className="auth-card">
          <h2 className="h4 fw-bold text-center mb-1">Iniciar sesión</h2>
          <p className="text-center text-muted mb-4">Ingresá con tu cuenta para continuar</p>

          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input id="email" type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input id="password" type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-success w-100 fw-bold py-2 mb-3" disabled={enviando}>
              {enviando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
            <Link to="/register" className="btn btn-outline-secondary w-100 fw-bold py-2">Registrarse</Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
