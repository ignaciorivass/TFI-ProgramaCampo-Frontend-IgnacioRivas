import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 px-4 shadow-sm d-print-none">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-4">
          <Link className="navbar-brand fw-bold text-success m-0" to="/animales">
            🚜 Sistema Ganadero
          </Link>
          <div className="navbar-nav d-flex flex-row gap-3">
            <Link className="nav-link" to="/animales">Animales</Link>
            <Link className="nav-link" to="/potreros">Potreros</Link>
            <Link className="nav-link" to="/movimientos">Movimientos</Link>
            <Link className="nav-link" to="/vacunaciones">Sanidad</Link>
            <Link className="nav-link" to="/pesajes">Pesajes</Link>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span className="text-light">
            {user.nombre} ({user.rol})
          </span>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;