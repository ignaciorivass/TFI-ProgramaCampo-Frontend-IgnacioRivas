import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const AnimalList = () => {
  const [animales, setAnimales] = useState([]);
  const [potreros, setPotreros] = useState([]);
  const [filtroPotrero, setFiltroPotrero] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busquedaRaza, setBusquedaRaza] = useState('');

  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const fetchData = async () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      const [resAnimales, resPotreros] = await Promise.all([
        axios.get('http://localhost:3000/api/animales', config),
        axios.get('http://localhost:3000/api/potreros', config)
      ]);
      setAnimales(resAnimales.data);
      setPotreros(resPotreros.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Desea eliminar este animal?')) {
      try {
        await axios.delete(`http://localhost:3000/api/animales/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (error) {
        alert(error.response?.data?.error || 'No se puede eliminar porque tiene registros asociados.');
      }
    }
  };

  const animalesFiltrados = animales.filter(a => {
    return (
      (filtroPotrero === '' || String(a.potrero_id) === filtroPotrero) &&
      (filtroEspecie === '' || a.especie === filtroEspecie) &&
      (filtroEstado === '' || (a.estado || 'Activo') === filtroEstado) &&
      (busquedaRaza === '' ||
        (a.raza || '').toLowerCase().includes(busquedaRaza.toLowerCase()) ||
        a.caravana.toLowerCase().includes(busquedaRaza.toLowerCase()))
    );
  });

  const activos = animales.filter(a => (a.estado || 'Activo') === 'Activo').length;
  const nacidosCampo = animales.filter(a => a.origen === 'Nacimiento').length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Listado y Existencias de Animales</h2>
          <small className="d-none d-print-block text-muted">
            Reporte emitido el {new Date().toLocaleDateString()} — Total en listado: {animalesFiltrados.length} animales
          </small>
        </div>
        <div className="d-print-none">
          <button onClick={() => window.print()} className="btn btn-outline-dark me-2">
            Imprimir Reporte
          </button>
          <Link to="/animales/nuevo" className="btn btn-success">Registrar Animal / Nacimiento</Link>
        </div>
      </div>

      {/* Tarjetas de Reporte Rápido (se ocultan al imprimir) */}
      <div className="row mb-3 d-print-none">
        <div className="col-md-4">
          <div className="card text-bg-success shadow-sm">
            <div className="card-body py-2">
              <small>Total Registrados</small>
              <h4 className="mb-0">{animales.length} cabezas</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-primary shadow-sm">
            <div className="card-body py-2">
              <small>Activos en Campo</small>
              <h4 className="mb-0">{activos} cabezas</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-bg-secondary shadow-sm">
            <div className="card-body py-2">
              <small>Nacimientos Propios</small>
              <h4 className="mb-0">{nacidosCampo} crías</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Consultas / Filtros (se oculta al imprimir) */}
      <div className="card p-3 mb-3 bg-light shadow-sm d-print-none">
        <div className="row g-2">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar caravana o raza..."
              value={busquedaRaza}
              onChange={e => setBusquedaRaza(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filtroPotrero} onChange={e => setFiltroPotrero(e.target.value)}>
              <option value="">Todos los Potreros</option>
              {potreros.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filtroEspecie} onChange={e => setFiltroEspecie(e.target.value)}>
              <option value="">Todas las Especies</option>
              <option value="Bovino">Bovino</option>
              <option value="Ovino">Ovino</option>
              <option value="Equino">Equino</option>
              <option value="Porcino">Porcino</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Vendido">Vendido</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      <table className="table table-striped table-bordered shadow-sm">
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
          {animalesFiltrados.map(a => (
            <tr key={a.id}>
              <td className="fw-bold">{a.caravana}</td>
              <td>{a.especie} - {a.raza}</td>
              <td>{a.sexo}</td>
              <td>
                <span className="badge bg-info text-dark me-1">{a.origen || 'Compra'}</span>
                {a.origen === 'Nacimiento' && (
                  <small className="d-block text-muted">
                    M: {a.madre_caravana || '-'} | P: {a.padre_caravana || '-'}
                  </small>
                )}
              </td>
              <td>{a.potrero_nombre || 'Sin asignar'}</td>
              <td>{a.peso} kg</td>
              <td>
                <span className={`badge ${a.estado === 'Vendido' ? 'bg-warning text-dark' : a.estado === 'Baja' ? 'bg-danger' : 'bg-success'}`}>
                  {a.estado || 'Activo'}
                </span>
              </td>
              <td className="d-print-none">
                <Link to={`/animales/editar/${a.id}`} className="btn btn-warning btn-sm me-1">Editar</Link>
                {user?.rol === 'Administrador' && (
                  <button onClick={() => handleDelete(a.id)} className="btn btn-danger btn-sm">Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnimalList;