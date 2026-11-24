import { useState } from "react";
import Modal from "./Modal";

function TeacherForm({ teacher, onSave, onDelete, onClose, showToast }) {
  const [form, setForm] = useState(teacher ?? { name: "", group: "", email: "" });

  function setField(field, value) {
    setForm({ ...form, [field]: value });
  }

  function handleSave() {
    if (!form.name.trim()) return showToast("Escribe el nombre del maestro");
    if (!form.group.trim()) return showToast("Escribe el grupo");
    if (!form.email.includes("@")) return showToast("Escribe un correo válido");
    onSave({
      ...form,
      name: form.name.trim(),
      group: form.group.trim(),
      email: form.email.trim().toLowerCase(),
    });
    showToast(teacher ? "Cuenta actualizada" : "Maestro agregado");
    onClose();
  }

  function handleDelete() {
    const ok = window.confirm(
      `¿Eliminar a ${teacher.name}? Ya no podrá entrar a CAME. Sus alumnos no se borran.`
    );
    if (ok) {
      onDelete(teacher);
      showToast("Maestro eliminado");
      onClose();
    }
  }

  return (
    <Modal title={teacher ? "Editar cuenta" : "Agregar maestro"}
      subtitle="El maestro inicia sesión con este correo." onClose={onClose}>
      <label htmlFor="mn">Nombre completo</label>
      <input id="mn" value={form.name} onChange={(e) => setField("name", e.target.value)} />
      <label htmlFor="mg">Grupo</label>
      <input id="mg" value={form.group} placeholder="Grupo D" onChange={(e) => setField("group", e.target.value)} />
      <label htmlFor="me">Correo (acceso)</label>
      <input id="me" type="email" value={form.email} placeholder="correo@came.mx"
        onChange={(e) => setField("email", e.target.value)} />
      <div className="chips actions">
        <button className="btn" onClick={handleSave}>Guardar</button>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        {teacher && <button className="btn danger push-right" onClick={handleDelete}>Eliminar</button>}
      </div>
    </Modal>
  );
}

export default TeacherForm;
