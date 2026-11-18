// Dirección del backend. Si cambia el puerto o el servidor, se modifica solo acá.
export const API_ORIGIN = 'http://localhost:3000';
export const API_URL = `${API_ORIGIN}/api`;

// Encabezado con el token JWT para las rutas protegidas.
export const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});
