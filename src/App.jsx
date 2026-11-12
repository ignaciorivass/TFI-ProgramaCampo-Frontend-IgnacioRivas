import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Login from './Pages/Login';
import AnimalList from './Pages/AnimalList';
import AnimalForm from './Pages/AnimalForm';
import Register from './Pages/Register';
import PotreroList from './Pages/PotreroList';
import PotreroForm from './Pages/PotreroForm';
import MovimientoList from './Pages/MovimientoList';
import MovimientoForm from './Pages/MovimientoForm';
import VacunacionList from './Pages/VacunacionList';
import VacunacionForm from './Pages/VacunacionForm';
import PesajeList from './Pages/PesajeList';
import PesajeForm from './Pages/PesajeForm';


const App = () => {
  const token = useAuthStore(state => state.token);

  return (
    <BrowserRouter>
      {/* La barra de navegación solo está disponible durante una sesión autenticada. */}
      {token && <Navbar />}
      <div className="container mt-4">
        <Routes>
          {/* Las rutas públicas redirigen al área de trabajo si ya hay una sesión activa. */}
          <Route path="/" element={!token ? <Login /> : <Navigate to="/animales" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/animales" />} />

          {/* Las pantallas de gestión solo se registran para usuarios con sesión. */}
          {token && (
            <>
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
            </>
          )}
          {/* Cualquier dirección no reconocida vuelve a la entrada de la aplicación. */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
export default App;