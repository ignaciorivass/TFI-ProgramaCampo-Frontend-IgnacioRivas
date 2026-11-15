import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const PREFIJOS_ESPECIE = {
  Bovino: 'BO',
  Ovino: 'OV',
  Equino: 'EQ',
  Porcino: 'PO',
  Caprino: 'CA',
};

const RAZAS_POR_ESPECIE = {
  Bovino: [
    'Aberdeen Angus',
    'Brangus',
    'Braford',
    'Hereford',
    'Holando Argentino',
    'Brahman',
    'Limousin',
    'Criollo Argentino',
    'Mestizo / Cruza',
  ],
  Ovino: [
    'Merino Australiano',
    'Corriedale',
    'Hampshire Down',
    'Texel',
    'Pampinta',
    'Criolla',
  ],
  Equino: [
    'Criollo Argentino',
    'Cuarto de Milla',
    'Pura Sangre de Carrera',
    'Percherón',
    'Polo Argentino',
    'Mestizo',
  ],
  Porcino: [
    'Landrace',
    'Yorkshire',
    'Duroc Jersey',
    'Hampshire',
    'Pietrain',
    'Híbrido / Cruza',
  ],
  Caprino: [
    'Anglo Nubian',
    'Saanen',
    'Boer',
    'Criolla',
  ],
};

const obtenerFechaHoy = () => {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - offset).toISOString().split('T')[0];
};

