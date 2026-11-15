import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-';
  const soloFecha = String(fechaStr).split('T')[0];
  const [anio, mes, dia] = soloFecha.split('-');
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : soloFecha;
};

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

export default function PesajeList() {
  const navigate = useNavigate();
  const isAdmin = obtenerEsAdmin();

  const [pesajes, setPesajes] = useState([]);
  const [animales, setAnimales] = useState([]);

  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [error, setError] = useState('');

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const cargarDatos = async () => {
    try {
      const [resPes, resAnim] = await Promise.all([
        axios.get(`${API_URL}/pesajes`, getHeaders()),
        axios.get(`${API_URL}/animales`, getHeaders()),
      ]);
      setPesajes(resPes.data);
      setAnimales(resAnim.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el historial de pesajes.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este registro de pesaje?')) return;
    try {
      await axios.delete(`${API_URL}/pesajes/${id}`, getHeaders());
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el pesaje.');
    }
  };

  const obtenerDatosAnimal = (pesaje) => {
    const animal = animales.find((a) => String(a.id) === String(pesaje.animal_id));
    return {
      caravana: pesaje.caravana || animal?.caravana || `ID #${pesaje.animal_id}`,
      especie: animal?.especie || '',
      especieRaza: animal ? `${animal.especie} - ${animal.raza}` : '-',
    };
  };

  const pesajesFiltrados = pesajes.filter((p) => {
    const info = obtenerDatosAnimal(p);
    const coincideEspecie = filtroEspecie ? info.especie === filtroEspecie : true;
    const fechaReg = p.fecha ? String(p.fecha).split('T')[0] : '';
    const coincideFecha = filtroFecha ? fechaReg === filtroFecha : true;
    return coincideEspecie && coincideFecha;
  });

  const hayFiltros = filtroEspecie || filtroFecha;
  const pesoPromedio =
    pesajes.length > 0
      ? (pesajes.reduce((acc, p) => acc + Number(p.peso || 0), 0) / pesajes.length).toFixed(2)
      : '0.00';

  return (
    <div className="container mt-4">
      <div className="d-none d-print-block mb-3 border-bottom pb-2">
        <h4 className="mb-0">Sistema Ganadero - Reporte de Control de Pesajes</h4>
        <small className="text-muted">Fecha de emisión: {new Date().toLocaleDateString('es-AR')}</small>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Control de Pesajes y Evolución</h2>
        <div className="d-flex gap-2 d-print-none">
          <button className="btn btn-outline-secondary" onClick={() => window.print()}>
            Imprimir Reporte
          </button>
          <button className="btn btn-success" onClick={() => navigate('/pesajes/nuevo')}>
            Registrar Pesaje
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <small>Pesajes Registrados</small>
              <h3 className="mb-0 fw-bold">{pesajes.length} controles</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <small>Peso Promedio Registrado</small>
              <h3 className="mb-0 fw-bold">{pesoPromedio} kg</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-secondary text-white shadow-sm">
            <div className="card-body">
              <small>Último Control</small>
              <h3 className="mb-0 fw-bold">
                {pesajes.length > 0 ? formatearFecha(pesajes[0].fecha) : '-'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros por Especie y Fecha */}
      <div className="card p-3 mb-4 shadow-sm d-print-none">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
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

          <div className={hayFiltros ? 'col-md-5' : 'col-md-6'}>
            <input
              type="date"
              className="form-control"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              title="Filtrar por fecha"
            />
          </div>

          {hayFiltros && (
            <div className="col-md-1">
              <button
                className="btn btn-outline-danger w-100"
                onClick={() => {
                  setFiltroEspecie('');
                  setFiltroFecha('');
                }}
                title="Limpiar filtros"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-hover align-middle mb-0 bg-white">
          <thead className="table-dark">
            <tr>
              <th>Fecha</th>
              <th>Caravana</th>
              <th>Especie / Raza</th>
              <th>Peso Registrado</th>
              <th>Observaciones</th>
              <th className="d-print-none">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pesajesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No hay pesajes registrados para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              pesajesFiltrados.map((p) => {
                const info = obtenerDatosAnimal(p);
                return (
                  <tr key={p.id}>
                    <td>{formatearFecha(p.fecha)}</td>
                    <td className="fw-bold">{info.caravana}</td>
                    <td>{info.especieRaza}</td>
                    <td className="fw-semibold text-success">{Number(p.peso).toFixed(2)} kg</td>
                    <td>{p.observaciones || '-'}</td>
                    <td className="d-print-none">
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => navigate(`/pesajes/editar/${p.id}`)}
                        >
                          Editar
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(p.id)}
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