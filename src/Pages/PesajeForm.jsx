import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const PesajeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const [animales, setAnimales] = useState([]);
  const [form, setForm] = useState({ animal_id: '', fecha: '', peso: '', observaciones: '' });

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('http://localhost:3000/api/animales', config).then(res => setAnimales(res.data));

    if (id) {
      axios.get(`http://localhost:3000/api/pesajes/${id}`, config).then(res => {
        const d = res.data;
        setForm({
          animal_id: d.animal_id,
          fecha: d.fecha ? d.fecha.split('T')[0] : '',
          peso: d.peso,
          observaciones: d.observaciones || ''
        });
      });
    }
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (id) {
        await axios.put(`http://localhost:3000/api/pesajes/${id}`, form, config);
      } else {
        await axios.post('http://localhost:3000/api/pesajes', form, config);
      }
      navigate('/pesajes');
    } catch (error) { alert('Error al guardar el pesaje'); }
  };

  return (
    <div className="card shadow mt-4 mx-auto" style={{ maxWidth: '600px' }}>
      <div className="card-body">
        <h3 className="text-success mb-3">{id ? 'Editar Pesaje' : 'Registrar Pesaje'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Animal (Caravana):</label>
            <select className="form-select" value={form.animal_id} onChange={e => setForm({ ...form, animal_id: e.target.value })} required>
              <option value="">Seleccione...</option>
              {animales.map(a => <option key={a.id} value={a.id}>{a.caravana} (Actual: {a.peso} kg)</option>)}
            </select>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label>Fecha:</label>
              <input type="date" className="form-control" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
            </div>
            <div className="col">
              <label>Peso (kg):</label>
              <input type="number" step="0.1" className="form-control" value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} required />
            </div>
          </div>
          <div className="mb-3">
            <label>Observaciones:</label>
            <input type="text" className="form-control" placeholder="Ej: Control destete, control mensual..." value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-success">Guardar</button>
          <button type="button" onClick={() => navigate('/pesajes')} className="btn btn-secondary ms-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default PesajeForm;