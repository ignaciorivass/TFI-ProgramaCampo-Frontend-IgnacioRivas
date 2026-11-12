import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const PotreroForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const [form, setForm] = useState({ nombre: '', superficie: '', capacidad: '' });

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3000/api/potreros/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setForm(res.data));
    }
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (id) {
        await axios.put(`http://localhost:3000/api/potreros/${id}`, form, config);
      } else {
        await axios.post('http://localhost:3000/api/potreros', form, config);
      }
      navigate('/potreros');
    } catch (error) { alert('Error al guardar el potrero'); }
  };

  return (
    <div className="card shadow mt-4 mx-auto" style={{ maxWidth: '500px' }}>
      <div className="card-body">
        <h3 className="text-success mb-3">{id ? 'Editar Potrero' : 'Nuevo Potrero'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Nombre:</label>
            <input type="text" className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label>Superficie (ha):</label>
            <input type="number" step="0.1" className="form-control" value={form.superficie} onChange={e => setForm({ ...form, superficie: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label>Capacidad máxima (cabezas):</label>
            <input type="number" className="form-control" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-success">Guardar</button>
          <button type="button" onClick={() => navigate('/potreros')} className="btn btn-secondary ms-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default PotreroForm;