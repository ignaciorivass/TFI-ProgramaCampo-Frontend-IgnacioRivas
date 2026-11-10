import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const MovimientoForm = () => {
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const [animales, setAnimales] = useState([]);
  const [potreros, setPotreros] = useState([]);
  const [form, setForm] = useState({ animal_id: '', fecha: '', tipo: 'Traslado', origen_potrero_id: '', destino_potrero_id: '' });

  // Carga los catálogos para los menús desplegables
  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('http://localhost:3000/api/animales', config).then(res => setAnimales(res.data));
    axios.get('http://localhost:3000/api/potreros', config).then(res => setPotreros(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/movimientos', form, { headers: { Authorization: `Bearer ${token}` }});
      navigate('/movimientos');
    } catch (error) { alert('Error al registrar movimiento'); }
  };

  return (
    <div className="card shadow mt-4 mx-auto" style={{ maxWidth: '600px' }}>
      <div className="card-body">
        <h3 className="text-success mb-3">Registrar Movimiento</h3>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <label>Animal:</label>
              <select className="form-select" onChange={e => setForm({...form, animal_id: e.target.value})} required>
                <option value="">Seleccione Caravana...</option>
                {animales.map(a => <option key={a.id} value={a.id}>{a.caravana}</option>)}
              </select>
            </div>
            <div className="col">
              <label>Fecha:</label>
              <input type="date" className="form-control" onChange={e => setForm({...form, fecha: e.target.value})} required />
            </div>
          </div>
          <div className="mb-3">
            <label>Tipo de Movimiento:</label>
            <select className="form-select" onChange={e => setForm({...form, tipo: e.target.value})}>
              <option value="Traslado">Traslado Interno</option>
              <option value="Venta">Venta</option>
              <option value="Baja">Baja / Muerte</option>
            </select>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label>Potrero Origen:</label>
              <select className="form-select" onChange={e => setForm({...form, origen_potrero_id: e.target.value})}>
                <option value="">Ninguno...</option>
                {potreros.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="col">
              <label>Potrero Destino:</label>
              <select className="form-select" onChange={e => setForm({...form, destino_potrero_id: e.target.value})}>
                <option value="">Ninguno...</option>
                {potreros.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-success">Registrar</button>
          <button type="button" onClick={() => navigate('/movimientos')} className="btn btn-secondary ms-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};
export default MovimientoForm;