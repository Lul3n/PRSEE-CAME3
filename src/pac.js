// Pruebas PAC: niveles de logro y cálculos.
import { TESTS } from "./pacTests";

export { TESTS };

export const TEST_NAMES = Object.keys(TESTS);

// Niveles de logro de cada indicador.
export const LEVELS = [
  { value: 0, label: "Aún no lo logra", className: "lv0" },
  { value: 1, label: "En proceso", className: "lv1" },
  { value: 2, label: "Lo logra", className: "lv2" },
];

export const levelOf = (value) => LEVELS.find((l) => l.value === value);

// Clave de cada indicador dentro de una evaluación, por ejemplo "0-2" (área 0, tercer indicador del área).
export const itemKey = (areaIndex, itemIndex) => `${areaIndex}-${itemIndex}`;

// Porcentaje de logro de un área (0 a 100). Los indicadores sin calificar no cuentan.
export function areaPercent(evaluation, areaIndex) {
  const area = TESTS[evaluation.test][areaIndex];
  const values = area.items
    .map((_, i) => evaluation.levels[itemKey(areaIndex, i)])
    .filter((v) => v !== undefined && v !== null);
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / (values.length * 2)) * 100);
}

// Porcentaje general: promedio de las áreas.
export function overallPercent(evaluation) {
  const areas = TESTS[evaluation.test];
  const total = areas.reduce((sum, _, i) => sum + areaPercent(evaluation, i), 0);
  return Math.round(total / areas.length);
}

export function formatDate(iso) {
  if (!iso) return "Sin fecha";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}
