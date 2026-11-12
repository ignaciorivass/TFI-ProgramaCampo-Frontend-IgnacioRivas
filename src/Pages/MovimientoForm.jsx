import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const MovimientoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const [animales, setAnimales] = useState([]);
  const [potreros, setPotreros] = useState([]);
  const [form, setForm] = useState({
    animal_id: '', fecha: '', tipo: 'Traslado', origen_potrero_id: '', destino_potrero_id: ''
  });

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('http://localhost:3000/api/animales', config).then(res => setAnimales(res.data));
    axios.get('http://localhost:3000/api/potreros', config).then(res => setPotreros(res.data));

    if (id) {
      axios.get(`http://localhost:3000/api/movimientos/${id}`, config).then(res => {
        const d = res.data;
        setForm({
          animal_id: d.animal_id,
          fecha: d.fecha ? d.fecha.split('T')[0] : '',
          tipo: d.tipo,
          origen_potrero_id: d.origen_potrero_id || '',
          destino_potrero_id: d.destino_potrero_id || ''
        });
      });
    }
  }, [id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (id) {
        await axios.put(`http://localhost:3000/api/movimientos/${id}`, form, config);
      } else {
        await axios.post('http://localhost:3000/api/movimientos', form, config);
      }
      navigate('/movimientos');
    } catch (error) { alert('Error al guardar el movimiento'); }
  };

  return (
    <div className="card shadow mt-4 mx-auto" style={{ maxWidth: '600px' }}>
      <div className="card-body">
        <h3 className="text-success mb-3">{id ? 'Editar Movimiento' : 'Registrar Traslado / Venta / Baja'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Animal (Caravana):</label>
            <select className="form-select" value={form.animal_id} onChange={e => setForm({ ...form, animal_id: e.target.value })} required>
              <option value="">Seleccione...</option>
              {animales.map(a => <option key={a.id} value={a.id}>{a.caravana}</option>)}
            </select>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label>Tipo:</label>
              <select className="form-select" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                <option value="Traslado">Traslado</option>
                <option value="Venta">Venta</option>
                <option value="Baja">Baja</option>
              </select>
            </div>
            <div className="col">
              <label>Fecha:</label>
              <input type="date" className="form-control" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label>Potrero Origen:</label>
              <select className="form-select" value={form.origen_potrero_id} onChange={e => setForm({ ...form, origen_potrero_id: e.target.value })}>
                <option value="">Ninguno / No aplica</option>
                {potreros.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            {form.tipo === 'Traslado' && (
              <div className="col">
                <label>Potrero Destino:</label>
                <select className="form-select" value={form.destino_potrero_id} onChange={e => setForm({ ...form, destino_potrero_id: e.target.value })} required>
                  <option value="">Seleccione destino...</option>
                  {potreros.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-success">Guardar</button>
          <button type="button" onClick={() => navigate('/movimientos')} className="btn btn-secondary ms-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};

export default MovimientoForm;