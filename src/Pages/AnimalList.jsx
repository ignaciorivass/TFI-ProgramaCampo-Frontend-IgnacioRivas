import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL, authHeaders } from '../config';
import ModalConfirmar from '../components/ModalConfirmar';

export default function AnimalList() {
  const navigate = useNavigate();
  const user    = useAuthStore((s) => s.user);
  const isAdmin = user?.rol === 'Administrador';

  const [animales,  setAnimales]  = useState([]);
  const [potreros,  setPotreros]  = useState([]);
  const [cargando,  setCargando]  = useState(true);
  const [error,     setError]     = useState('');

  // Búsqueda y filtros
  const [busqueda,     setBusqueda]     = useState('');
  const [filtroPotrero, setFiltroPotrero] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState('');

  // Modal de confirmación de eliminación
  const [modalVisible,     setModalVisible]     = useState(false);
  const [idParaEliminar,   setIdParaEliminar]   = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Solicita en paralelo animales y potreros para completar la tabla y los filtros
      const [resAnim, resPot] = await Promise.all([
        axios.get(`${API_URL}/animales`, authHeaders()),
        axios.get(`${API_URL}/potreros`, authHeaders()),
      ]);
      setAnimales(resAnim.data);
      setPotreros(resPot.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el listado de animales.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  // Abre el modal pidiendo confirmación antes de eliminar
  const pedirConfirmacion = (id) => {
    setIdParaEliminar(id);
    setModalVisible(true);
  };

  const confirmarEliminar = async () => {
    setModalVisible(false);
    try {
      await axios.delete(`${API_URL}/animales/${idParaEliminar}`, authHeaders());
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el animal.');
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
    const a = animales.find((x) => String(x.id) === String(id));
    return a ? a.caravana : `#${id}`;
  };

  // Aplica búsqueda de texto libre y todos los filtros de selección
  const animalesFiltrados = animales.filter((a) => {
    const txt = busqueda.toLowerCase();
    const coincideTexto =
      (a.caravana || '').toLowerCase().includes(txt) ||
      (a.raza    || '').toLowerCase().includes(txt);
    const coincidePotrero = filtroPotrero
      ? String(a.potrero_id) === String(filtroPotrero) && a.estado === 'Activo'
      : true;
    const coincideEspecie = filtroEspecie ? a.especie === filtroEspecie : true;
    const coincideEstado  = filtroEstado  ? a.estado  === filtroEstado  : true;
    return coincideTexto && coincidePotrero && coincideEspecie && coincideEstado;
  });

  // Resumen rápido (usa el conjunto completo, no el filtrado)
  const totalActivos     = animales.filter((a) => a.estado === 'Activo').length;
  const totalNacimientos = animales.filter((a) => a.origen === 'Nacimiento').length;

  return (
    <div>
      {/* Modal de confirmación (no usa window.confirm) */}
      <ModalConfirmar
        visible={modalVisible}
        titulo="Eliminar animal"
        mensaje="¿Seguro que querés eliminar este animal? Esta acción no se puede deshacer."
        onConfirmar={confirmarEliminar}
        onCancelar={() => setModalVisible(false)}
      />

      {/* Encabezado para impresión */}
      <div className="d-none d-print-block mb-3 border-bottom pb-2">
        <h4 className="mb-0">Sistema Ganadero – Reporte de Existencias de Animales</h4>
        <small className="text-muted">Fecha: {new Date().toLocaleDateString('es-AR')}</small>
      </div>

      {/* Título + botones de acción */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h2 className="mb-0">Listado de Animales</h2>
        <div className="d-flex gap-2 d-print-none">
          <button className="btn btn-outline-secondary" onClick={() => window.print()}>
            Imprimir
          </button>
          <button className="btn btn-success" onClick={() => navigate('/animales/nuevo')}>
            + Registrar Animal
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tarjetas de resumen */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <small>Total Registrados</small>
              <h3 className="mb-0 fw-bold">{animales.length} cabezas</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <small>Activos en Campo</small>
              <h3 className="mb-0 fw-bold">{totalActivos} cabezas</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
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
            <select className="form-select" value={filtroPotrero} onChange={(e) => setFiltroPotrero(e.target.value)}>
              <option value="">Todos los Potreros</option>
              {potreros.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filtroEspecie} onChange={(e) => setFiltroEspecie(e.target.value)}>
              <option value="">Todas las Especies</option>
              {['Bovino','Ovino','Equino','Porcino','Caprino'].map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Vendido">Vendido</option>
              <option value="Muerto">Muerto / Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estado de carga */}
      {cargando && (
        <div className="text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2" />
          Cargando animales...
        </div>
      )}

      {/* Tabla */}
      {!cargando && (
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
                  <td colSpan="8" className="text-center py-5 text-muted">
                    No hay animales para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                animalesFiltrados.map((a) => {
                  let badgeEstado = 'bg-success';
                  if (a.estado === 'Vendido') badgeEstado = 'bg-warning text-dark';
                  if (a.estado === 'Muerto')  badgeEstado = 'bg-danger';

                  const madreCaravana = obtenerCaravanaPorId(a.madre_id);
                  const padreCaravana = obtenerCaravanaPorId(a.padre_id);

                  return (
                    <tr key={a.id}>
                      <td className="fw-bold">{a.caravana}</td>
                      <td>{a.especie} – {a.raza}</td>
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
                      <td><span className={`badge ${badgeEstado}`}>{a.estado}</span></td>
                      <td className="d-print-none">
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => navigate(`/animales/editar/${a.id}`)}
                          >
                            Editar
                          </button>
                          {isAdmin && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => pedirConfirmacion(a.id)}
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
      )}
    </div>
  );
}
