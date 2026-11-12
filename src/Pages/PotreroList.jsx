import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const PotreroList = () => {
  const [potreros, setPotreros] = useState([]);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const fetchPotreros = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/potreros', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setPotreros(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchPotreros(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar potrero definitivamente?')) {
      try {
        await axios.delete(`http://localhost:3000/api/potreros/${id}`, { 
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchPotreros();
      } catch (error) {
        alert(error.response?.data?.error || 'No se puede eliminar: hay animales en este potrero.');
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Gestión de Potreros</h2>
        <Link to="/potreros/nuevo" className="btn btn-success">Nuevo Potrero</Link>
      </div>
      <table className="table table-striped table-bordered shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Nombre</th>
            <th>Superficie (ha)</th>
            <th>Capacidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {potreros.map(p => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.superficie}</td>
              <td>{p.capacidad} animales</td>
              <td>
                <Link to={`/potreros/editar/${p.id}`} className="btn btn-warning btn-sm me-1">Editar</Link>
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

export default PotreroList;