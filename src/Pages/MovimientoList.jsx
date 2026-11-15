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

export default function MovimientoList() {
  const navigate = useNavigate();
  const isAdmin = obtenerEsAdmin();

  const [movimientos, setMovimientos] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [potreros, setPotreros] = useState([]);

  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [error, setError] = useState('');

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const cargarDatos = async () => {
    try {
      const [resMov, resAnim, resPot] = await Promise.all([
        axios.get(`${API_URL}/movimientos`, getHeaders()),
        axios.get(`${API_URL}/animales`, getHeaders()),
        axios.get(`${API_URL}/potreros`, getHeaders()),
      ]);
      setMovimientos(resMov.data);
      setAnimales(resAnim.data);
      setPotreros(resPot.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el historial de movimientos.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este movimiento?')) return;
    try {
      await axios.delete(`${API_URL}/movimientos/${id}`, getHeaders());
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el movimiento.');
    }
  };

  const obtenerCaravana = (mov) => {
    if (mov.caravana) return mov.caravana;
    const animal = animales.find((a) => String(a.id) === String(mov.animal_id));
    return animal ? animal.caravana : `ID #${mov.animal_id}`;
  };

  const obtenerNombrePotrero = (potreroId, nombreJoin) => {
    if (nombreJoin) return nombreJoin;
    if (!potreroId) return '-';
    const potrero = potreros.find((p) => String(p.id) === String(potreroId));
    return potrero ? potrero.nombre : '-';
  };

  const movimientosFiltrados = movimientos.filter((m) => {
    const coincideTipo = filtroTipo ? m.tipo === filtroTipo : true;
    const fechaRegistro = m.fecha ? String(m.fecha).split('T')[0] : '';
    const coincideFecha = filtroFecha ? fechaRegistro === filtroFecha : true;
    return coincideTipo && coincideFecha;
  });

  const hayFiltros = filtroTipo || filtroFecha;
  const totalTraslados = movimientos.filter((m) => m.tipo === 'Traslado').length;
  const totalVentasBajas = movimientos.filter((m) => m.tipo === 'Venta' || m.tipo === 'Baja').length;

  return (
    <div className="container mt-4">
      <div className="d-none d-print-block mb-3 border-bottom pb-2">
        <h4 className="mb-0">Sistema Ganadero - Reporte de Movimientos</h4>
        <small className="text-muted">Fecha de emisión: {new Date().toLocaleDateString('es-AR')}</small>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Historial de Movimientos</h2>
        <div className="d-flex gap-2 d-print-none">
          <button className="btn btn-outline-secondary" onClick={() => window.print()}>
            Imprimir Reporte
          </button>
          <button className="btn btn-success" onClick={() => navigate('/movimientos/nuevo')}>
            Registrar Movimiento
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <small>Total Movimientos</small>
              <h3 className="mb-0 fw-bold">{movimientos.length} registros</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <small>Traslados entre Potreros</small>
              <h3 className="mb-0 fw-bold">{totalTraslados} traslados</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-secondary text-white shadow-sm">
            <div className="card-body">
              <small>Ventas y Bajas</small>
              <h3 className="mb-0 fw-bold">{totalVentasBajas} egresos</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros por Tipo y Fecha */}
      <div className="card p-3 mb-4 shadow-sm d-print-none">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <select
              className="form-select"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos los Tipos</option>
              <option value="Traslado">Traslado</option>
              <option value="Venta">Venta</option>
              <option value="Baja">Baja</option>
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
                  setFiltroTipo('');
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
              <th>Tipo</th>
              <th>Potrero Origen</th>
              <th>Potrero Destino</th>
              <th>Motivo</th>
              <th className="d-print-none">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  No hay movimientos registrados para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              movimientosFiltrados.map((m) => {
                let badgeClase = 'bg-info text-dark';
                if (m.tipo === 'Venta') badgeClase = 'bg-success';
                if (m.tipo === 'Baja') badgeClase = 'bg-danger';

                return (
                  <tr key={m.id}>
                    <td>{formatearFecha(m.fecha)}</td>
                    <td className="fw-bold">{obtenerCaravana(m)}</td>
                    <td>
                      <span className={`badge ${badgeClase}`}>{m.tipo}</span>
                    </td>
                    <td>{obtenerNombrePotrero(m.origen_potrero_id, m.origen_nombre)}</td>
                    <td>
                      {m.tipo === 'Traslado'
                        ? obtenerNombrePotrero(m.destino_potrero_id, m.destino_nombre)
                        : '-'}
                    </td>
                    <td>{m.motivo || '-'}</td>
                    <td className="d-print-none">
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => navigate(`/movimientos/editar/${m.id}`)}
                        >
                          Editar
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(m.id)}
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