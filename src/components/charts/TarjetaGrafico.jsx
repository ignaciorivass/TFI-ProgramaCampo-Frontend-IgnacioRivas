// Marco común de cada gráfico: título, estados de carga/error/vacío y una tabla con los datos
// (alternativa accesible al gráfico, para quien no puede distinguir los colores).
export default function TarjetaGrafico({ titulo, subtitulo, cargando, error, datos, etiquetaValor = 'Cantidad', children }) {
  const vacio = !cargando && !error && (!datos || datos.every((d) => !d.cantidad));

  return (
    <div className="card h-100 chart-card">
      <div className="card-body d-flex flex-column">
        <h3 className="h6 mb-0 fw-bold">{titulo}</h3>
        {subtitulo && <small className="text-muted">{subtitulo}</small>}

        <div className="chart-area mt-3 flex-grow-1">
          {cargando && (
            <div className="d-flex h-100 align-items-center justify-content-center text-muted">
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Cargando...
            </div>
          )}
          {error && <div className="alert alert-danger py-2 mb-0">{error}</div>}
          {vacio && (
            <div className="d-flex h-100 align-items-center justify-content-center text-muted text-center">
              Todavía no hay datos para mostrar.
            </div>
          )}
          {!cargando && !error && !vacio && children}
        </div>

        {!cargando && !error && !vacio && (
          <details className="mt-2 small d-print-none">
            <summary className="text-muted">Ver datos en tabla</summary>
            <table className="table table-sm mb-0 mt-2">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th className="text-end">{etiquetaValor}</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((d) => (
                  <tr key={d.nombre || d.mes}>
                    <td>{d.nombre || d.mes}</td>
                    <td className="text-end">{d.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>
    </div>
  );
}
