import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL, authHeaders } from '../config';
import ModalConfirmar from '../components/ModalConfirmar';

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return '-';
  const soloFecha = String(fechaStr).split('T')[0];
  const [anio, mes, dia] = soloFecha.split('-');
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : soloFecha;
};

export default function PesajeList() {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);
  const isAdmin  = user?.rol === 'Administrador';

  const [pesajes,  setPesajes]  = useState([]);
  const [animales, setAnimales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');

  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroFecha,   setFiltroFecha]   = useState('');

  const [modalVisible,   setModalVisible]   = useState(false);
  const [idParaEliminar, setIdParaEliminar] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      // Descarga pesajes y animales para relacionar cada registro con su especie y caravana
      const [resPes, resAnim] = await Promise.all([
        axios.get(`${API_URL}/pesajes`,  authHeaders()),
        axios.get(`${API_URL}/animales`, authHeaders()),
      ]);
      setPesajes(resPes.data);
      setAnimales(resAnim.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el historial de pesajes.');
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
      await axios.delete(`${API_URL}/pesajes/${idParaEliminar}`, authHeaders());
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el pesaje.');
    }
  };

  const obtenerDatosAnimal = (pesaje) => {
    const animal = animales.find((a) => String(a.id) === String(pesaje.animal_id));
    return {
      caravana:   pesaje.caravana || animal?.caravana || `ID #${pesaje.animal_id}`,
      especie:    animal?.especie || '',
      especieRaza: animal ? `${animal.especie} – ${animal.raza}` : '-',
    };
  };

  const pesajesFiltrados = pesajes.filter((p) => {
    const info = obtenerDatosAnimal(p);
    const coincideEspecie = filtroEspecie ? info.especie === filtroEspecie : true;
    const fechaReg = p.fecha ? String(p.fecha).split('T')[0] : '';
    const coincideFecha = filtroFecha ? fechaReg === filtroFecha : true;
    return coincideEspecie && coincideFecha;
  });

  const hayFiltros   = filtroEspecie || filtroFecha;
  // Calcula el promedio con todos los pesajes, independientemente de los filtros de vista
  const pesoPromedio = pesajes.length > 0
    ? (pesajes.reduce((acc, p) => acc + Number(p.peso || 0), 0) / pesajes.length).toFixed(2)
    : '0.00';

  return (
    <div>
      <ModalConfirmar
        visible={modalVisible}
        titulo="Eliminar pesaje"
        mensaje="¿Seguro que querés eliminar este registro de pesaje?"
        onConfirmar={confirmarEliminar}
        onCancelar={() => setModalVisible(false)}
      />

      <div className="d-none d-print-block mb-3 border-bottom pb-2">
        <h4 className="mb-0">Sistema Ganadero – Reporte de Control de Pesajes</h4>
        <small className="text-muted">Fecha: {new Date().toLocaleDateString('es-AR')}</small>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h2 className="mb-0">Control de Pesajes y Evolución</h2>
        <div className="d-flex gap-2 d-print-none">
          <button className="btn btn-outline-secondary" onClick={() => window.print()}>Imprimir</button>
          <button className="btn btn-success" onClick={() => navigate('/pesajes/nuevo')}>+ Registrar Pesaje</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="card bg-success text-white shadow-sm">
            <div className="card-body">
              <small>Pesajes Registrados</small>
              <h3 className="mb-0 fw-bold">{pesajes.length} controles</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body">
              <small>Peso Promedio Registrado</small>
              <h3 className="mb-0 fw-bold">{pesoPromedio} kg</h3>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="card bg-secondary text-white shadow-sm">
            <div className="card-body">
              <small>Último Control</small>
              <h3 className="mb-0 fw-bold">{pesajes.length > 0 ? formatearFecha(pesajes[0].fecha) : '-'}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-4 shadow-sm d-print-none">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
            <select className="form-select" value={filtroEspecie} onChange={(e) => setFiltroEspecie(e.target.value)}>
              <option value="">Todas las Especies</option>
              {['Bovino','Ovino','Equino','Porcino','Caprino'].map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className={hayFiltros ? 'col-md-5' : 'col-md-6'}>
            <input type="date" className="form-control" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} title="Filtrar por fecha" />
          </div>
          {hayFiltros && (
            <div className="col-md-1">
              <button className="btn btn-outline-danger w-100" onClick={() => { setFiltroEspecie(''); setFiltroFecha(''); }} title="Limpiar filtros">Limpiar</button>
            </div>
          )}
        </div>
      </div>

      {cargando && (
        <div className="text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2" />
          Cargando pesajes...
        </div>
      )}

      {!cargando && (
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
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No hay pesajes para los filtros seleccionados.
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
                          <button className="btn btn-warning btn-sm" onClick={() => navigate(`/pesajes/editar/${p.id}`)}>Editar</button>
                          {isAdmin && (
                            <button className="btn btn-danger btn-sm" onClick={() => pedirConfirmacion(p.id)}>Eliminar</button>
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
