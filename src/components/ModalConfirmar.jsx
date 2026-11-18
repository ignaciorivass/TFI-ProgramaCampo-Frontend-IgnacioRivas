// Modal de confirmación reutilizable.
// Props:
//   visible   – boolean: si se muestra o no
//   titulo    – string: título del cuadro
//   mensaje   – string: pregunta al usuario
//   onConfirmar – función llamada al presionar "Sí"
//   onCancelar  – función llamada al presionar "Cancelar"
//   variante  – 'danger' | 'warning' (color del botón confirmar)
export default function ModalConfirmar({
  visible,
  titulo = '¿Confirmar acción?',
  mensaje = '¿Estás seguro?',
  onConfirmar,
  onCancelar,
  variante = 'danger',
}) {
  if (!visible) return null;

  return (
    <div className="modal-confirmacion-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
      <div className="modal-confirmacion">
        <h5 id="modal-titulo" className="fw-bold mb-2">{titulo}</h5>
        <p className="text-muted mb-4">{mensaje}</p>
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button className={`btn btn-${variante}`} onClick={onConfirmar} autoFocus>
            Sí, confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
