import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function PotreroForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    superficie: '',
    capacidad_maxima: '',
  });

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    if (!id) return;
    const cargarPotrero = async () => {
      try {
        // Busca el potrero existente y carga sus datos para permitir la edición.
        const res = await axios.get(`${API_URL}/potreros`, getHeaders());
        const potrero = res.data.find((p) => String(p.id) === String(id));
        if (potrero) {
          setFormData({
            nombre: potrero.nombre || '',
            superficie: potrero.superficie ?? potrero.hectareas ?? '',
            capacidad_maxima: potrero.capacidad_maxima ?? potrero.capacidad ?? '',
          });
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del potrero.');
      }
    };
    cargarPotrero();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Valida nombre, superficie y capacidad antes de enviar los datos al servidor.
    const nombreLimpio = formData.nombre.trim();
    if (nombreLimpio.length < 3 || nombreLimpio.length > 50 || !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(nombreLimpio)) {
      setError('El nombre del potrero debe tener entre 3 y 50 caracteres e incluir letras (Ej: Potrero Norte 1).');
      return;
    }

    const superficieNum = Number(formData.superficie);
    if (isNaN(superficieNum) || superficieNum < 0.5 || superficieNum > 50000) {
      setError('La superficie debe estar entre 0,5 ha y 50.000 ha.');
      return;
    }

    const capacidadNum = Number(formData.capacidad_maxima);
    if (!Number.isInteger(capacidadNum) || capacidadNum < 1 || capacidadNum > 10000) {
      setError('La capacidad máxima debe ser un número entero entre 1 y 10.000 cabezas.');
      return;
    }

    // Convierte los campos numéricos y conserva nombres usados por ambas versiones de la API.
    const payload = {
      nombre: nombreLimpio,
      superficie: superficieNum,
      hectareas: superficieNum,
      capacidad_maxima: capacidadNum,
      capacidad: capacidadNum,
    };

    try {
      // Usa PUT para editar y POST para registrar un potrero nuevo.
      if (id) {
        await axios.put(`${API_URL}/potreros/${id}`, payload, getHeaders());
      } else {
        await axios.post(`${API_URL}/potreros`, payload, getHeaders());
      }
      navigate('/potreros');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el potrero.');
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '650px' }}>
      <div className="card shadow-sm p-4">
        <h3 className="text-success mb-4">{id ? 'Editar Potrero' : 'Nuevo Potrero'}</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Potrero Norte 1"
              maxLength={50}
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Superficie (ha):</label>
            <input
              type="number"
              step="0.01"
              min="0.5"
              max="50000"
              className="form-control"
              placeholder="Ej: 45.5"
              value={formData.superficie}
              onChange={(e) => setFormData({ ...formData, superficie: e.target.value })}
              required
            />
            <small className="text-muted">Entre 0,5 ha y 50.000 ha.</small>
          </div>

          <div className="mb-3">
            <label className="form-label">Capacidad máxima (cabezas):</label>
            <input
              type="number"
              step="1"
              min="1"
              max="10000"
              className="form-control"
              placeholder="Ej: 80"
              value={formData.capacidad_maxima}
              onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
              required
            />
            <small className="text-muted">Número entero entre 1 y 10.000 cabezas.</small>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/potreros')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}