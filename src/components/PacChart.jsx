import { TESTS, itemKey } from "../pac";

// Diagrama circular como el del cuadro PAC original:
// 4 cuadrantes (áreas), cada uno dividido en subáreas; los anillos del centro hacia
// afuera son las etapas (A-G en PAC1, X-Z en PAC2) y cada casilla es un indicador.
// Blanco = aún no lo logra, azul claro = en proceso, azul fuerte = lo logra.

const STAGES = { PAC1: ["A", "B", "C", "D", "E", "F", "G"], PAC2: ["X", "Y", "Z"] };
const FILL = { 0: "#ffffff", 1: "#a9c8f0", 2: "#1f4e9c" };
const QUADRANT_START = [270, 0, 90, 180]; // arriba-izq, arriba-der, abajo-der, abajo-izq
const QUADRANT_SHIFT = [[-7, -7], [7, -7], [7, 7], [-7, 7]];

const cx = 0, cy = 0, R0 = 46, R = 215;

// Ángulo en grados, en sentido del reloj desde las 12.
function pt(r, deg) {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

function cell(r1, r2, a1, a2) {
  const [x1, y1] = pt(r2, a1), [x2, y2] = pt(r2, a2);
  const [x3, y3] = pt(r1, a2), [x4, y4] = pt(r1, a1);
  const large = a2 - a1 > 180 ? 1 : 0;
  return `M${x1},${y1} A${r2},${r2} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 ${large} 0 ${x4},${y4} Z`;
}

const SHORT = {
  "Ocupaciones durante el tiempo libre": "Tiempo libre",
  "Cuidado de herramientas y materiales": "Herramientas",
  "Calidad y Exactitud": "Calidad",
  "Rapidez e Iniciativa": "Rapidez",
  "Actividades manuales": "Act. manuales",
};
const shortName = (s) => (SHORT[s] ?? s.replace(/\s*\(.*\)/, "")).toUpperCase();

// Parte los nombres largos en dos renglones.
function splitLabel(text) {
  if (text.length <= 14) return [text];
  const words = text.split(" ");
  let best = 1, diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(" ").length - words.slice(i).join(" ").length);
    if (d < diff) { diff = d; best = i; }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

function PacChart({ test, levels, title }) {
  const stages = STAGES[test];
  const ring = (R - R0) / stages.length;
  const areas = TESTS[test];

  return (
    <figure className="pac-chart">
      {title && <figcaption>{title}</figcaption>}
      <svg viewBox="-300 -300 600 600" width="100%" role="img" aria-label={`Diagrama ${test}`}>
        {areas.map((area, a) => {
          const sections = [...new Set(area.items.map((it) => it.section))];
          const span = 90 / sections.length;
          const [dx, dy] = QUADRANT_SHIFT[a];
          const start = QUADRANT_START[a];
          const mid = start + 45;
          const radial = span < 15; // muchas subáreas: los nombres van hacia afuera
          const [lx, ly] = pt(radial ? R + 84 : R + 52, mid);
          return (
            <g key={area.area} transform={`translate(${dx},${dy})`}>
              {sections.map((section, s) => {
                const a1 = start + s * span, a2 = a1 + span;
                const tm = (a1 + a2) / 2;
                const flip = tm > 90 && tm < 270;
                return (
                  <g key={section}>
                    {stages.map((stage, k) => {
                      const items = area.items
                        .map((it, i) => ({ ...it, i }))
                        .filter((it) => it.section === section && it.stage === stage);
                      const r1 = R0 + k * ring, r2 = r1 + ring;
                      if (!items.length) {
                        return <path key={stage} d={cell(r1, r2, a1, a2)} fill="#f3f3f3" stroke="#141414" strokeWidth=".6" />;
                      }
                      const w = span / items.length;
                      return items.map((it, j) => {
                        const b1 = a1 + j * w, b2 = b1 + w;
                        const level = levels[itemKey(a, it.i)];
                        const [nx, ny] = pt((r1 + r2) / 2, (b1 + b2) / 2);
                        const arc = ((r1 + r2) / 2) * (w * Math.PI / 180);
                        const size = Math.min(10, arc / 2.4, ring * 0.42);
                        return (
                          <g key={it.n}>
                            <path d={cell(r1, r2, b1, b2)} fill={FILL[level] ?? "#ffffff"} stroke="#141414" strokeWidth=".6">
                              <title>{`${it.n}. ${it.text}`}</title>
                            </path>
                            {size >= 5 && (
                              <text x={nx} y={ny} fontSize={size} textAnchor="middle" dominantBaseline="central"
                                fill={level === 2 ? "#fff" : "#141414"} fontFamily="Poppins,sans-serif" fontWeight="600"
                                pointerEvents="none">{it.n}</text>
                            )}
                          </g>
                        );
                      });
                    })}
                    <path d={cell(R0, R, a1, a2)} fill="none" stroke="#141414" strokeWidth="1.4" />
                    {radial ? (() => {
                      const [tx, ty] = pt(R + 6, tm);
                      const right = tm < 180;
                      return (
                        <text x={tx} y={ty} fontSize="7.5" fontWeight="600" fontFamily="Poppins,sans-serif"
                          textAnchor={right ? "start" : "end"} dominantBaseline="central" fill="#141414"
                          transform={`rotate(${right ? tm - 90 : tm + 90} ${tx} ${ty})`}>
                          {shortName(section)}
                        </text>
                      );
                    })() : splitLabel(shortName(section)).map((line, li, lines) => {
                      const r = R + 11 + (flip ? li : lines.length - 1 - li) * 10;
                      const [tx, ty] = pt(r, tm);
                      return (
                        <text key={li} x={tx} y={ty} fontSize="8" fontWeight="600" fontFamily="Poppins,sans-serif"
                          textAnchor="middle" dominantBaseline="central" fill="#141414"
                          transform={`rotate(${flip ? tm + 180 : tm} ${tx} ${ty})`}>
                          {line}
                        </text>
                      );
                    })}
                  </g>
                );
              })}
              <text x={lx} y={ly} fontSize="15" fontWeight="700" fontFamily="Poppins,sans-serif"
                textAnchor="middle" dominantBaseline="central" fill="#8042d0"
                transform={`rotate(${mid > 90 && mid < 270 ? mid + 180 : mid} ${lx} ${ly})`}>
                {area.area.toUpperCase()}
              </text>
            </g>
          );
        })}
        {/* Letras de las etapas en las franjas */}
        {stages.map((stage, k) => {
          const r = R0 + (k + 0.5) * ring;
          return (
            <g key={stage} fontSize="11" fontWeight="700" fontFamily="Poppins,sans-serif" textAnchor="middle" dominantBaseline="central">
              <text x={-r} y={0}>{stage}</text>
              <text x={r} y={0}>{stage}</text>
              <text x={0} y={-r}>{stage}</text>
              <text x={0} y={r}>{stage}</text>
            </g>
          );
        })}
        <circle cx={0} cy={0} r={R0 - 6} fill="#fff" stroke="#141414" strokeWidth="1.4" />
        <text x={0} y={0} fontSize="14" fontWeight="700" fontFamily="Poppins,sans-serif" textAnchor="middle" dominantBaseline="central">{test}</text>
      </svg>
    </figure>
  );
}

export function PacLegend() {
  return (
    <div className="pac-legend">
      <span><i style={{ background: FILL[0] }} /> Aún no lo logra</span>
      <span><i style={{ background: FILL[1] }} /> En proceso</span>
      <span><i style={{ background: FILL[2] }} /> Lo logra</span>
    </div>
  );
}

export default PacChart;
