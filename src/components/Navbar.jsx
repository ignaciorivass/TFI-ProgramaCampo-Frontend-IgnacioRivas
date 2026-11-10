import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/animales">🚜 Sistema Ganadero</Link>
      <Link className="nav-link text-white" to="/animales">Animales</Link>
      <Link className="nav-link text-white" to="/potreros">Potreros</Link>
      <Link className="nav-link text-white" to="/movimientos">Movimientos</Link>
      <Link className="nav-link text-white" to="/vacunaciones">Sanidad</Link>
      <div className="d-flex align-items-center text-white">
        <span className="me-3">{user?.nombre} ({user?.rol})</span>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Salir</button>
      </div>
    </nav>
  );
};
export default Navbar;