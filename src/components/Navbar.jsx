import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Opciones del menú principal.
const ENLACES = [
  { ruta: '/dashboard', texto: 'Inicio' },
  { ruta: '/animales', texto: 'Animales' },
  { ruta: '/potreros', texto: 'Potreros' },
  { ruta: '/movimientos', texto: 'Movimientos' },
  { ruta: '/vacunaciones', texto: 'Sanidad' },
  { ruta: '/pesajes', texto: 'Pesajes' },
  { ruta: '/usuarios', texto: 'Usuarios', soloAdmin: true },
];

const Navbar = () => {
  // Lee los datos de sesión compartidos para mostrar el usuario y cerrar sesión.
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const esAdmin = user?.rol === 'Administrador';
  // En pantallas chicas el menú se despliega con el botón de hamburguesa.
  const [abierto, setAbierto] = useState(false);

  const handleLogout = () => {
    // Limpia la sesión global y vuelve a la pantalla de acceso.
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-campo d-print-none">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand fw-bold" to="/dashboard" onClick={() => setAbierto(false)}>
          Sistema Ganadero
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto(!abierto)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${abierto ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {ENLACES.filter((enlace) => !enlace.soloAdmin || esAdmin).map((e) => (
              <li className="nav-item" key={e.ruta}>
                <NavLink
                  to={e.ruta}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setAbierto(false)}
                >
                  {e.texto}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <span className="text-light small">
              {user.nombre} <span className="badge bg-light text-dark ms-1">{user.rol}</span>
            </span>
            <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
