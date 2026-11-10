import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const VacunacionForm = () => {
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const [animales, setAnimales] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [form, setForm] = useState({ animal_id: '', vacuna_id: '', fecha: '', dosis: '' });

  useEffect(() => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    axios.get('http://localhost:3000/api/animales', config).then(res => setAnimales(res.data));
    axios.get('http://localhost:3000/api/vacunaciones/catalogo', config).then(res => setVacunas(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/vacunaciones', form, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/vacunaciones');
    } catch (error) { 
      // Muestra el detalle técnico exacto que devuelve MySQL/Node
      alert('Error real: ' + (error.response?.data?.error || error.response?.data?.message || error.message)); 
    }
  };
  
  return (
    <div className="card shadow mt-4 mx-auto" style={{ maxWidth: '600px' }}>
      <div className="card-body">
        <h3 className="text-success mb-3">Registrar Aplicación de Vacuna</h3>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col">
              <label>Animal (Caravana):</label>
              <select className="form-select" onChange={e => setForm({...form, animal_id: e.target.value})} required>
                <option value="">Seleccione...</option>
                {animales.map(a => <option key={a.id} value={a.id}>{a.caravana}</option>)}
              </select>
            </div>
            <div className="col">
              <label>Vacuna Aplicada:</label>
              <select className="form-select" onChange={e => setForm({...form, vacuna_id: e.target.value})} required>
                <option value="">Seleccione...</option>
                {vacunas.map(v => <option key={v.id} value={v.id}>{v.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label>Fecha de Aplicación:</label>
              <input type="date" className="form-control" onChange={e => setForm({...form, fecha: e.target.value})} required />
            </div>
            <div className="col">
              <label>Dosis (ml):</label>
              <input type="number" step="0.1" className="form-control" onChange={e => setForm({...form, dosis: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="btn btn-success">Registrar</button>
          <button type="button" onClick={() => navigate('/vacunaciones')} className="btn btn-secondary ms-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};
export default VacunacionForm;