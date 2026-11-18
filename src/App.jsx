import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import UsuariosList from './Pages/UsuariosList';
import AnimalList from './Pages/AnimalList';
import AnimalForm from './Pages/AnimalForm';
import PotreroList from './Pages/PotreroList';
import PotreroForm from './Pages/PotreroForm';
import MovimientoList from './Pages/MovimientoList';
import MovimientoForm from './Pages/MovimientoForm';
import VacunacionList from './Pages/VacunacionList';
import VacunacionForm from './Pages/VacunacionForm';
import PesajeList from './Pages/PesajeList';
import PesajeForm from './Pages/PesajeForm';

const App = () => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas: redirigen al dashboard si ya hay sesión */}
        <Route
          path="/"
          element={!token ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* Rutas privadas envueltas en el Layout con Navbar + Sidebar */}
        {token ? (
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route
                    path="/usuarios"
                    element={user?.rol === 'Administrador' ? <UsuariosList /> : <Navigate to="/dashboard" replace />}
                  />

                  <Route path="/animales" element={<AnimalList />} />
                  <Route path="/animales/nuevo" element={<AnimalForm />} />
                  <Route path="/animales/editar/:id" element={<AnimalForm />} />

                  <Route path="/potreros" element={<PotreroList />} />
                  <Route path="/potreros/nuevo" element={<PotreroForm />} />
                  <Route path="/potreros/editar/:id" element={<PotreroForm />} />

                  <Route path="/movimientos" element={<MovimientoList />} />
                  <Route path="/movimientos/nuevo" element={<MovimientoForm />} />
                  <Route path="/movimientos/editar/:id" element={<MovimientoForm />} />

                  <Route path="/vacunaciones" element={<VacunacionList />} />
                  <Route path="/vacunaciones/nuevo" element={<VacunacionForm />} />
                  <Route path="/vacunaciones/editar/:id" element={<VacunacionForm />} />

                  <Route path="/pesajes" element={<PesajeList />} />
                  <Route path="/pesajes/nuevo" element={<PesajeForm />} />
                  <Route path="/pesajes/editar/:id" element={<PesajeForm />} />

                  {/* Cualquier ruta desconocida vuelve al dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            }
          />
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
