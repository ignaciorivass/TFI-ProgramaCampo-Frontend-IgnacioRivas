import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const obtenerFechaHoy = () => {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - offset).toISOString().split('T')[0];
};

export default function MovimientoForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hoy = obtenerFechaHoy();

  const [animales, setAnimales] = useState([]);
  const [potreros, setPotreros] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    animal_id: '',
    tipo: 'Traslado',
    fecha: hoy,
    origen_potrero_id: '',
    destino_potrero_id: '',
    motivo: '',
  });

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resAnimales, resPotreros] = await Promise.all([
          axios.get(`${API_URL}/animales`, getHeaders()),
          axios.get(`${API_URL}/potreros`, getHeaders()),
        ]);

        // Para movimientos nuevos mostramos solo animales activos
        const listaAnimales = id
          ? resAnimales.data
          : resAnimales.data.filter((a) => a.estado === 'Activo');

        setAnimales(listaAnimales);
        setPotreros(resPotreros.data);

        if (id) {
          const resMov = await axios.get(`${API_URL}/movimientos/${id}`, getHeaders());
          const mov = resMov.data;
          setFormData({
            animal_id: mov.animal_id || '',
            tipo: mov.tipo || 'Traslado',
            fecha: mov.fecha ? mov.fecha.split('T')[0] : hoy,
            origen_potrero_id: mov.origen_potrero_id || '',
            destino_potrero_id: mov.destino_potrero_id || '',
            motivo: mov.motivo || '',
          });
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos de movimientos.');
      }
    };
    cargarDatos();
  }, [id, hoy]);

  // Al elegir un animal, fija automáticamente su potrero actual como origen
  const handleAnimalChange = (e) => {
    const animalId = e.target.value;
    const animalSeleccionado = animales.find((a) => String(a.id) === String(animalId));
    const potreroActualId = animalSeleccionado?.potrero_id ? String(animalSeleccionado.potrero_id) : '';

    setFormData({
      ...formData,
      animal_id: animalId,
      origen_potrero_id: potreroActualId,
      // Si el destino elegido coincidía con el nuevo origen, lo resetea
      destino_potrero_id:
        String(formData.destino_potrero_id) === potreroActualId ? '' : formData.destino_potrero_id,
    });
  };

  const handleTipoChange = (e) => {
    const nuevoTipo = e.target.value;
    setFormData({
      ...formData,
      tipo: nuevoTipo,
      destino_potrero_id: nuevoTipo === 'Traslado' ? formData.destino_potrero_id : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.animal_id) {
      setError('Debe seleccionar un animal.');
      return;
    }

    if (!formData.fecha || formData.fecha > hoy) {
      setError('La fecha del movimiento no puede ser posterior al día de hoy.');
      return;
    }

    if (formData.tipo === 'Traslado') {
      if (!formData.destino_potrero_id) {
        setError('Debe seleccionar un potrero de destino para el traslado.');
        return;
      }
      if (String(formData.origen_potrero_id) === String(formData.destino_potrero_id)) {
        setError('El potrero de destino no puede ser el mismo que el de origen.');
        return;
      }
    }

    const payload = {
      ...formData,
      origen_potrero_id: formData.origen_potrero_id || null,
      destino_potrero_id: formData.tipo === 'Traslado' ? formData.destino_potrero_id : null,
    };

    try {
      if (id) {
        await axios.put(`${API_URL}/movimientos/${id}`, payload, getHeaders());
      } else {
        await axios.post(`${API_URL}/movimientos`, payload, getHeaders());
      }
      navigate('/movimientos');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el movimiento.');
    }
  };

  // Nombre legible del potrero de origen actual
  const potreroOrigenObj = potreros.find(
    (p) => String(p.id) === String(formData.origen_potrero_id)
  );
  const textoPotreroOrigen = !formData.animal_id
    ? 'Seleccione un animal primero...'
    : potreroOrigenObj
    ? potreroOrigenObj.nombre
    : 'Sin potrero asignado (Ingreso inicial)';

  // Potreros disponibles para destino (excluye el potrero de origen)
  const potrerosDestinoDisponibles = potreros.filter(
    (p) => String(p.id) !== String(formData.origen_potrero_id)
  );

  return (
    <div className="container mt-4" style={{ maxWidth: '680px' }}>
      <div className="card shadow-sm p-4">
        <h3 className="text-success mb-4">
          {id ? 'Editar Movimiento' : 'Registrar Movimiento'}
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Animal */}
            <div className="col-12">
              <label className="form-label">Animal (Caravana):</label>
              <select
                className="form-select"
                value={formData.animal_id}
                onChange={handleAnimalChange}
                disabled={Boolean(id)} // En edición se bloquea para no alterar el historial
                required
              >
                <option value="">Seleccione un animal...</option>
                {animales.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.caravana} - {a.especie} ({a.raza})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de Movimiento */}
            <div className="col-md-6">
              <label className="form-label">Tipo:</label>
              <select
                className="form-select"
                value={formData.tipo}
                onChange={handleTipoChange}
                required
              >
                <option value="Traslado">Traslado</option>
                <option value="Venta">Venta</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            {/* Fecha (limitada hasta hoy) */}
            <div className="col-md-6">
              <label className="form-label">Fecha:</label>
              <input
                type="date"
                className="form-control"
                max={hoy}
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                required
              />
            </div>

            {/* Potrero Origen FIJO */}
            <div className="col-md-6">
              <label className="form-label">Potrero Origen (Actual):</label>
              <input
                type="text"
                className="form-control bg-light"
                value={textoPotreroOrigen}
                readOnly
                disabled
              />
            </div>

            {/* Potrero Destino */}
            <div className="col-md-6">
              <label className="form-label">Potrero Destino:</label>
              <select
                className="form-select"
                value={formData.destino_potrero_id}
                onChange={(e) =>
                  setFormData({ ...formData, destino_potrero_id: e.target.value })
                }
                disabled={formData.tipo !== 'Traslado'}
                required={formData.tipo === 'Traslado'}
              >
                <option value="">
                  {formData.tipo === 'Traslado'
                    ? 'Seleccione potrero destino...'
                    : 'No aplica para Venta/Baja'}
                </option>
                {potrerosDestinoDisponibles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Motivo opcional */}
            <div className="col-12">
              <label className="form-label">Motivo / Observación (Opcional):</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: Rotación de pasturas, venta en feria..."
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/movimientos')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}