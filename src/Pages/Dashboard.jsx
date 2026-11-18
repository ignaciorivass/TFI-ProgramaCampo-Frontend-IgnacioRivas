import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_URL, authHeaders } from '../config';
import heroImg from '../assets/campo-hero.svg';
import TarjetaGrafico from '../components/charts/TarjetaGrafico';
import GraficoArea from '../components/charts/GraficoArea';
import GraficoBarras from '../components/charts/GraficoBarras';
import GraficoDonut from '../components/charts/GraficoDonut';
import { COLORES } from '../components/charts/colores';

// Tarjeta numérica de resumen.
const Kpi = ({ titulo, valor, detalle }) => (
  <div className="col-6 col-lg-3">
    <div className="card kpi-card h-100">
      <div className="card-body">
        <small className="text-muted d-block">{titulo}</small>
        <div className="kpi-valor">{valor}</div>
        {detalle && <small className="text-muted">{detalle}</small>}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const esAdmin = user?.rol === 'Administrador';

  // Cada bloque del dashboard se carga por separado: si uno falla, los demás se siguen mostrando.
  const [resumen, setResumen] = useState(null);
  const [nacimientos, setNacimientos] = useState([]);
  const [porPotrero, setPorPotrero] = useState([]);
  const [porRaza, setPorRaza] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [ultimos, setUltimos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errores, setErrores] = useState({});

  useEffect(() => {
    const cargar = async () => {
      const pedidos = {
        resumen: [`${API_URL}/metricas/resumen`, setResumen],
        nacimientos: [`${API_URL}/metricas/nacimientos-por-mes`, setNacimientos],
        potrero: [`${API_URL}/metricas/animales-por-potrero`, setPorPotrero],
        raza: [`${API_URL}/metricas/animales-por-raza`, setPorRaza],
        vacunas: [`${API_URL}/metricas/vacunaciones-por-vacuna`, setVacunas],
        ultimos: [`${API_URL}/metricas/ultimos-animales`, setUltimos],
      };
      const claves = Object.keys(pedidos);
      // allSettled espera a todas las consultas y no se corta si alguna falla.
      const resultados = await Promise.allSettled(
        claves.map((k) => axios.get(pedidos[k][0], authHeaders()))
      );
      const nuevosErrores = {};
      resultados.forEach((r, i) => {
        const clave = claves[i];
        if (r.status === 'fulfilled') {
          pedidos[clave][1](r.value.data);
        } else {
          nuevosErrores[clave] = r.reason.response?.data?.message || 'No se pudieron cargar los datos.';
        }
      });
      setErrores(nuevosErrores);
      setCargando(false);
    };
    cargar();
  }, []);

  const accesos = [
    { texto: 'Registrar animal', ruta: '/animales/nuevo', clase: 'btn-success' },
    { texto: 'Registrar vacunación', ruta: '/vacunaciones/nuevo', clase: 'btn-outline-success' },
    { texto: 'Registrar pesaje', ruta: '/pesajes/nuevo', clase: 'btn-outline-success' },
    { texto: 'Nuevo movimiento', ruta: '/movimientos/nuevo', clase: 'btn-outline-success' },
  ];

  return (
    <div className="dashboard">
      {/* Banner de bienvenida */}
      <section className="hero-banner mb-4" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-texto">
          <h1 className="h3 fw-bold mb-1">Hola, {user?.nombre?.split(' ')[0]}</h1>
          <p className="mb-0">
            Resumen del establecimiento · {new Date().toLocaleDateString('es-AR', { dateStyle: 'full' })}
          </p>
          <span className="badge bg-light text-dark mt-2">{user?.rol}</span>
        </div>
      </section>

      {/* Accesos rápidos */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {accesos.map((a) => (
          <button key={a.ruta} className={`btn ${a.clase}`} onClick={() => navigate(a.ruta)}>
            {a.texto}
          </button>
        ))}
      </div>

      {/* Tarjetas de resumen */}
      {errores.resumen && <div className="alert alert-danger">{errores.resumen}</div>}
      <div className="row g-3 mb-4">
        <Kpi titulo="Animales activos" valor={resumen?.animales_activos ?? '–'} detalle={resumen ? `Peso promedio ${resumen.peso_promedio} kg` : ''} />
        <Kpi titulo="Nacimientos del mes" valor={resumen?.nacimientos_mes ?? '–'} />
        <Kpi titulo="Vacunaciones del mes" valor={resumen?.vacunaciones_mes ?? '–'} />
        <Kpi titulo="Ocupación de potreros" valor={resumen ? `${resumen.ocupacion_pct}%` : '–'} detalle={resumen ? `${resumen.total_potreros} potreros` : ''} />
        {/* Solo el administrador recibe estos datos (el backend también lo controla). */}
        {esAdmin && resumen?.usuarios !== undefined && (
          <>
            <Kpi titulo="Usuarios del sistema" valor={resumen.usuarios} />
            <Kpi titulo="Ventas y bajas del mes" valor={resumen.ventas_bajas_mes} />
          </>
        )}
      </div>

      {/* Gráficos */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <TarjetaGrafico titulo="Nacimientos por mes" subtitulo="Últimos 6 meses" cargando={cargando} error={errores.nacimientos} datos={nacimientos} etiquetaValor="Nacimientos">
            <GraficoArea datos={nacimientos} nombreValor="Nacimientos" />
          </TarjetaGrafico>
        </div>
        <div className="col-lg-6">
          <TarjetaGrafico titulo="Animales por potrero" subtitulo="Solo animales activos" cargando={cargando} error={errores.potrero} datos={porPotrero} etiquetaValor="Animales">
            <GraficoBarras datos={porPotrero} nombreValor="Animales" color={COLORES[1]} />
          </TarjetaGrafico>
        </div>
        <div className="col-lg-6">
          <TarjetaGrafico titulo="Rodeo por raza" subtitulo="Solo animales activos" cargando={cargando} error={errores.raza} datos={porRaza} etiquetaValor="Animales">
            <GraficoDonut datos={porRaza} nombreValor="Animales" />
          </TarjetaGrafico>
        </div>
        <div className="col-lg-6">
          <TarjetaGrafico titulo="Vacunaciones aplicadas" subtitulo="Por enfermedad" cargando={cargando} error={errores.vacunas} datos={vacunas} etiquetaValor="Aplicaciones">
            <GraficoBarras datos={vacunas} horizontal nombreValor="Aplicaciones" />
          </TarjetaGrafico>
        </div>
      </div>

      {/* Últimos animales registrados */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h6 fw-bold mb-0">Últimos animales registrados</h2>
            <Link to="/animales" className="small">Ver todos</Link>
          </div>
          {errores.ultimos && <div className="alert alert-danger">{errores.ultimos}</div>}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Caravana</th>
                  <th>Raza</th>
                  <th>Origen</th>
                  <th>Potrero</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {!cargando && ultimos.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">Todavía no hay animales registrados.</td>
                  </tr>
                )}
                {ultimos.map((a) => (
                  <tr key={a.id}>
                    <td className="fw-bold">{a.caravana}</td>
                    <td>{a.raza || '-'}</td>
                    <td><span className="badge bg-info text-dark">{a.origen}</span></td>
                    <td>{a.estado === 'Activo' ? a.potrero_nombre || '-' : '-'}</td>
                    <td>{a.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
