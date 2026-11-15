import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function PotreroList() {
  const navigate = useNavigate();
  const [potreros, setPotreros] = useState([]);
  const [animales, setAnimales] = useState([]);
  const [error, setError] = useState('');

  // Verifica el rol para ocultar el botón Eliminar si es Peón
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const rol = user.rol || localStorage.getItem('rol');
  const isAdmin = rol === 'Administrador';

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const cargarDatos = async () => {
    try {
      const [resPotreros, resAnimales] = await Promise.all([
        axios.get(`${API_URL}/potreros`, getHeaders()),
        axios.get(`${API_URL}/animales`, getHeaders()),
      ]);
      setPotreros(resPotreros.data);
      setAnimales(resAnimales.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los potreros y existencias.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el potrero "${nombre}"?`)) return;

    try {
      await axios.delete(`${API_URL}/potreros/${id}`, getHeaders());
      cargarDatos();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el potrero.');
    }
  };

  // Filtra solo animales activos para calcular la carga real de cada potrero
  const animalesActivos = animales.filter((a) => a.estado === 'Activo');

  const contarAnimalesEnPotrero = (potreroId) => {
    return animalesActivos.filter((a) => String(a.potrero_id) === String(potreroId)).length;
  };

  // Totales para las tarjetas superiores
  const totalHectareas = potreros.reduce((acc, p) => acc + Number(p.superficie || 0), 0);
  const capacidadTotalCampo = potreros.reduce((acc, p) => acc + Number(p.capacidad || 0), 0);
  const totalUbicados = potreros.reduce((acc, p) => acc + contarAnimalesEnPotrero(p.id), 0);

  return (
    <div className="container mt-4">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Gestión y Ocupación de Potreros</h2>
        <div className="d-flex gap-2 d-print-none">
          <button
            className="btn btn-outline-secondary"
            onClick={() => window.print()}
          >
            Imprimir Reporte
          </button>
          <button
            className="btn btn-success"
            onClick={() => navigate('/potreros/nuevo')}
          >
            Registrar Potrero
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tarjetas de resumen (mismo estilo que Animales) */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <small>Potreros Habilitados</small>
              <h3 className="mb-0 fw-bold">{potreros.length} lotes</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <small>Superficie Total</small>
              <h3 className="mb-0 fw-bold">{totalHectareas.toFixed(2)} ha</h3>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-secondary text-white shadow-sm">
            <div className="card-body">
              <small>Ocupación Global del Campo</small>
              <h3 className="mb-0 fw-bold">
                {totalUbicados} / {capacidadTotalCampo} cabezas
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Potreros */}
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
                <td colSpan="6" className="text-center py-4 text-muted">
                  No hay potreros registrados.
                </td>
              </tr>
            ) : (
              potreros.map((p) => {
                const ocupados = contarAnimalesEnPotrero(p.id);
                const capacidad = Number(p.capacidad) || 0;
                const disponibles = Math.max(capacidad - ocupados, 0);
                const porcentaje = capacidad > 0 ? Math.min(Math.round((ocupados / capacidad) * 100), 100) : 0;

                // Color dinámico según el nivel de carga del potrero
                let colorBarra = 'bg-success';
                let badgeEstado = <span className="badge bg-success">Disponible</span>;

                if (ocupados >= capacidad && capacidad > 0) {
                  colorBarra = 'bg-danger';
                  badgeEstado = <span className="badge bg-danger">Capacidad Llena</span>;
                } else if (porcentaje >= 75) {
                  colorBarra = 'bg-warning';
                  badgeEstado = <span className="badge bg-warning text-dark">Casi Lleno</span>;
                }

                return (
                  <tr key={p.id}>
                    <td className="fw-bold">{p.nombre}</td>
                    <td>{Number(p.superficie).toFixed(2)} ha</td>
                    <td>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>
                          <strong>{ocupados}</strong> / {capacidad} cabezas
                        </span>
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
                      {disponibles > 0 ? (
                        <span className="text-success fw-semibold">{disponibles} lugares libres</span>
                      ) : (
                        <span className="text-danger fw-semibold">Sin cupo</span>
                      )}
                    </td>
                    <td>{badgeEstado}</td>
                    <td className="d-print-none">
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => navigate(`/potreros/editar/${p.id}`)}
                        >
                          Editar
                        </button>
                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleEliminar(p.id, p.nombre)}
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