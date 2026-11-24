import { useState } from "react";
import Modal from "./Modal";
import { TESTS, LEVELS, levelOf, itemKey, areaPercent, formatDate } from "../pac";

const today = () => new Date().toISOString().slice(0, 10);

// Checklist de una evaluación PAC.
// Maestra y admin la editan; madres y padres solo la consultan.
function EvaluationModal({ student, evaluation, readOnly, onSave, onDelete, onClose, showToast }) {
  const isNew = !evaluation;
  const [form, setForm] = useState(
    evaluation
      ? { ...evaluation, levels: { ...evaluation.levels }, notes: { ...evaluation.notes } }
      : {
          id: "ev" + Date.now(),
          label: "Evaluación " + (student.evaluations.length + 1),
          date: today(),
          test: student.test,
          levels: {},
          notes: {},
        }
  );
  const areas = TESTS[form.test];
  const [tab, setTab] = useState(0);

  function setLevel(key, value) {
    setForm({ ...form, levels: { ...form.levels, [key]: value } });
  }

  function setNote(key, value) {
    setForm({ ...form, notes: { ...form.notes, [key]: value } });
  }

  function handleSave() {
    if (!form.label.trim()) return showToast("Escribe un nombre para la evaluación");
    const total = areas.reduce((sum, a) => sum + a.items.length, 0);
    const answered = Object.keys(form.levels).length;
    const notes = {};
    for (const [k, v] of Object.entries(form.notes)) if (v.trim()) notes[k] = v.trim();
    onSave({ ...form, label: form.label.trim(), notes });
    showToast(answered < total ? `Guardada (${answered} de ${total} indicadores calificados)` : "Evaluación guardada");
    onClose();
  }

  function handleDelete() {
    if (window.confirm(`¿Eliminar "${form.label}"? No se puede deshacer.`)) {
      onDelete(form.id);
      showToast("Evaluación eliminada");
      onClose();
    }
  }

  const title = readOnly ? form.label : isNew ? "Nueva evaluación " + form.test : "Editar " + form.label;

  return (
    <Modal wide title={title}
      subtitle={`${student.name} · ${form.test} · ${formatDate(form.date)}`}
      onClose={onClose}>
      {!readOnly && (
        <div className="f2">
          <div>
            <label htmlFor="evl">Nombre de la evaluación</label>
            <input id="evl" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div>
            <label htmlFor="evd">Fecha</label>
            <input id="evd" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
      )}

      <div className="legend">
        {LEVELS.map((l) => <span key={l.value} className={"badge " + l.className}>{l.label}</span>)}
      </div>

      <div className="tabs" role="tablist">
        {areas.map((area, a) => {
          const answered = area.items.filter((_, i) => form.levels[itemKey(a, i)] !== undefined).length;
          return (
            <button key={area.area} role="tab" aria-selected={tab === a} className="tab" onClick={() => setTab(a)}>
              {area.area}
              <small>{answered}/{area.items.length}</small>
            </button>
          );
        })}
      </div>

      {areas.map((area, a) => a === tab && (
        <section className="area-block" key={area.area}>
          <div className="thead">
            <h3>{area.area}</h3>
            <span className="badge b-test">{areaPercent(form, a)}% logrado</span>
          </div>
          {area.items.map((item, i) => {
            const key = itemKey(a, i);
            const level = form.levels[key];
            const newSection = i === 0 || area.items[i - 1].section !== item.section;
            return (
              <div key={key}>
                {newSection && <h4 className="subarea">{item.section}</h4>}
                <div className="item">
                  <div className="item-top">
                    <span className="item-text">
                      <span className="item-n">{item.n}.</span> {item.text}
                      <span className="stage" title="Etapa de desarrollo">Etapa {item.stage}</span>
                      {item.q && <span className="stage" title="Se puede evaluar preguntando al alumno">Q</span>}
                    </span>
                    {readOnly ? (
                      <span className={"badge " + (level !== undefined ? levelOf(level).className : "lvn")}>
                        {level !== undefined ? levelOf(level).label : "Sin calificar"}
                      </span>
                    ) : (
                      <div className="levels" role="radiogroup" aria-label={item.text}>
                        {LEVELS.map((l) => (
                          <button key={l.value} type="button" role="radio" aria-checked={level === l.value}
                            className={"level " + l.className} onClick={() => setLevel(key, l.value)}>
                            {l.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {readOnly ? (
                    form.notes[key] && <p className="mu item-note">{form.notes[key]}</p>
                  ) : (
                    <input className="item-note-input" placeholder="Comentario (opcional)" aria-label={"Comentario: " + item.text}
                      value={form.notes[key] ?? ""} onChange={(e) => setNote(key, e.target.value)} />
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <div className="chips actions">
        {tab < areas.length - 1 && (
          <button className="btn ghost" onClick={() => { setTab(tab + 1); document.querySelector(".modal").scrollTop = 0; }}>
            Siguiente área ›
          </button>
        )}
        {!readOnly && <button className="btn" onClick={handleSave}>Guardar evaluación</button>}
        <button className="btn ghost" onClick={onClose}>{readOnly ? "Cerrar" : "Cancelar"}</button>
        {!readOnly && !isNew && <button className="btn danger push-right" onClick={handleDelete}>Eliminar</button>}
      </div>
    </Modal>
  );
}

export default EvaluationModal;
