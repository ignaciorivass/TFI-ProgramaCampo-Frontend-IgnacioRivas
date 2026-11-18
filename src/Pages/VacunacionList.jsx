import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL, authHeaders } from '../config';
import ModalConfirmar from '../components/ModalConfirmar';

// Catálogo base por si el backend aún no devuelve el catálogo
const VACUNAS_BASE = [
  { id: 1, nombre: 'Fiebre Aftosa - Biogénesis Bagó',   enfermedad: 'Fiebre Aftosa' },
  { id: 2, nombre: 'Brucelosis Cepa 19',                 enfermedad: 'Brucelosis Bovina' },
  { id: 3, nombre: 'Carbunclo Bacteridiano',             enfermedad: 'Carbunclo' },
  { id: 4, nombre: 'Clostridiosis Polivalente',          enfermedad: 'Mancha y Gangrena' },
  { id: 5, nombre: 'Ivermectina Antiparasitaria',        enfermedad: 'Parásitos internos y externos' },
];

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-';
  const soloFecha = String(fechaStr).split('T')[0];
  const [anio, mes, dia] = soloFecha.split('-');
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : soloFecha;
};

export default function VacunacionList() {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);
  const isAdmin  = user?.rol === 'Administrador';

  const [vacunaciones, setVacunaciones] = useState([]);
  const [animales,     setAnimales]     = useState([]);
  const [vacunas,      setVacunas]      = useState(VACUNAS_BASE);
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState('');

  const [filtroVacuna, setFiltroVacuna] = useState('');
  const [filtroFecha,  setFiltroFecha]  = useState('');

  const [modalVisible,   setModalVisible]   = useState(false);
  const [idParaEliminar, setIdParaEliminar] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError('');
    try {
      // Registros y animales se cargan en paralelo
      const [resVac, resAnim] = await Promise.all([
        axios.get(`${API_URL}/vacunaciones`, authHeaders()),
        axios.get(`${API_URL}/animales`,     authHeaders()),
      ]);
      setVacunaciones(resVac.data);
      setAnimales(resAnim.data);

      // El catálogo de vacunas puede no estar; se mantiene el base si falla
      try {
        const resCat = await axios.get(`${API_URL}/vacunaciones/vacunas`, authHeaders());
        if (resCat.data?.length > 0) setVacunas(resCat.data);
      } catch { /* mantiene el catálogo base */ }
    } catch (err) {
      console.error(err);
      setError('Error al cargar los registros sanitarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const pedirConfirmacion = (id) => {
    setIdParaEliminar(id);
    setModalVisible(true);
  };

  const confirmarEliminar = async () => {
    setModalVisible(false);
    try {
      await axios.delete(`${API_URL}/vacunaciones/${idParaEliminar}`, authHeaders());
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el registro.');
    }
  };

  const obtenerCaravana = (reg) => {
    if (reg.caravana) return reg.caravana;
    const animal = animales.find((a) => String(a.id) === String(reg.animal_id));
    return animal ? animal.caravana : `ID #${reg.animal_id}`;
  };

  const obtenerInfoVacuna = (reg) => {
    if (reg.vacuna_nombre) return { nombre: reg.vacuna_nombre, enfermedad: reg.enfermedad || '-' };
    const vac = vacunas.find((v) => String(v.id) === String(reg.vacuna_id));
    return vac
      ? { nombre: vac.nombre, enfermedad: vac.enfermedad || '-' }
      : { nombre: `Vacuna #${reg.vacuna_id}`, enfermedad: '-' };
  };

  const registrosFiltrados = vacunaciones.filter((v) => {
    const coincideVacuna = filtroVacuna ? String(v.vacuna_id) === String(filtroVacuna) : true;
    const fechaReg = v.fecha_aplicacion ? String(v.fecha_aplicacion).split('T')[0] : '';
    const coincideFecha = filtroFecha ? fechaReg === filtroFecha : true;
    return coincideVacuna && coincideFecha;
  });

  const hayFiltros = filtroVacuna || filtroFecha;
  const animalesCubiertos = new Set(vacunaciones.map((v) => v.animal_id)).size;

  return (
    <div>
      <ModalConfirmar
        visible={modalVisible}
        titulo="Eliminar vacunación"
        mensaje="¿Seguro que querés eliminar este registro de vacunación?"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setModalVisible(false)}
      />

      <div className="d-none d-print-block mb-3 border-bottom pb-2">
        <h4 className="mb-0">Sistema Ganadero – Reporte Sanitario y Vacunaciones</h4>
        <small className="text-muted">Fecha: {new Date().toLocaleDateString('es-AR')}</small>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h2 className="mb-0">Control Sanitario y Vacunaciones</h2>
        <div className="d-flex gap-2 d-print-none">
          <button className="btn btn-outline-secondary" onClick={() => window.print()}>Imprimir</button>
          <button className="btn btn-success" onClick={() => navigate('/vacunaciones/nuevo')}>+ Registrar Vacunación</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tarjetas de resumen */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <small>Dosis Aplicadas</small>
              <h3 className="mb-0 fw-bold">{vacunaciones.length} aplicaciones</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <small>Animales Tratados</small>
              <h3 className="mb-0 fw-bold">{animalesCubiertos} cabezas</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card bg-secondary text-white shadow-sm">
            <div className="card-body">
              <small>Última Aplicación</small>
              <h3 className="mb-0 fw-bold">
                {vacunaciones.length > 0 ? formatearFecha(vacunaciones[0].fecha_aplicacion) : '-'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-3 mb-4 shadow-sm d-print-none">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <select className="form-select" value={filtroVacuna} onChange={(e) => setFiltroVacuna(e.target.value)}>
              <option value="">Todas las Vacunas</option>
              {vacunas.map((v) => (
                <option key={v.id} value={v.id}>{v.nombre}</option>
              ))}
            </select>
          </div>
          <div className={hayFiltros ? 'col-md-5' : 'col-md-6'}>
            <input type="date" className="form-control" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} title="Filtrar por fecha" />
          </div>
          {hayFiltros && (
            <div className="col-md-1">
              <button className="btn btn-outline-danger w-100" onClick={() => { setFiltroVacuna(''); setFiltroFecha(''); }} title="Limpiar filtros">Limpiar</button>
            </div>
          )}
        </div>
      </div>

      {cargando && (
        <div className="text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2" />
          Cargando vacunaciones...
        </div>
      )}

      {!cargando && (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle mb-0 bg-white">
            <thead className="table-dark">
              <tr>
                <th>Fecha Aplicación</th>
                <th>Caravana</th>
                <th>Vacuna / Tratamiento</th>
                <th>Enfermedad Prevenida</th>
                <th>Dosis</th>
                <th className="d-print-none">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No hay vacunaciones para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((v) => {
                  const info = obtenerInfoVacuna(v);
                  return (
                    <tr key={v.id}>
                      <td>{formatearFecha(v.fecha_aplicacion)}</td>
                      <td className="fw-bold">{obtenerCaravana(v)}</td>
                      <td>{info.nombre}</td>
                      <td><span className="badge bg-info text-dark">{info.enfermedad}</span></td>
                      <td>{v.dosis}</td>
                      <td className="d-print-none">
                        <div className="d-flex gap-1">
                          <button className="btn btn-warning btn-sm" onClick={() => navigate(`/vacunaciones/editar/${v.id}`)}>Editar</button>
                          {isAdmin && (
                            <button className="btn btn-danger btn-sm" onClick={() => pedirConfirmacion(v.id)}>Eliminar</button>
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
