import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import { useAuthStore } from './store/authStore';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Si el servidor rechaza el token (vencido, firmado con otra clave, etc.), se cierra la sesión
// y se vuelve al login en vez de dejar la pantalla llena de errores 401.
// Solo se aplica a pedidos que enviaron token: un login con clave incorrecta no cierra nada.
axios.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const enviabaToken = Boolean(error.config?.headers?.Authorization);
    if (error.response?.status === 401 && enviabaToken) {
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Monta la aplicación React en el elemento raíz definido en index.html.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);