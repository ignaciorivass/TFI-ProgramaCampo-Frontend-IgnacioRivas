import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const AnimalForm = () => {
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const [form, setForm] = useState({
    caravana: '', sexo: 'Hembra', fecha_nacimiento: '', peso: '', estado: 'Activo'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/animales', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/animales');
    } catch (error) { alert('Error al guardar'); }
  };

  return (
    <div className="card shadow mt-4">
      <div className="card-body">
        <h3>Registrar Animal</h3>
        <form onSubmit={handleSubmit} className="mt-3">
          <div className="mb-3">
            <div className="row mb-3">
              <div className="col">
                <label>Caravana (Código):</label>
                <input
                  type="text"
                  className="form-control"
                  maxLength="10"
                  pattern="[A-Za-z0-9-]+"
                  title="Solo letras, números y guiones. Sin espacios."
                  onChange={e => setForm({ ...form, caravana: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="col">
                <label>Sexo:</label>
                <select
                  className="form-select"
                  onChange={e => setForm({ ...form, sexo: e.target.value })}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label>Peso (kg):</label>
              <input type="number" className="form-control" onChange={e => setForm({ ...form, peso: e.target.value })} required />
            </div>
            <div className="col">
              <label>Fecha Nacimiento:</label>
              <input type="date" className="form-control" onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} required />
            </div>
          </div>
          <button type="submit" className="btn btn-success">Guardar</button>
          <button type="button" onClick={() => navigate('/animales')} className="btn btn-secondary ms-2">Cancelar</button>
        </form>
      </div>
    </div>
  );
};
export default AnimalForm;