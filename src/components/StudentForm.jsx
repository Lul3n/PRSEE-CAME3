import { useState } from "react";
import Modal from "./Modal";
import { DISABILITIES, RELATIONSHIPS, groupsOf } from "../data";
import { TEST_NAMES } from "../pac";

const blankTutor = () => ({ name: "", relationship: "Madre", phone: "", email: "" });
const tutorKey = (t) => (t.name + "|" + t.phone).toLowerCase();

// Separa la discapacidad guardada en: opción de la lista + texto de "Otra".
function splitDisability(d) {
  if (!d || d === "Por registrar") return { disability: "", other: "" };
  if (DISABILITIES.includes(d)) return { disability: d, other: "" };
  return { disability: "Otra", other: d };
}

// Alta y edición de datos básicos del alumno y sus tutores.
function StudentForm({ data, id, defaultGroup, onSave, onDelete, onClose, showToast }) {
  const original = id ? data.students[id] : null;
  const savedDisability = splitDisability(original?.disability);
  const [form, setForm] = useState({
    name: original?.name ?? "",
    age: original?.age ?? "",
    disability: savedDisability.disability,
    otherDisability: savedDisability.other,
    group: original?.group ?? defaultGroup ?? groupsOf(data)[0] ?? "",
    test: original?.test ?? TEST_NAMES[0],
    comments: original?.comments ?? "",
  });
  const [tutors, setTutors] = useState(
    original?.tutors.length ? original.tutors.map((t) => ({ ...t })) : [blankTutor()]
  );
  const [linkIndex, setLinkIndex] = useState(0);

  // Tutores ya registrados en otros alumnos (para hermanos).
  const inForm = new Set(tutors.map(tutorKey));
  const seen = new Set();
  const existing = [];
  for (const s of Object.values(data.students)) {
    for (const t of s.tutors) {
      const k = tutorKey(t);
      if (t.name.trim() && !seen.has(k) && !inForm.has(k)) {
        seen.add(k);
        existing.push(t);
      }
    }
  }

  function setField(field, value) {
    setForm({ ...form, [field]: value });
  }

  function setTutor(index, field, value) {
    setTutors(tutors.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function linkTutor() {
    const t = existing[linkIndex];
    if (t) {
      setTutors([...tutors, { ...t }]);
      setLinkIndex(0);
    }
  }

  function handleSave() {
    const name = form.name.trim();
    if (!name) return showToast("Escribe el nombre del alumno");
    const age = parseInt(form.age, 10);
    if (!age || age < 1 || age > 99) return showToast("Escribe una edad válida");

    const filled = tutors.filter((t) => t.name.trim() || t.phone.trim() || t.email.trim());
    if (!filled.length) return showToast("Agrega al menos un tutor");
    const missing = filled.findIndex((t) => !t.name.trim());
    if (missing >= 0) return showToast("Falta el nombre del tutor " + (missing + 1));

    const student = {
      name,
      age,
      disability: form.disability === "Otra"
        ? form.otherDisability.trim() || "Otra"
        : form.disability || "Por registrar",
      group: form.group,
      test: form.test,
      comments: form.comments.trim(),
      tutors: filled.map((t) => ({
        name: t.name.trim(),
        relationship: t.relationship,
        phone: t.phone.trim(),
        email: t.email.trim().toLowerCase(),
      })),
    };
    if (!id) student.evaluations = [];
    onSave(id, student);
    showToast(id ? "Datos guardados" : "Alumno agregado");
    onClose();
  }

  function handleDelete() {
    const ok = window.confirm(
      `¿Eliminar a ${original.name}? Se borran también sus evaluaciones y no se puede deshacer.`
    );
    if (ok) {
      onDelete(id);
      showToast("Alumno eliminado");
      onClose();
    }
  }

  return (
    <Modal
      title={id ? "Editar datos de " + original.name : "Agregar alumno"}
      subtitle="Datos básicos del alumno y sus tutores. Cada tutor puede iniciar sesión con su correo para ver el avance."
      onClose={onClose}
    >
      <div className="f2">
        <div className="full">
          <label htmlFor="sn">Nombre completo</label>
          <input id="sn" value={form.name} placeholder="Nombre y apellidos"
            onChange={(e) => setField("name", e.target.value)} />
        </div>
        <div>
          <label htmlFor="sa">Edad</label>
          <input id="sa" type="number" min="1" max="99" value={form.age} placeholder="Años"
            onChange={(e) => setField("age", e.target.value)} />
        </div>
        <div>
          <label htmlFor="sd">Discapacidad</label>
          <select id="sd" value={form.disability} onChange={(e) => setField("disability", e.target.value)}>
            <option value="">Por registrar</option>
            {DISABILITIES.map((d) => <option key={d}>{d}</option>)}
          </select>
          {form.disability === "Otra" && (
            <input className="other-input" aria-label="Especifica la discapacidad" placeholder="Especifica cuál"
              value={form.otherDisability} onChange={(e) => setField("otherDisability", e.target.value)} />
          )}
        </div>
        <div className={defaultGroup ? "full" : ""}>
          <label htmlFor="st">Prueba que se aplica</label>
          <select id="st" value={form.test} onChange={(e) => setField("test", e.target.value)}>
            {TEST_NAMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        {!defaultGroup && (
          <div>
            <label htmlFor="sgp">Grupo</label>
            <select id="sgp" value={form.group} onChange={(e) => setField("group", e.target.value)}>
              {groupsOf(data).map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
        )}
        <div className="full">
          <label htmlFor="sg">Comentarios generales</label>
          <textarea id="sg" rows="3" value={form.comments}
            onChange={(e) => setField("comments", e.target.value)} />
        </div>
      </div>

      <h2 className="section">Tutores</h2>
      {tutors.map((t, i) => (
        <div className="tcard" key={i}>
          <div className="thead">
            <h3>Tutor {i + 1}</h3>
            <button className="btn danger sm" onClick={() => setTutors(tutors.filter((_, k) => k !== i))}>
              Quitar
            </button>
          </div>
          <div className="f2">
            <div>
              <label htmlFor={"tn" + i}>Nombre</label>
              <input id={"tn" + i} value={t.name} placeholder="Nombre completo"
                onChange={(e) => setTutor(i, "name", e.target.value)} />
            </div>
            <div>
              <label htmlFor={"tr" + i}>Parentesco</label>
              <select id={"tr" + i} value={t.relationship}
                onChange={(e) => setTutor(i, "relationship", e.target.value)}>
                {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={"tt" + i}>Teléfono</label>
              <input id={"tt" + i} type="tel" value={t.phone} placeholder="662 000 0000"
                onChange={(e) => setTutor(i, "phone", e.target.value)} />
            </div>
            <div>
              <label htmlFor={"tm" + i}>Correo (acceso)</label>
              <input id={"tm" + i} type="email" value={t.email} placeholder="correo@ejemplo.com"
                onChange={(e) => setTutor(i, "email", e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      <div className="chips">
        <button className="btn ghost" onClick={() => setTutors([...tutors, blankTutor()])}>
          + Dar de alta nuevo tutor
        </button>
      </div>

      {existing.length > 0 && (
        <>
          <label htmlFor="ex" className="link-label">O vincular un tutor ya registrado (por ejemplo, hermanos)</label>
          <div className="exrow">
            <select id="ex" value={linkIndex} onChange={(e) => setLinkIndex(+e.target.value)}>
              {existing.map((t, i) => (
                <option key={i} value={i}>{t.name} ({t.relationship})</option>
              ))}
            </select>
            <button className="btn ghost sm" onClick={linkTutor}>Vincular</button>
          </div>
        </>
      )}

      <div className="chips actions">
        <button className="btn" onClick={handleSave}>Guardar</button>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        {id && onDelete && (
          <button className="btn danger push-right" onClick={handleDelete}>Eliminar alumno</button>
        )}
      </div>
    </Modal>
  );
}

export default StudentForm;
