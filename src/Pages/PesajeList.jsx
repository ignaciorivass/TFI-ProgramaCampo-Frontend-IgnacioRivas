import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const PesajeList = () => {
  const [pesajes, setPesajes] = useState([]);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const fetchPesajes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/pesajes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPesajes(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPesajes(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Desea eliminar este registro de pesaje?')) {
      try {
        await axios.delete(`http://localhost:3000/api/pesajes/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPesajes();
      } catch (error) { alert('Error al eliminar el pesaje.'); }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Historial de Pesajes</h2>
        <Link to="/pesajes/nuevo" className="btn btn-success">Registrar Pesaje</Link>
      </div>
      <table className="table table-striped table-bordered shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Fecha</th>
            <th>Caravana Animal</th>
            <th>Peso Registrado (kg)</th>
            <th>Observaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pesajes.map(p => (
            <tr key={p.id}>
              <td>{new Date(p.fecha).toLocaleDateString()}</td>
              <td className="fw-bold">{p.caravana}</td>
              <td>{p.peso} kg</td>
              <td>{p.observaciones || '-'}</td>
              <td>
                <Link to={`/pesajes/editar/${p.id}`} className="btn btn-warning btn-sm me-1">Editar</Link>
                {user?.rol === 'Administrador' && (
                  <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-sm">Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PesajeList;