import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const VacunacionList = () => {
  const [vacunaciones, setVacunaciones] = useState([]);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const fetchVacunaciones = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/vacunaciones', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setVacunaciones(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchVacunaciones(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Desea eliminar este registro de vacunación?')) {
      try {
        await axios.delete(`http://localhost:3000/api/vacunaciones/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchVacunaciones();
      } catch (error) { alert('Error al eliminar el registro.'); }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Historial Sanitario (Vacunaciones)</h2>
        <Link to="/vacunaciones/nuevo" className="btn btn-success">Registrar Vacuna</Link>
      </div>
      <table className="table table-striped table-bordered shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Fecha</th>
            <th>Caravana Animal</th>
            <th>Vacuna</th>
            <th>Dosis (ml)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vacunaciones.map(v => (
            <tr key={v.id}>
              <td>{new Date(v.fecha).toLocaleDateString()}</td>
              <td className="fw-bold">{v.caravana}</td>
              <td>{v.vacuna_nombre}</td>
              <td>{v.dosis}</td>
              <td>
                <Link to={`/vacunaciones/editar/${v.id}`} className="btn btn-warning btn-sm me-1">Editar</Link>
                {user?.rol === 'Administrador' && (
                  <button onClick={() => handleDelete(v.id)} className="btn btn-danger btn-sm">Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VacunacionList;