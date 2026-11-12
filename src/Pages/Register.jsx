import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  // El estado reúne los datos de alta y el mensaje de error devuelto por el servidor.
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'Peón' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Crea la cuenta; ante éxito dirige al inicio de sesión y ante error informa al usuario.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/auth/register', form);
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Error al registrar');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '450px', borderRadius: '15px' }}>
        <h3 className="text-center text-success mb-4">🐮 Crear Cuenta</h3>
        
        {error && <div className="alert alert-danger p-2 text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted fw-bold">Nombre Completo</label>
            <input type="text" className="form-control" onChange={e => setForm({...form, nombre: e.target.value})} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted fw-bold">Correo Electrónico</label>
            <input type="email" className="form-control" onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted fw-bold">Contraseña</label>
            <input type="password" className="form-control" onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="mb-4">
            <label className="form-label text-muted fw-bold">Rol en el Sistema</label>
            <select className="form-select" onChange={e => setForm({...form, rol: e.target.value})}>
              <option value="Peón">Empleado (Peón)</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-success w-100 fw-bold py-2 mb-3">Registrarse</button>
          
          <div className="text-center">
            <span className="text-muted">¿Ya tienes cuenta? </span>
            <Link to="/" className="text-success text-decoration-none fw-bold">Iniciar Sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Register;