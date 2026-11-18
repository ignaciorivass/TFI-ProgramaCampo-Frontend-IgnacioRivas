import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_URL, authHeaders } from '../config';

const mensajesIniciales = [
  {
    desde: 'bot',
    texto: 'Hola, soy el asistente del Sistema Ganadero. ¿Qué querés consultar?',
  },
];

export default function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [enviando, setEnviando] = useState(false);
  const finalMensajes = useRef(null);

  useEffect(() => {
    finalMensajes.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, abierto]);

  const enviar = async (texto) => {
    const mensaje = texto.trim();
    if (!mensaje || enviando) return;

    setMensajes((actuales) => [...actuales, { desde: 'usuario', texto: mensaje }]);
    setEnviando(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/chatbot/consultar`,
        { mensaje },
        authHeaders()
      );
      setMensajes((actuales) => [...actuales, { desde: 'bot', texto: data.respuesta }]);
    } catch (error) {
      const detalle = error.response?.data?.message || 'No pude obtener una respuesta.';
      setMensajes((actuales) => [...actuales, { desde: 'bot', texto: detalle }]);
    } finally {
      setEnviando(false);
    }
  };

  const consultas = [
    { texto: 'Ver resumen', consulta: 'resumen' },
    { texto: 'Animales activos', consulta: 'animales activos' },
    { texto: 'Estado de potreros', consulta: 'potreros' },
    { texto: 'Movimientos recientes', consulta: 'movimientos recientes' },
    { texto: 'Vacunaciones recientes', consulta: 'vacunaciones recientes' },
    { texto: 'Pesajes recientes', consulta: 'pesajes recientes' },
  ];

  return (
    <div className="chatbot">
      {abierto && (
        <section className="chatbot-panel" aria-label="Asistente del sistema">
          <header className="chatbot-header">
            <div>
              <strong>Asistente Ganadero</strong>
              <small>Consulta gratuita · Datos del sistema</small>
            </div>
            <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">
              ×
            </button>
          </header>

          <div className="chatbot-mensajes" aria-live="polite">
            {mensajes.map((mensaje, indice) => (
              <div
                key={`${mensaje.desde}-${indice}`}
                className={`chatbot-mensaje ${mensaje.desde}`}
              >
                {mensaje.texto}
              </div>
            ))}
            {enviando && (
              <div className="chatbot-mensaje bot chatbot-escribiendo">Consultando...</div>
            )}
            <div ref={finalMensajes} />
          </div>

          <div className="chatbot-consultas" aria-label="Consultas disponibles">
            <small>Elegí una consulta</small>
            <div className="chatbot-sugerencias">
              {consultas.map((opcion) => (
                <button
                  key={opcion.consulta}
                  type="button"
                  onClick={() => enviar(opcion.consulta)}
                  disabled={enviando}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setAbierto((actual) => !actual)}
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente'}
        aria-expanded={abierto}
      >
        {abierto ? '×' : 'Asistente'}
      </button>
    </div>
  );
}
