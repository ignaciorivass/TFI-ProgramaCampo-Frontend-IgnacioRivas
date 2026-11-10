import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const AnimalList = () => {
  const [animales, setAnimales] = useState([]);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const fetchAnimales = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/animales', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnimales(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnimales();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Desea eliminar este animal?')) {
      try {
        await axios.delete(`http://localhost:3000/api/animales/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAnimales();
      } catch (error) {
        alert(error.response?.data?.message || 'No se puede eliminar porque tiene datos asociados.');
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Listado de Animales</h2>
        <Link to="/animales/nuevo" className="btn btn-success">Registrar Animal</Link>
      </div>
      <table className="table table-striped table-bordered shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Caravana</th>
            <th>Especie / Raza</th>
            <th>Sexo</th>
            <th>Fecha Nacimiento</th>
            <th>Peso (kg)</th>
            {user?.rol === 'Administrador' && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {animales.map(a => (
            <tr key={a.id}>
              <td className="fw-bold">{a.caravana}</td>
              <td>{a.especie || a.raza || '-'}</td>
              <td>{a.sexo}</td>
              <td>{a.fecha_nacimiento ? new Date(a.fecha_nacimiento).toLocaleDateString() : '-'}</td>
              <td>{a.peso}</td>
              {user?.rol === 'Administrador' && (
                <td>
                  <button onClick={() => handleDelete(a.id)} className="btn btn-danger btn-sm">Eliminar</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnimalList;