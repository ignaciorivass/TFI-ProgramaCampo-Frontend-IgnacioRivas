import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { COLORES, COLOR_EJES, COLOR_GRILLA } from './colores';

// Barras de una sola serie. Con horizontal=true las categorías van en el eje vertical
// (útil cuando los nombres son largos, como las enfermedades).
export default function GraficoBarras({ datos, horizontal = false, nombreValor = 'Cantidad', color = COLORES[0] }) {
  const alto = horizontal ? Math.max(220, datos.length * 44) : 260;
  const tick = { fontSize: 12, fill: COLOR_EJES };

  return (
    <div style={{ width: '100%', height: alto }}>
      <ResponsiveContainer>
        <BarChart
          data={datos}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 8, right: 16, bottom: 4, left: horizontal ? 8 : -12 }}
        >
          <CartesianGrid stroke={COLOR_GRILLA} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nombre" width={130} tick={tick} axisLine={false} tickLine={false} />
            </>
          ) : (
            <>
              <XAxis dataKey="nombre" tick={tick} axisLine={{ stroke: COLOR_GRILLA }} tickLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
            </>
          )}
          <Tooltip
            cursor={{ fill: 'rgba(120,183,125,0.08)' }}
            formatter={(v) => [v, nombreValor]}
            contentStyle={{ backgroundColor: '#1a251d', borderColor: '#405044', borderRadius: 8, color: '#e7eee7' }}
            labelStyle={{ color: '#e7eee7' }}
          />
          <Bar
            dataKey="cantidad"
            name={nombreValor}
            fill={color}
            maxBarSize={36}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
