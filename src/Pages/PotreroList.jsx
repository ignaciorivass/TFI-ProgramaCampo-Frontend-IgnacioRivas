import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL, authHeaders } from '../config';
import ModalConfirmar from '../components/ModalConfirmar';

export default function PotreroList() {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);
  const isAdmin  = user?.rol === 'Administrador';

  const [potreros,  setPotreros]  = useState([]);
  const [animales,  setAnimales]  = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState('');

  // Modal de confirmación
  const [modalVisible,   setModalVisible]   = useState(false);
  const [idParaEliminar, setIdParaEliminar] = useState(null);
  const [nombreParaEliminar, setNombreParaEliminar] = useState('');

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Se necesitan potreros y animales para calcular la ocupación de cada lote
      const [resPotreros, resAnimales] = await Promise.all([
        axios.get(`${API_URL}/potreros`, authHeaders()),
        axios.get(`${API_URL}/animales`, authHeaders()),
      ]);
      setPotreros(resPotreros.data);
      setAnimales(resAnimales.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los potreros y existencias.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const pedirConfirmacion = (id, nombre) => {
    setIdParaEliminar(id);
    setNombreParaEliminar(nombre);
    setModalVisible(true);
  };

  const confirmarEliminar = async () => {
    setModalVisible(false);
    try {
      await axios.delete(`${API_URL}/potreros/${idParaEliminar}`, authHeaders());
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el potrero.');
    }
  };

  // Filtra solo animales activos para calcular la carga real de cada potrero
  const animalesActivos = animales.filter((a) => a.estado === 'Activo');
  const contarAnimalesEnPotrero = (potreroId) =>
    animalesActivos.filter((a) => String(a.potrero_id) === String(potreroId)).length;

  // Totales para las tarjetas superiores
  const totalHectareas       = potreros.reduce((acc, p) => acc + Number(p.superficie || 0), 0);
  const capacidadTotalCampo  = potreros.reduce((acc, p) => acc + Number(p.capacidad   || 0), 0);
  const totalUbicados        = potreros.reduce((acc, p) => acc + contarAnimalesEnPotrero(p.id), 0);

  return (
    <div>
      <ModalConfirmar
        visible={modalVisible}
        titulo="Eliminar potrero"
        mensaje={`¿Seguro que querés eliminar el potrero "${nombreParaEliminar}"?`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setModalVisible(false)}
      />

      <div className="d-none d-print-block mb-3 border-bottom pb-2">
        <h4 className="mb-0">Sistema Ganadero – Reporte de Potreros</h4>
        <small className="text-muted">Fecha: {new Date().toLocaleDateString('es-AR')}</small>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h2 className="mb-0">Gestión y Ocupación de Potreros</h2>
        <div className="d-flex gap-2 d-print-none">
          <button className="btn btn-outline-secondary" onClick={() => window.print()}>Imprimir</button>
          <button className="btn btn-success" onClick={() => navigate('/potreros/nuevo')}>+ Registrar Potrero</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tarjetas de resumen */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <small>Potreros Habilitados</small>
              <h3 className="mb-0 fw-bold">{potreros.length} lotes</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <small>Superficie Total</small>
              <h3 className="mb-0 fw-bold">{totalHectareas.toFixed(2)} ha</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card bg-secondary text-white shadow-sm">
            <div className="card-body">
              <small>Ocupación Global</small>
              <h3 className="mb-0 fw-bold">{totalUbicados} / {capacidadTotalCampo} cabezas</h3>
            </div>
          </div>
        </div>
      </div>

      {cargando && (
        <div className="text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2" />
          Cargando potreros...
        </div>
      )}

      {!cargando && (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="table-dark">
              <tr>
                <th>Nombre</th>
                <th>Superficie</th>
                <th style={{ minWidth: '220px' }}>Ocupación / Capacidad</th>
                <th>Disponibilidad</th>
                <th>Estado</th>
                <th className="d-print-none">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {potreros.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No hay potreros registrados.
                  </td>
                </tr>
              ) : (
                potreros.map((p) => {
                  const ocupados    = contarAnimalesEnPotrero(p.id);
                  const capacidad   = Number(p.capacidad) || 0;
                  const disponibles = Math.max(capacidad - ocupados, 0);
                  const porcentaje  = capacidad > 0 ? Math.min(Math.round((ocupados / capacidad) * 100), 100) : 0;

                  let colorBarra = 'bg-success';
                  let badgeEstado = <span className="badge bg-success">Disponible</span>;
                  if (ocupados >= capacidad && capacidad > 0) {
                    colorBarra  = 'bg-danger';
                    badgeEstado = <span className="badge bg-danger">Capacidad Llena</span>;
                  } else if (porcentaje >= 75) {
                    colorBarra  = 'bg-warning';
                    badgeEstado = <span className="badge bg-warning text-dark">Casi Lleno</span>;
                  }

                  return (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.nombre}</td>
                      <td>{Number(p.superficie).toFixed(2)} ha</td>
                      <td>
                        <div className="d-flex justify-content-between small mb-1">
                          <span><strong>{ocupados}</strong> / {capacidad} cabezas</span>
                          <span className="text-muted">{porcentaje}%</span>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar ${colorBarra}`}
                            role="progressbar"
                            style={{ width: `${porcentaje}%` }}
                            aria-valuenow={porcentaje}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </td>
                      <td>
                        {disponibles > 0
                          ? <span className="text-success fw-semibold">{disponibles} lugares libres</span>
                          : <span className="text-danger fw-semibold">Sin cupo</span>
                        }
                      </td>
                      <td>{badgeEstado}</td>
                      <td className="d-print-none">
                        <div className="d-flex gap-1">
                          <button className="btn btn-warning btn-sm" onClick={() => navigate(`/potreros/editar/${p.id}`)}>Editar</button>
                          {isAdmin && (
                            <button className="btn btn-danger btn-sm" onClick={() => pedirConfirmacion(p.id, p.nombre)}>Eliminar</button>
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
      )}
    </div>
  );
}
