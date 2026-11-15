import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const VACUNAS_BASE = [
  { id: 1, nombre: 'Fiebre Aftosa - Biogénesis Bagó', enfermedad: 'Fiebre Aftosa' },
  { id: 2, nombre: 'Brucelosis Cepa 19', enfermedad: 'Brucelosis Bovina' },
  { id: 3, nombre: 'Carbunclo Bacteridiano', enfermedad: 'Carbunclo' },
  { id: 4, nombre: 'Clostridiosis Polivalente', enfermedad: 'Mancha y Gangrena' },
  { id: 5, nombre: 'Ivermectina Antiparasitaria', enfermedad: 'Parásitos internos y externos' },
];

const obtenerFechaHoy = () => {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - offset).toISOString().split('T')[0];
};

export default function VacunacionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hoy = obtenerFechaHoy();

  const [animales, setAnimales] = useState([]);
  const [vacunas, setVacunas] = useState(VACUNAS_BASE);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    animal_id: '',
    vacuna_id: '1',
    fecha_aplicacion: hoy,
    dosis: '',
  });

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resAnim = await axios.get(`${API_URL}/animales`, getHeaders());
        setAnimales(resAnim.data);

        try {
          const resCatalogo = await axios.get(`${API_URL}/vacunaciones/vacunas`, getHeaders());
          if (resCatalogo.data?.length > 0) setVacunas(resCatalogo.data);
        } catch {
          // Usa el catálogo base si la sub-ruta no responde
        }

        if (id) {
          const resVac = await axios.get(`${API_URL}/vacunaciones/${id}`, getHeaders());
          const data = resVac.data;
          setFormData({
            animal_id: data.animal_id || '',
            vacuna_id: String(data.vacuna_id || '1'),
            fecha_aplicacion: data.fecha_aplicacion
              ? String(data.fecha_aplicacion).split('T')[0]
              : hoy,
            dosis: data.dosis || '',
          });
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos de vacunación.');
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

    if (!formData.fecha_aplicacion || formData.fecha_aplicacion > hoy) {
      setError('La fecha de aplicación no puede ser posterior al día de hoy.');
      return;
    }

    // Valida formato realista de dosis: número entre 0.1 y 100 con unidad opcional (ml, cc, dosis)
    const dosisLimpia = formData.dosis.trim();
    const matchDosis = dosisLimpia.match(/^(\d+(?:[.,]\d{1,2})?)\s*(ml|cc|dosis)?$/i);
    if (!matchDosis || dosisLimpia.length > 15) {
      setError('Ingresá una dosis válida entre 0,1 y 100 (Ej: 2 ml, 5 cc o 1 dosis).');
      return;
    }

    const cantidad = Number(matchDosis[1].replace(',', '.'));
    if (cantidad < 0.1 || cantidad > 100) {
      setError('La cantidad de dosis debe estar entre 0,1 y 100.');
      return;
    }

    const unidad = matchDosis[2] ? matchDosis[2].toLowerCase() : 'ml';
    const dosisFormateada = `${matchDosis[1].replace(',', '.')} ${unidad}`;

    const payload = {
      animal_id: Number(formData.animal_id),
      vacuna_id: Number(formData.vacuna_id),
      fecha_aplicacion: formData.fecha_aplicacion,
      dosis: dosisFormateada,
    };

    try {
      if (id) {
        await axios.put(`${API_URL}/vacunaciones/${id}`, payload, getHeaders());
      } else {
        await axios.post(`${API_URL}/vacunaciones`, payload, getHeaders());
      }
      navigate('/vacunaciones');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar vacunación.');
    }
  };

  const animalesDisponibles = id
    ? animales
    : animales.filter((a) => a.estado === 'Activo');

  return (
    <div className="container mt-4" style={{ maxWidth: '650px' }}>
      <div className="card shadow-sm p-4">
        <h3 className="text-success mb-4">
          {id ? 'Editar Vacunación' : 'Registrar Vacunación'}
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
                  {a.caravana} - {a.especie} ({a.raza})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Vacuna / Tratamiento:</label>
            <select
              className="form-select"
              value={formData.vacuna_id}
              onChange={(e) => setFormData({ ...formData, vacuna_id: e.target.value })}
              required
            >
              {vacunas.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre} ({v.enfermedad})
                </option>
              ))}
            </select>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Fecha de Aplicación:</label>
              <input
                type="date"
                className="form-control"
                max={hoy}
                value={formData.fecha_aplicacion}
                onChange={(e) =>
                  setFormData({ ...formData, fecha_aplicacion: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Dosis Aplicada:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: 2 ml"
                maxLength={15}
                value={formData.dosis}
                onChange={(e) => setFormData({ ...formData, dosis: e.target.value })}
                required
              />
              <small className="text-muted">Entre 0,1 y 100 (Ej: 2 ml, 5 cc).</small>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/vacunaciones')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}