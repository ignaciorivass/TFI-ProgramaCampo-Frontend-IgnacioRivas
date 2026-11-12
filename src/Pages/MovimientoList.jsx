import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const MovimientoList = () => {
  const [movimientos, setMovimientos] = useState([]);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const fetchMovimientos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/movimientos', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovimientos(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchMovimientos(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Desea eliminar este movimiento del historial?')) {
      try {
        await axios.delete(`http://localhost:3000/api/movimientos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchMovimientos();
      } catch (error) { alert('Error al eliminar el movimiento.'); }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Historial de Movimientos</h2>
        <Link to="/movimientos/nuevo" className="btn btn-success">Registrar Traslado/Baja</Link>
      </div>
      <table className="table table-striped table-bordered shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Fecha</th>
            <th>Caravana</th>
            <th>Tipo</th>
            <th>Origen</th>
            <th>Destino</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map(m => (
            <tr key={m.id}>
              <td>{new Date(m.fecha).toLocaleDateString()}</td>
              <td className="fw-bold">{m.caravana}</td>
              <td><span className="badge bg-primary">{m.tipo}</span></td>
              <td>{m.origen || '-'}</td>
              <td>{m.destino || '-'}</td>
              <td>
                <Link to={`/movimientos/editar/${m.id}`} className="btn btn-warning btn-sm me-1">Editar</Link>
                {user?.rol === 'Administrador' && (
                  <button onClick={() => handleDelete(m.id)} className="btn btn-danger btn-sm">Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MovimientoList;