import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { COLORES, COLOR_EJES, COLOR_GRILLA } from './colores';

// Evolución en el tiempo de una sola serie (línea de 2px con relleno suave debajo).
export default function GraficoArea({ datos, nombreValor = 'Cantidad', color = COLORES[0] }) {
  const tick = { fontSize: 12, fill: COLOR_EJES };
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <AreaChart data={datos} margin={{ top: 8, right: 16, bottom: 4, left: -12 }}>
          <defs>
            <linearGradient id="relleno-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity={0.28} />
              <stop offset="1" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={COLOR_GRILLA} vertical={false} />
          <XAxis dataKey="mes" tick={tick} axisLine={{ stroke: COLOR_GRILLA }} tickLine={false} />
          <YAxis allowDecimals={false} tick={tick} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v) => [v, nombreValor]}
            contentStyle={{ backgroundColor: '#1a251d', borderColor: '#405044', borderRadius: 8, color: '#e7eee7' }}
            labelStyle={{ color: '#e7eee7' }}
          />
          <Area
            type="monotone"
            dataKey="cantidad"
            name={nombreValor}
            stroke={color}
            strokeWidth={2}
            fill="url(#relleno-area)"
            dot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
