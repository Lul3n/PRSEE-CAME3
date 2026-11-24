// Gráfica de araña: compara varias evaluaciones (0 a 100 por área).
// series = [{ name, color, values: [..por área..] }]
export const SERIES_COLORS = ["#c4c4c4", "#8042d0", "#60b349", "#deb237", "#db4f5d", "#3b82c4"];

function Radar({ areas, series }) {
  const cx = 200, cy = 160, R = 100;
  const n = areas.length;

  function point(i, value, radius = R) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + (radius * value / 100) * Math.cos(angle), cy + (radius * value / 100) * Math.sin(angle)];
  }

  const ring = (v) => areas.map((_, i) => point(i, v).join(",")).join(" ");
  const single = series.length === 1;

  return (
    <svg viewBox="-40 0 480 320" width="100%" role="img" aria-label="Gráfica de logro por área">
      {[25, 50, 75, 100].map((v) => (
        <polygon key={v} points={ring(v)} fill="none" stroke="#e3e3e3" />
      ))}
      {areas.map((_, i) => {
        const [x, y] = point(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e3e3e3" />;
      })}
      {series.map((s) => (
        <g key={s.name}>
          <polygon points={s.values.map((v, i) => point(i, v).join(",")).join(" ")}
            fill={s.color} fillOpacity=".15" stroke={s.color} strokeWidth="2.5" />
          {s.values.map((v, i) => {
            const [x, y] = point(i, v);
            return <circle key={i} cx={x} cy={y} r="5" fill={s.color} stroke="#fff" strokeWidth="2" />;
          })}
        </g>
      ))}
      {areas.map((area, i) => {
        const [x, y] = point(i, 100, 114);
        const anchor = x > cx + 5 ? "start" : x < cx - 5 ? "end" : "middle";
        return (
          <text key={i} x={x} y={y} textAnchor={anchor} dominantBaseline="central"
            fontSize="12" fontWeight="500" fontFamily="Poppins,sans-serif" fill="#141414">
            {single ? `${area} · ${series[0].values[i]}%` : area}
          </text>
        );
      })}
    </svg>
  );
}

export default Radar;
