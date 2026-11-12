import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const Login = () => {
  // El formulario conserva las credenciales hasta enviarlas al servicio de autenticación.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  // Si el servidor valida las credenciales, inicia la sesión global y abre los animales.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/animales');
    } catch (error) {
      alert("El error real es: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="card shadow mx-auto" style={{ maxWidth: '400px', marginTop: '100px' }}>
      <div className="card-body">
        <h3 className="text-center mb-4">Iniciar Sesión</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email:</label>
            <input type="email" className="form-control" onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label>Contraseña:</label>
            <input type="password" className="form-control" onChange={e => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="btn btn-success w-100 fw-bold py-2 mb-3">Ingresar</button>
          <Link to="/register" className="btn btn-outline-secondary w-100 fw-bold py-2">Registrarse</Link>
        </form>
      </div>
    </div>
  );
};

export default Login;