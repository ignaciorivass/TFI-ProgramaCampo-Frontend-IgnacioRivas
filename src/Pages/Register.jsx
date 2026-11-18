import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import heroImg from '../assets/campo-hero.svg';
import logoVaca from '../assets/logo-vaca.png';

const Register = () => {
  // Estado del formulario y control de envío
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'Peón',
  });
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  // Actualiza un campo del formulario sin perder los otros
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Envía el registro; si todo va bien muestra mensaje y redirige al login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    setEnviando(true);
    try {
      await axios.post(`${API_URL}/auth/register`, form);
      setExito('¡Cuenta creada! Podés iniciar sesión ahora.');
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear la cuenta. Revisá los datos.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Panel izquierdo con imagen decorativa (solo escritorio) */}
      <div className="auth-imagen" style={{ backgroundImage: `url(${heroImg})` }}>
        <img
          src={logoVaca}
          alt="Logo del sistema ganadero"
          className="auth-logo"
        />
        <div className="auth-imagen-texto">
          <h1 className="h2 fw-bold">Sistema Ganadero</h1>
          <p className="mb-0">Registrate para gestionar tu establecimiento.</p>
        </div>
      </div>

      {/* Panel derecho con el formulario */}
      <div className="auth-form">
        <div className="auth-card">
          <div className="text-center mb-4">
            <h2 className="h4 fw-bold mb-1">Crear cuenta</h2>
            <p className="text-muted small">Completá los datos para registrarte</p>
          </div>

          {error  && <div className="alert alert-danger py-2"  role="alert">{error}</div>}
          {exito  && <div className="alert alert-success py-2" role="alert">{exito}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">Nombre completo</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-control"
                placeholder="Ej: Juan Pérez"
                value={form.nombre}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="rol" className="form-label">Rol</label>
              <select
                id="rol"
                name="rol"
                className="form-select"
                value={form.rol}
                onChange={handleChange}
                required
              >
                <option value="Peón">Peón</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-success w-100 fw-bold py-2 mb-3"
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  Registrando...
                </>
              ) : (
                'Crear cuenta'
              )}
            </button>

            <p className="text-center text-muted small mb-0">
              ¿Ya tenés cuenta?{' '}
              <Link to="/" className="text-success fw-bold text-decoration-none">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
