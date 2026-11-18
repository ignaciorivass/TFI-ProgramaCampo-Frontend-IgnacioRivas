import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Chatbot from './Chatbot';

// Enlaces del menú y las secciones disponibles solo para administradores.
const MENU = [
  { ruta: '/dashboard',    texto: 'Inicio',      soloAdmin: false },
  { ruta: '/animales',     texto: 'Animales',    soloAdmin: false },
  { ruta: '/potreros',     texto: 'Potreros',    soloAdmin: false },
  { ruta: '/movimientos',  texto: 'Movimientos', soloAdmin: false },
  { ruta: '/vacunaciones', texto: 'Sanidad',     soloAdmin: false },
  { ruta: '/pesajes',      texto: 'Pesajes',     soloAdmin: false },
  { ruta: '/usuarios',     texto: 'Usuarios',    soloAdmin: true },
];

export default function Layout({ children }) {
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  // sidebarAbierto: controla si el sidebar está expandido (desktop) o visible (móvil)
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const esAdmin = user?.rol === 'Administrador';
  // Filtra los links según el rol del usuario
  const linksVisibles = MENU.filter((m) => !m.soloAdmin || esAdmin);

  return (
    <div className="app-shell">
      {/* ===== NAVBAR SUPERIOR ===== */}
      <nav className="navbar-campo navbar d-print-none" aria-label="Navegación principal">
        <div className="container-fluid px-3">
          {/* Botón hamburguesa (solo móvil) */}
          <button
            className="sidebar-toggle d-lg-none me-2"
            aria-label="Abrir menú lateral"
            aria-expanded={sidebarAbierto}
            onClick={() => setSidebarAbierto(!sidebarAbierto)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <Link className="navbar-brand fw-bold text-white" to="/dashboard">
            Sistema Ganadero
          </Link>

          {/* Info del usuario y botón salir */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <span className="text-white-50 small d-none d-sm-inline">
              {user?.nombre}
            </span>
            <span className="badge bg-campo-tierra">{user?.rol}</span>
            <button onClick={handleLogout} className="btn btn-sm btn-outline-light">
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* ===== CUERPO: SIDEBAR + CONTENIDO ===== */}
      <div className="app-body">
        {/* Overlay oscuro en móvil cuando el sidebar está abierto */}
        {sidebarAbierto && (
          <div
            className="sidebar-overlay d-lg-none"
            onClick={() => setSidebarAbierto(false)}
            aria-hidden="true"
          />
        )}

        {/* SIDEBAR */}
        <aside className={`sidebar d-print-none ${sidebarAbierto ? 'sidebar-open' : ''}`} aria-label="Menú lateral">
          <nav>
            <ul className="sidebar-nav list-unstyled mb-0">
              {linksVisibles.map((item) => (
                <li key={item.ruta}>
                  <NavLink
                    to={item.ruta}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarAbierto(false)}
                  >
                    <span className="sidebar-texto">{item.texto}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer del sidebar con la versión */}
          <div className="sidebar-footer">
            <small className="text-muted">v1.0 · TFI Campo</small>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="main-content">
          {children}
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
