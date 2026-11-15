import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const obtenerEsAdmin = () => {
  try {
    const userDirecto = JSON.parse(localStorage.getItem('user') || 'null');
    if (userDirecto?.rol) return userDirecto.rol === 'Administrador';

    const zustandStorage = JSON.parse(localStorage.getItem('auth-storage') || 'null');
    if (zustandStorage?.state?.user?.rol) {
      return zustandStorage.state.user.rol === 'Administrador';
    }
  } catch {
    // Ignora error
  }
  return localStorage.getItem('rol') === 'Administrador';
};

export default function AnimalList() {
  const navigate = useNavigate();
  const isAdmin = obtenerEsAdmin();

  const [animales, setAnimales] = useState([]);
  const [potreros, setPotreros] = useState([]);

  const [busqueda, setBusqueda] = useState('');
  const [filtroPotrero, setFiltroPotrero] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [error, setError] = useState('');

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const cargarDatos = async () => {
    try {
      const [resAnim, resPot] = await Promise.all([
        axios.get(`${API_URL}/animales`, getHeaders()),
        axios.get(`${API_URL}/potreros`, getHeaders()),
      ]);
      setAnimales(resAnim.data);
      setPotreros(resPot.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el listado de animales.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este animal?')) return;
    try {
      await axios.delete(`${API_URL}/animales/${id}`, getHeaders());
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el animal.');
    }
  };

  const obtenerNombrePotrero = (animal) => {
    if (animal.estado !== 'Activo') return '-';
    if (animal.potrero_nombre) return animal.potrero_nombre;
    if (!animal.potrero_id) return '-';
    const pot = potreros.find((p) => String(p.id) === String(animal.potrero_id));
    return pot ? pot.nombre : '-';
  };

  const obtenerCaravanaPorId = (id) => {
    if (!id) return null;
    const encontrado = animales.find((a) => String(a.id) === String(id));
    return encontrado ? encontrado.caravana : `#${id}`;
  };

  const animalesFiltrados = animales.filter((a) => {
    const texto = busqueda.toLowerCase();
    const coincideTexto =
      (a.caravana || '').toLowerCase().includes(texto) ||
      (a.raza || '').toLowerCase().includes(texto);
    const coincidePotrero = filtroPotrero
      ? String(a.potrero_id) === String(filtroPotrero) && a.estado === 'Activo'
      : true;
    const coincideEspecie = filtroEspecie ? a.especie === filtroEspecie : true;
    const coincideEstado = filtroEstado ? a.estado === filtroEstado : true;

    return coincideTexto && coincidePotrero && coincideEspecie && coincideEstado;
  });

  const totalActivos = animales.filter((a) => a.estado === 'Activo').length;
  const totalNacimientos = animales.filter((a) => a.origen === 'Nacimiento').length;

  return (
    <div className="container mt-4">
      <div className="d-none d-print-block mb-3 border-bottom pb-2">
        <h4 className="mb-0">Sistema Ganadero - Reporte de Existencias de Animales</h4>
        <small className="text-muted">Fecha de emisión: {new Date().toLocaleDateString('es-AR')}</small>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Listado y Existencias de Animales</h2>
        <div className="d-flex gap-2 d-print-none">
          <button className="btn btn-outline-secondary" onClick={() => window.print()}>
            Imprimir Reporte
          </button>
          <button className="btn btn-success" onClick={() => navigate('/animales/nuevo')}>
            Registrar Animal / Nacimiento
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <small>Total Registrados</small>
              <h3 className="mb-0 fw-bold">{animales.length} cabezas</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <small>Activos en Campo</small>
              <h3 className="mb-0 fw-bold">{totalActivos} cabezas</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-secondary text-white shadow-sm">
            <div className="card-body">
              <small>Nacimientos Propios</small>
              <h3 className="mb-0 fw-bold">{totalNacimientos} crías</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="card p-3 mb-4 shadow-sm d-print-none">
        <div className="row g-2">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar caravana o raza..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filtroPotrero}
              onChange={(e) => setFiltroPotrero(e.target.value)}
            >
              <option value="">Todos los Potreros</option>
              {potreros.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filtroEspecie}
              onChange={(e) => setFiltroEspecie(e.target.value)}
            >
              <option value="">Todas las Especies</option>
              <option value="Bovino">Bovino</option>
              <option value="Ovino">Ovino</option>
              <option value="Equino">Equino</option>
              <option value="Porcino">Porcino</option>
              <option value="Caprino">Caprino</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Vendido">Vendido</option>
              <option value="Muerto">Muerto / Baja</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle mb-0 bg-white">
          <thead className="table-dark">
            <tr>
              <th>Caravana</th>
              <th>Especie / Raza</th>
              <th>Sexo</th>
              <th>Origen / Progenitores</th>
              <th>Potrero</th>
              <th>Peso (kg)</th>
              <th>Estado</th>
              <th className="d-print-none">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {animalesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  No hay animales registrados para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              animalesFiltrados.map((a) => {
                let badgeEstado = 'bg-success';
                if (a.estado === 'Vendido') badgeEstado = 'bg-warning text-dark';
                if (a.estado === 'Muerto') badgeEstado = 'bg-danger';

                const madreCaravana = obtenerCaravanaPorId(a.madre_id);
                const padreCaravana = obtenerCaravanaPorId(a.padre_id);

                return (
                  <tr key={a.id}>
                    <td className="fw-bold">{a.caravana}</td>
                    <td>
                      {a.especie} - {a.raza}
                    </td>
                    <td>{a.sexo}</td>
                    <td>
                      <span className="badge bg-info text-dark">{a.origen || 'Compra'}</span>
                      {a.origen === 'Nacimiento' && (madreCaravana || padreCaravana) && (
                        <div className="small text-muted mt-1">
                          {madreCaravana ? `M: ${madreCaravana}` : ''}
                          {madreCaravana && padreCaravana ? ' | ' : ''}
                          {padreCaravana ? `P: ${padreCaravana}` : ''}
                        </div>
                      )}
                    </td>
                    <td>{obtenerNombrePotrero(a)}</td>
                    <td>{Number(a.peso || 0).toFixed(2)} kg</td>
                    <td>
                      <span className={`badge ${badgeEstado}`}>{a.estado}</span>
                    </td>
                    <td className="d-print-none">
                      <div className="d-flex flex-column gap-1">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => navigate(`/animales/editar/${a.id}`)}
                        >
                          Editar
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(a.id)}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}