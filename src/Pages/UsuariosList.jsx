import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL, authHeaders } from '../config';
import ModalConfirmar from '../components/ModalConfirmar';

const solicitarUsuarios = () => axios.get(`${API_URL}/usuarios`, authHeaders());

export default function UsuariosList() {
  const usuarioActual = useAuthStore((state) => state.user);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargarUsuarios = async () => {
    try {
      const respuesta = await solicitarUsuarios();
      setUsuarios(respuesta.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;
    solicitarUsuarios()
      .then((respuesta) => {
        if (activo) {
          setUsuarios(respuesta.data);
          setError('');
        }
      })
      .catch((err) => {
        if (activo) {
          setError(err.response?.data?.message || 'No se pudieron cargar los usuarios.');
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const texto = busqueda.trim().toLowerCase();
    return (
      usuario.nombre.toLowerCase().includes(texto) ||
      usuario.email.toLowerCase().includes(texto) ||
      usuario.rol.toLowerCase().includes(texto)
    );
  });

  const confirmarEliminar = async () => {
    if (!usuarioSeleccionado || eliminando) return;
    setEliminando(true);
    setError('');
    try {
      await axios.delete(`${API_URL}/usuarios/${usuarioSeleccionado.id}`, authHeaders());
      setUsuarioSeleccionado(null);
      setCargando(true);
      await cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el usuario.');
      setUsuarioSeleccionado(null);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <section>
      <ModalConfirmar
        visible={Boolean(usuarioSeleccionado)}
        titulo="Eliminar usuario"
        mensaje={`¿Querés eliminar la cuenta de ${usuarioSeleccionado?.nombre}? Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setUsuarioSeleccionado(null)}
      />

      <header className="mb-4">
        <h1 className="h2 mb-1">Usuarios del sistema</h1>
        <p className="text-muted mb-0">Consultá las cuentas y administrá sus accesos.</p>
      </header>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <small className="text-muted">Cuentas registradas</small>
              <div className="kpi-valor">{usuarios.length}</div>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="card h-100">
            <div className="card-body">
              <small className="text-muted">Administradores</small>
              <div className="kpi-valor">
                {usuarios.filter((usuario) => usuario.rol === 'Administrador').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3 mb-4">
        <label htmlFor="buscar-usuario" className="form-label">Buscar usuario</label>
        <input
          id="buscar-usuario"
          type="search"
          className="form-control"
          placeholder="Nombre, correo o rol"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
      </div>

      {cargando ? (
        <div className="text-center py-5 text-muted" role="status">
          <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
          Cargando usuarios...
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Correo electrónico</th>
                <th scope="col">Rol</th>
                <th scope="col" className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    {usuarios.length === 0
                      ? 'Todavía no hay usuarios registrados.'
                      : 'No se encontraron usuarios con esa búsqueda.'}
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => {
                  const esUsuarioActual = String(usuario.id) === String(usuarioActual?.id);
                  return (
                    <tr key={usuario.id}>
                      <td className="fw-semibold">{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>
                        <span className={`badge ${usuario.rol === 'Administrador' ? 'bg-success' : 'bg-secondary'}`}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="text-end">
                        {esUsuarioActual ? (
                          <span className="small text-muted">Sesión actual</span>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={eliminando}
                            onClick={() => setUsuarioSeleccionado(usuario)}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
