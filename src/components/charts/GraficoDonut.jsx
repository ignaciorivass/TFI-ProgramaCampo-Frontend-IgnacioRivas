import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { COLORES, COLOR_OTROS, agruparEnOtros } from './colores';

// Reparto de un total entre pocas categorías. La leyenda es HTML propio e incluye
// el valor y el porcentaje, así la identidad no depende solo del color.
export default function GraficoDonut({ datos, nombreValor = 'Cantidad' }) {
  const items = agruparEnOtros(datos);
  const total = items.reduce((acc, d) => acc + d.cantidad, 0);
  const colorDe = (d, i) => (d.nombre === 'Otros' ? COLOR_OTROS : COLORES[i % COLORES.length]);

  return (
    <div className="row align-items-center g-2">
      <div className="col-sm-6">
        <div style={{ width: '100%', height: 220, position: 'relative' }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={items}
                dataKey="cantidad"
                nameKey="nombre"
                innerRadius="58%"
                outerRadius="90%"
                paddingAngle={2}
                stroke="#1a251d"
                strokeWidth={2}
              >
                {items.map((d, i) => (
                  <Cell key={d.nombre} fill={colorDe(d, i)} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n) => [v, n]}
                contentStyle={{ backgroundColor: '#1a251d', borderColor: '#405044', borderRadius: 8, color: '#e7eee7' }}
                labelStyle={{ color: '#e7eee7' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Total en el centro del anillo */}
          <div className="donut-centro">
            <strong>{total}</strong>
            <small>{nombreValor.toLowerCase()}</small>
          </div>
        </div>
      </div>
      <div className="col-sm-6">
        <ul className="list-unstyled mb-0 small">
          {items.map((d, i) => (
            <li key={d.nombre} className="d-flex align-items-center gap-2 mb-2">
              <span className="leyenda-color" style={{ background: colorDe(d, i) }} aria-hidden="true" />
              <span className="flex-grow-1">{d.nombre}</span>
              <span className="text-muted">
                {d.cantidad} ({total ? Math.round((d.cantidad / total) * 100) : 0}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
