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

const App = () => {
  const token = useAuthStore(state => state.token);

  return (
    <BrowserRouter>
      {token && <Navbar />}
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={!token ? <Login /> : <Navigate to="/animales" />} />
          <Route path="/register" element={!token ? <Register /> : <Navigate to="/animales" />} />

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
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
export default App;