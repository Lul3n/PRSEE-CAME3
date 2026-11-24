import PacChart, { PacLegend } from "./PacChart";
import { TESTS, levelOf, itemKey, areaPercent, overallPercent, formatDate } from "../pac";

// Desglose de una evaluación para imprimir o guardar como PDF.
function EvaluationReport({ student, evaluation }) {
  const areas = TESTS[evaluation.test];

  return (
    <div className="report">
      <header className="report-head">
        <div>
          <div className="report-brand">CAME · Plataforma de Registro y Seguimiento para Educación Especial</div>
          <h1>{evaluation.label}</h1>
        </div>
        <div className="report-total">{overallPercent(evaluation)}%<small>logro general</small></div>
      </header>

      <table className="report-info">
        <tbody>
          <tr><th>Alumno</th><td>{student.name}</td><th>Prueba</th><td>{evaluation.test}</td></tr>
          <tr><th>Edad</th><td>{student.age} años</td><th>Fecha</th><td>{formatDate(evaluation.date)}</td></tr>
          <tr><th>Grupo</th><td>{student.group}</td><th>Discapacidad</th><td>{student.disability}</td></tr>
        </tbody>
      </table>

      <div className="report-summary">
        <PacChart test={evaluation.test} levels={evaluation.levels} />
        <div>
          <PacLegend />
          <table className="compare-table">
            <thead><tr><th>Área</th><th>Lo logra</th><th>En proceso</th><th>Aún no</th><th>%</th></tr></thead>
            <tbody>
              {areas.map((area, a) => {
                const count = [0, 0, 0];
                area.items.forEach((_, i) => {
                  const v = evaluation.levels[itemKey(a, i)];
                  if (v !== undefined) count[v]++;
                });
                return (
                  <tr key={area.area}>
                    <td>{area.area}</td><td>{count[2]}</td><td>{count[1]}</td><td>{count[0]}</td>
                    <td><b>{areaPercent(evaluation, a)}%</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {areas.map((area, a) => (
        <section key={area.area} className="report-area">
          <h2>{area.area} · {areaPercent(evaluation, a)}%</h2>
          <table className="report-items">
            <tbody>
              {area.items.map((item, i) => {
                const key = itemKey(a, i);
                const level = evaluation.levels[key];
                const newSection = i === 0 || area.items[i - 1].section !== item.section;
                return [
                  newSection && <tr key={key + "s"} className="report-section"><td colSpan="3">{item.section}</td></tr>,
                  <tr key={key}>
                    <td className="report-n">{item.n}</td>
                    <td>
                      {item.text} <span className="stage">Etapa {item.stage}</span>
                      {evaluation.notes[key] && <div className="report-note">{evaluation.notes[key]}</div>}
                    </td>
                    <td className="report-level">
                      <span className={"badge " + (level !== undefined ? levelOf(level).className : "lvn")}>
                        {level !== undefined ? levelOf(level).label : "Sin calificar"}
                      </span>
                    </td>
                  </tr>,
                ];
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

export default EvaluationReport;
