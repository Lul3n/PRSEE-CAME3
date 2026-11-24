import { useState } from "react";
import StudentRow from "../components/StudentRow";
import StudentForm from "../components/StudentForm";
import TeacherForm from "../components/TeacherForm";
import { initials } from "../data";

function AdminHome({ data, openStudent, saveStudent, saveTeacher, deleteTeacher, showToast }) {
  const [query, setQuery] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(undefined); // undefined = cerrado, null = nuevo

  const q = query.trim().toLowerCase();
  const ids = Object.keys(data.students)
    .filter((id) => data.students[id].name.toLowerCase().includes(q))
    .sort((a, b) => data.students[a].name.localeCompare(data.students[b].name));

  return (
    <>
      <h1>Panel del administrador</h1>
      <div className="grid2">
        <section className="card">
          <h2>Maestros</h2>
          {data.teachers.map((t) => (
            <div className="row" key={t.id}>
              <div className="av">{initials(t.name)}</div>
              <div className="grow">
                <b>{t.name}</b>
                <span className="mu">{t.group} · {t.email}</span>
              </div>
              <button className="btn ghost sm" onClick={() => setEditingTeacher(t)}>Editar</button>
            </div>
          ))}
          <button className="btn ghost sm" onClick={() => setEditingTeacher(null)}>+ Agregar maestro</button>
        </section>

        <section className="card">
          <h2>Alumnos</h2>
          <input placeholder="Buscar alumno" aria-label="Buscar alumno"
            value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="list">
            {ids.map((id) => {
              const s = data.students[id];
              return (
                <StudentRow key={id} student={s} extra={`${s.group} · ${s.age} años`}
                  onOpen={() => openStudent(id)} />
              );
            })}
            {ids.length === 0 && <p className="mu">Sin resultados.</p>}
          </div>
          <button className="btn ghost sm" onClick={() => setAddingStudent(true)}>+ Agregar alumno</button>
        </section>
      </div>

      {addingStudent && (
        <StudentForm data={data} onSave={saveStudent} showToast={showToast}
          onClose={() => setAddingStudent(false)} />
      )}
      {editingTeacher !== undefined && (
        <TeacherForm teacher={editingTeacher} onSave={saveTeacher} onDelete={deleteTeacher} showToast={showToast}
          onClose={() => setEditingTeacher(undefined)} />
      )}
    </>
  );
}

export default AdminHome;
