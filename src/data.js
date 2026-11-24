// Listas fijas y funciones de apoyo. Los datos viven en Firestore (ver db.js).

import { overallPercent } from "./pac";

export const RELATIONSHIPS = ["Madre", "Padre", "Tutor/a legal", "Abuelo/a", "Otro"];

export const DISABILITIES = [
  "Discapacidad intelectual leve",
  "Discapacidad intelectual moderada",
  "Síndrome de Down",
  "Trastorno del espectro autista",
  "Discapacidad motriz",
  "Discapacidad auditiva",
  "Discapacidad visual",
  "Otra",
];

export function roleLabel(user) {
  if (!user) return "Plataforma de Registro y Seguimiento para Educación Especial";
  if (user.role === "admin") return "Administrador principal";
  if (user.role === "teacher") return `Maestra · ${user.group}`;
  return "Madre/padre de familia";
}

// Evaluaciones ordenadas de la más antigua a la más reciente.
export const sortedEvaluations = (s) =>
  [...s.evaluations].sort((a, b) => (a.date || "").localeCompare(b.date || ""));

export const latestEvaluation = (s) => sortedEvaluations(s).at(-1) ?? null;

export const isEvaluated = (s) => s.evaluations.length > 0;

// Porcentaje de logro de la evaluación más reciente.
export function average(s) {
  const last = latestEvaluation(s);
  return last ? overallPercent(last) : 0;
}

export const initials = (name) =>
  name.split(" ").filter(Boolean).map((x) => x[0]).join("").slice(0, 2).toUpperCase();

export const groupsOf = (data) => data.teachers.map((t) => t.group);
