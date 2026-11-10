import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const PotreroForm = () => {
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const [form, setForm] = useState({ nombre: '', superficie: '', capacidad: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/potreros', form, { headers: { Authorization: `Bearer ${token}` }});
      navigate('/potreros');
    } catch (error) { alert('Error al guardar'); }
  };

  return (
    <div className="card shadow mt-4 mx-auto" style={{ maxWidth: '600px' }}>
      <div className="card-body">
        <h3 className="text-success mb-3">Registrar Potrero</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Nombre del Potrero:</label>
            <input type="text" className="form-control" onChange={e => setForm({...form, nombre: e.target.value})} required />
          </div>
          <div className="row mb-3">
            <div className="col">
              <label>Superficie (ha):</label>
              <input type="number" step="0.1" className="form-control" onChange={e => setForm({...form, superficie: e.target.value})} required />
            </div>
            <div className="col">
              <label>Capacidad Máxima:</label>
              <input type="number" className="form-control" onChange={e => setForm({...form, capacidad: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="btn btn-success">Guardar</button>
          <button type="button" onClick={() => navigate('/potreros')} className="btn btn-secondary ms-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};
export default PotreroForm;