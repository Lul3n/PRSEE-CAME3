import { useEffect, useState } from "react";
import PacChart, { PacLegend } from "../components/PacChart";
import EvaluationReport from "../components/EvaluationReport";
import { SERIES_COLORS } from "../components/Radar";
import StudentForm from "../components/StudentForm";
import EvaluationModal from "../components/EvaluationModal";
import { initials, isEvaluated, sortedEvaluations } from "../data";
import { TESTS, areaPercent, overallPercent, formatDate } from "../pac";

function StudentDetail({ data, user, id, onBack, saveStudent, deleteStudent, showToast }) {
  const s = data.students[id];
  const canEdit = user.role === "admin" || user.role === "teacher";
  const evaluations = sortedEvaluations(s);
  const sameTest = evaluations.filter((e) => e.test === s.test);

  const [editing, setEditing] = useState(false);
  const [openEval, setOpenEval] = useState(undefined); // undefined = cerrado, null = nueva
  // Por defecto se comparan las dos más recientes.
  const [printing, setPrinting] = useState(null);
  const [selected, setSelected] = useState(() => sameTest.slice(-2).map((e) => e.id));

  const chosen = sameTest.filter((e) => selected.includes(e.id));
  const areas = TESTS[s.test].map((a) => a.area);
  const series = chosen.map((e, k) => ({
    name: e.id,
    label: e.label,
    color: chosen.length === 1 ? SERIES_COLORS[1] : SERIES_COLORS[k % SERIES_COLORS.length],
    values: areas.map((_, i) => areaPercent(e, i)),
  }));

  function toggle(evId) {
    setSelected(selected.includes(evId) ? selected.filter((x) => x !== evId) : [...selected, evId]);
  }

  function saveEvaluation(evaluation) {
    const exists = s.evaluations.some((e) => e.id === evaluation.id);
    const list = exists
      ? s.evaluations.map((e) => (e.id === evaluation.id ? evaluation : e))
      : [...s.evaluations, evaluation];
    saveStudent(id, { evaluations: list });
    if (!exists && evaluation.test === s.test) setSelected([...selected, evaluation.id]);
  }

  function deleteEvaluation(evId) {
    saveStudent(id, { evaluations: s.evaluations.filter((e) => e.id !== evId) });
    setSelected(selected.filter((x) => x !== evId));
  }

  // Al elegir "Descargar" se arma el desglose y se abre la ventana de impresión (Guardar como PDF).
  useEffect(() => {
    if (!printing) return;
    document.body.classList.add("printing");
    const done = () => {
      document.body.classList.remove("printing");
      setPrinting(null);
    };
    window.addEventListener("afterprint", done, { once: true });
    const t = setTimeout(() => window.print(), 100);
    return () => clearTimeout(t);
  }, [printing]);

  const first = series[0];
  const last = series[series.length - 1];

  return (
    <>
      <button className="btn ghost sm back no-print" onClick={onBack}>‹ Volver</button>
      <div className="grid2">
        <section className="card">
          <div className="student-head">
            <div className="av lg">{initials(s.name)}</div>
            <div>
              <h2>{s.name}</h2>
              <span className={isEvaluated(s) ? "badge b-ok" : "badge b-wa"}>
                {isEvaluated(s) ? "Evaluado" : "Sin evaluar"}
              </span>{" "}
              <span className="badge b-test">{s.test}</span>
            </div>
          </div>
          <dl className="dl">
            <dt>Edad</dt><dd>{s.age} años</dd>
            <dt>Grupo</dt><dd>{s.group}</dd>
            <dt>Prueba que se aplica</dt><dd>{s.test}</dd>
            <dt>Discapacidad</dt><dd>{s.disability}</dd>
            <dt>Tutores</dt>
            {s.tutors.length ? s.tutors.map((t, i) => (
              <dd key={i} className="tutor">
                <b>{t.name}</b> ({t.relationship})<br />
                {t.phone || "Sin teléfono"}{t.email && " · " + t.email}
              </dd>
            )) : <dd>Sin tutores registrados.</dd>}
            <dt>Comentarios generales</dt><dd>{s.comments || "Sin comentarios."}</dd>
          </dl>
          {canEdit && (
            <div className="chips no-print">
              <button className="btn ghost" onClick={() => setEditing(true)}>Editar datos y tutores</button>
            </div>
          )}
        </section>

        <section className="card evals">
          <div className="thead">
            <h2>Evaluaciones</h2>
            {canEdit && <button className="btn sm" onClick={() => setOpenEval(null)}>+ Nueva evaluación</button>}
          </div>
          {evaluations.length === 0 && (
            <p className="mu">
              {canEdit ? "Todavía no hay evaluaciones." : "La maestra todavía no registra evaluaciones."}
            </p>
          )}
          {[...evaluations].reverse().map((e) => (
            <div className="row" key={e.id}>
              <div className="av">{overallPercent(e)}%</div>
              <div className="grow">
                <b>{e.label}</b>
                <span className="mu extra">{e.test} · {formatDate(e.date)}</span>
              </div>
              <div className="row-actions">
                <button className="btn ghost sm" onClick={() => setOpenEval(e)}>{canEdit ? "Editar" : "Ver detalle"}</button>
                <button className="btn ghost sm" onClick={() => setPrinting(e)}>Descargar</button>
              </div>
            </div>
          ))}
        </section>
      </div>

      {sameTest.length > 0 && (
        <section className="card chart-card">
          <h2>Diagrama {s.test}</h2>
          <p className="mu">Elige qué evaluaciones comparar:</p>
          <div className="chips">
            {sameTest.map((e) => {
              const k = chosen.findIndex((c) => c.id === e.id);
              return (
                <button key={e.id} className="chip compare" aria-pressed={k >= 0} onClick={() => toggle(e.id)}>
                  {k >= 0 && <i className="dot" style={{ background: series[k].color }} />}
                  {e.label} · {formatDate(e.date)}
                </button>
              );
            })}
          </div>
          <PacLegend />
          {chosen.length === 0 ? (
            <p className="mu center">Selecciona al menos una evaluación.</p>
          ) : (
            <>
              <div className={chosen.length > 1 ? "charts two" : "charts"}>
                {chosen.map((e, k) => (
                  <PacChart key={e.id} test={e.test} levels={e.levels}
                    title={<><i className="dot" style={{ background: series[k].color }} />{e.label} · {formatDate(e.date)} · {overallPercent(e)}%</>} />
                ))}
              </div>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Área</th>
                    {series.map((x) => <th key={x.name}><i className="dot" style={{ background: x.color }} />{x.label}</th>)}
                    {series.length > 1 && <th>Cambio</th>}
                  </tr>
                </thead>
                <tbody>
                  {areas.map((area, i) => {
                    const diff = last.values[i] - first.values[i];
                    return (
                      <tr key={area}>
                        <td>{area}</td>
                        {series.map((x) => <td key={x.name}>{x.values[i]}%</td>)}
                        {series.length > 1 && (
                          <td className={diff > 0 ? "up" : diff < 0 ? "down" : ""}>
                            {diff > 0 ? "▲ +" + diff : diff < 0 ? "▼ " + diff : "="}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </section>
      )}

      {printing && <EvaluationReport student={s} evaluation={printing} />}

      {editing && (
        <StudentForm data={data} id={id} defaultGroup={user.role === "teacher" ? s.group : undefined}
          onSave={saveStudent} onDelete={user.role === "admin" ? deleteStudent : undefined}
          showToast={showToast} onClose={() => setEditing(false)} />
      )}
      {openEval !== undefined && (
        <EvaluationModal student={s} evaluation={openEval} readOnly={!canEdit} showToast={showToast}
          onSave={saveEvaluation} onDelete={deleteEvaluation} onClose={() => setOpenEval(undefined)} />
      )}
    </>
  );
}

export default StudentDetail;
