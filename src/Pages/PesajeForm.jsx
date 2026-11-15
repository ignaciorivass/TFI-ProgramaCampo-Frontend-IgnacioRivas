import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const obtenerFechaHoy = () => {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - offset).toISOString().split('T')[0];
};

export default function PesajeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hoy = obtenerFechaHoy();

  const [animales, setAnimales] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    animal_id: '',
    fecha: hoy,
    peso: '',
    observaciones: '',
  });

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resAnim = await axios.get(`${API_URL}/animales`, getHeaders());
        setAnimales(resAnim.data);

        if (id) {
          const resPesajes = await axios.get(`${API_URL}/pesajes`, getHeaders());
          const pesaje = resPesajes.data.find((p) => String(p.id) === String(id));
          if (pesaje) {
            setFormData({
              animal_id: pesaje.animal_id || '',
              fecha: pesaje.fecha ? String(pesaje.fecha).split('T')[0] : hoy,
              peso: pesaje.peso || '',
              observaciones: pesaje.observaciones || '',
            });
          }
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del pesaje.');
      }
    };
    cargarDatos();
  }, [id, hoy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.animal_id) {
      setError('Debe seleccionar un animal.');
      return;
    }

    if (!formData.fecha || formData.fecha > hoy) {
      setError('La fecha de pesaje no puede ser posterior al día de hoy.');
      return;
    }

    const pesoNum = Number(formData.peso);
    if (isNaN(pesoNum) || pesoNum < 0.5 || pesoNum > 2000) {
      setError('El peso registrado debe estar entre 0,5 kg y 2.000 kg.');
      return;
    }

    if (formData.observaciones.trim().length > 200) {
      setError('Las observaciones no pueden superar los 200 caracteres.');
      return;
    }

    const payload = {
      animal_id: Number(formData.animal_id),
      fecha: formData.fecha,
      peso: pesoNum,
      observaciones: formData.observaciones.trim(),
    };

    try {
      if (id) {
        await axios.put(`${API_URL}/pesajes/${id}`, payload, getHeaders());
      } else {
        await axios.post(`${API_URL}/pesajes`, payload, getHeaders());
      }
      navigate('/pesajes');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el pesaje.');
    }
  };

  const animalesDisponibles = id
    ? animales
    : animales.filter((a) => a.estado === 'Activo');

  return (
    <div className="container mt-4" style={{ maxWidth: '650px' }}>
      <div className="card shadow-sm p-4">
        <h3 className="text-success mb-4">
          {id ? 'Editar Pesaje' : 'Registrar Nuevo Pesaje'}
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Animal (Caravana):</label>
            <select
              className="form-select"
              value={formData.animal_id}
              onChange={(e) => setFormData({ ...formData, animal_id: e.target.value })}
              required
            >
              <option value="">Seleccione un animal...</option>
              {animalesDisponibles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.caravana} - {a.especie} (Peso actual: {Number(a.peso || 0).toFixed(2)} kg)
                </option>
              ))}
            </select>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Fecha de Pesaje:</label>
              <input
                type="date"
                className="form-control"
                max={hoy}
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Peso Registrado (kg):</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="2000"
                className="form-control"
                placeholder="Ej: 410.5"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                required
              />
              <small className="text-muted">Entre 0,5 y 2.000 kg.</small>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Observaciones (Opcional):</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Control mensual, buen estado corporal..."
              maxLength={200}
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            />
          </div>

          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/pesajes')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}