export default function AnimalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const hoy = obtenerFechaHoy();

  const [potreros, setPotreros] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    caravana: 'BO-',
    sexo: '',
    especie: 'Bovino',
    raza: '',
    origen: 'Compra',
    fecha_nacimiento: '',
    potrero_id: '',
    peso: '',
    estado: 'Activo',
    madre_id: '',
    padre_id: '',
  });

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resPotreros, resAnimales] = await Promise.all([
          axios.get(`${API_URL}/potreros`, getHeaders()),
          axios.get(`${API_URL}/animales`, getHeaders()),
        ]);
        setPotreros(resPotreros.data);
        setAnimales(resAnimales.data);

        if (id) {
          const resAnimal = await axios.get(`${API_URL}/animales/${id}`, getHeaders());
          const data = resAnimal.data;
          setFormData({
            caravana: data.caravana || '',
            sexo: data.sexo || '',
            especie: data.especie || 'Bovino',
            raza: data.raza || '',
            origen: data.origen || 'Compra',
            fecha_nacimiento: data.fecha_nacimiento ? data.fecha_nacimiento.split('T')[0] : '',
            potrero_id: data.potrero_id || '',
            peso: data.peso || '',
            estado: data.estado || 'Activo',
            madre_id: data.madre_id || '',
            padre_id: data.padre_id || '',
          });
        }
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos iniciales.');
      }
    };
    cargarDatos();
  }, [id]);

  const handleEspecieChange = (e) => {
    const nuevaEspecie = e.target.value;
    const nuevoPrefijo = PREFIJOS_ESPECIE[nuevaEspecie] || 'BO';

    const partes = formData.caravana.split('-');
    const numeroActual = partes.length > 1 ? partes[1].replace(/\D/g, '').slice(0, 4) : '';

    setFormData({
      ...formData,
      especie: nuevaEspecie,
      raza: '',
      caravana: id ? formData.caravana : `${nuevoPrefijo}-${numeroActual}`,
    });
  };

  // Mantiene el prefijo fijo y limita estrictamente a un máximo de 4 números
  const handleCaravanaChange = (e) => {
    const prefijoFijo =
      id && formData.caravana.includes('-')
        ? `${formData.caravana.split('-')[0]}-`
        : `${PREFIJOS_ESPECIE[formData.especie] || 'BO'}-`;

    const valor = e.target.value.toUpperCase();
    const parteNumerica = valor.startsWith(prefijoFijo)
      ? valor.slice(prefijoFijo.length)
      : valor.replace(/^[A-Z]*-?/, '');

    const soloCuatroDigitos = parteNumerica.replace(/\D/g, '').slice(0, 4);
    setFormData({ ...formData, caravana: `${prefijoFijo}${soloCuatroDigitos}` });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const prefijoEsperado =
      id && formData.caravana.includes('-')
        ? formData.caravana.split('-')[0]
        : PREFIJOS_ESPECIE[formData.especie];

    const regexCaravana = new RegExp(`^${prefijoEsperado}-\\d{1,4}$`);
    if (!regexCaravana.test(formData.caravana.trim())) {
      setError(`Ingresá entre 1 y 4 números después de "${prefijoEsperado}-".`);
      return;
    }

    if (!formData.raza) {
      setError('Debe seleccionar una raza válida de la lista.');
      return;
    }

    if (!formData.fecha_nacimiento || formData.fecha_nacimiento > hoy) {
      setError('La fecha de nacimiento no puede ser posterior al día de hoy.');
      return;
    }

    const pesoNum = Number(formData.peso);
    if (isNaN(pesoNum) || pesoNum < 0.5 || pesoNum > 2000) {
      setError('El peso debe estar entre 0,5 kg y 2.000 kg.');
      return;
    }

    const payload = {
      ...formData,
      caravana: formData.caravana.trim(),
      peso: pesoNum,
      estado: id ? formData.estado : 'Activo',
      potrero_id: formData.estado === 'Activo' ? formData.potrero_id || null : null,
      madre_id: formData.origen === 'Nacimiento' && formData.madre_id ? formData.madre_id : null,
      padre_id: formData.origen === 'Nacimiento' && formData.padre_id ? formData.padre_id : null,
    };

    try {
      if (id) {
        await axios.put(`${API_URL}/animales/${id}`, payload, getHeaders());
      } else {
        await axios.post(`${API_URL}/animales`, payload, getHeaders());
      }
      navigate('/animales');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Error al guardar el animal. Verificá que la caravana no esté repetida.'
      );
    }
  };

  const prefijoActual = PREFIJOS_ESPECIE[formData.especie] || 'BO';
  const razasDisponibles = RAZAS_POR_ESPECIE[formData.especie] || [];
  const hembrasDisponibles = animales.filter(
    (a) => a.sexo === 'Hembra' && a.especie === formData.especie && String(a.id) !== String(id)
  );
  const machosDisponibles = animales.filter(
    (a) => a.sexo === 'Macho' && a.especie === formData.especie && String(a.id) !== String(id)
  );

  return (
    <div className="container mt-4" style={{ maxWidth: '750px' }}>
      <div className="card shadow-sm p-4">
        <h3 className="text-success mb-4">
          {id ? 'Editar Animal' : 'Registrar Animal / Nacimiento'}
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Especie */}
            <div className="col-md-6">
              <label className="form-label">Especie:</label>
              <select
                className="form-select"
                value={formData.especie}
                onChange={handleEspecieChange}
                required
              >
                {Object.keys(PREFIJOS_ESPECIE).map((esp) => (
                  <option key={esp} value={esp}>
                    {esp} ({PREFIJOS_ESPECIE[esp]})
                  </option>
                ))}
              </select>
            </div>

            {/* Caravana (máximo 4 números después del guion) */}
            <div className="col-md-6">
              <label className="form-label">Caravana (Código):</label>
              <input
                type="text"
                className="form-control"
                placeholder={`Ej: ${prefijoActual}-105`}
                value={formData.caravana}
                onChange={handleCaravanaChange}
                maxLength={7}
                required
              />
              <small className="text-muted">
                Hasta 4 números (Ej: <strong>{prefijoActual}-1234</strong>)
              </small>
            </div>

            {/* Raza */}
            <div className="col-md-6">
              <label className="form-label">Raza:</label>
              <select
                className="form-select"
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                required
              >
                <option value="">Seleccione una raza...</option>
                {razasDisponibles.map((raza) => (
                  <option key={raza} value={raza}>
                    {raza}
                  </option>
                ))}
              </select>
            </div>

            {/* Sexo */}
            <div className="col-md-6">
              <label className="form-label">Sexo:</label>
              <select
                className="form-select"
                value={formData.sexo}
                onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                required
              >
                <option value="">Seleccione...</option>
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>

            {/* Origen */}
            <div className="col-md-6">
              <label className="form-label">Origen:</label>
              <select
                className="form-select"
                value={formData.origen}
                onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
              >
                <option value="Compra">Compra / Ingreso</option>
                <option value="Nacimiento">Nacimiento en el campo</option>
              </select>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="col-md-6">
              <label className="form-label">Fecha de Nacimiento:</label>
              <input
                type="date"
                className="form-control"
                max={hoy}
                value={formData.fecha_nacimiento}
                onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                required
              />
            </div>

            {/* Progenitores (solo si es Nacimiento) */}
            {formData.origen === 'Nacimiento' && (
              <>
                <div className="col-md-6">
                  <label className="form-label">Madre (Opcional):</label>
                  <select
                    className="form-select"
                    value={formData.madre_id}
                    onChange={(e) => setFormData({ ...formData, madre_id: e.target.value })}
                  >
                    <option value="">Desconocida / Sin registrar</option>
                    {hembrasDisponibles.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.caravana} ({m.raza})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Padre (Opcional):</label>
                  <select
                    className="form-select"
                    value={formData.padre_id}
                    onChange={(e) => setFormData({ ...formData, padre_id: e.target.value })}
                  >
                    <option value="">Desconocido / Sin registrar</option>
                    {machosDisponibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.caravana} ({p.raza})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Potrero Asignado */}
            <div className="col-md-4">
              <label className="form-label">Potrero Asignado:</label>
              <select
                className="form-select"
                value={formData.potrero_id}
                onChange={(e) => setFormData({ ...formData, potrero_id: e.target.value })}
                disabled={formData.estado !== 'Activo'}
              >
                <option value="">Sin asignar...</option>
                {potreros.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Peso */}
            <div className="col-md-4">
              <label className="form-label">Peso Inicial / Actual (kg):</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="2000"
                className="form-control"
                placeholder="Ej: 320"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                required
              />
              <small className="text-muted">Entre 0,5 y 2.000 kg.</small>
            </div>

            {/* Estado */}
            <div className="col-md-4">
              <label className="form-label">Estado:</label>
              <select className="form-select bg-light" value={formData.estado} disabled>
                <option value="Activo">Activo</option>
                <option value="Vendido">Vendido</option>
                <option value="Muerto">Muerto</option>
              </select>
              <small className="text-muted">
                Ventas y bajas se registran en <strong>Movimientos</strong>.
              </small>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button type="submit" className="btn btn-success">
              Guardar
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/animales')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}