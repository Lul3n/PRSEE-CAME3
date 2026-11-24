import { useState } from "react";
import StudentRow from "../components/StudentRow";
import StudentForm from "../components/StudentForm";
import { average, isEvaluated } from "../data";

function TeacherHome({ data, user, openStudent, saveStudent, showToast }) {
  const [adding, setAdding] = useState(false);

  const ids = Object.keys(data.students).filter((id) => data.students[id].group === user.group);
  const evaluated = ids.filter((id) => isEvaluated(data.students[id]));
  const progress = ids.length ? Math.round((evaluated.length / ids.length) * 100) : 0;
  const overall = evaluated.length
    ? Math.round(evaluated.reduce((sum, id) => sum + average(data.students[id]), 0) / evaluated.length)
    : 0;

  return (
    <>
      <h1>Mi grupo</h1>
      <div className="grid2">
        <section className="card">
          <h2>Alumnos · {user.group}</h2>
          {ids.map((id) => (
            <StudentRow key={id} student={data.students[id]} onOpen={() => openStudent(id)} />
          ))}
          {ids.length === 0 && <p className="mu">Todavía no hay alumnos en tu grupo.</p>}
          <button className="btn ghost sm" onClick={() => setAdding(true)}>+ Agregar alumno</button>
        </section>

        <section className="card">
          <h2>Avance de evaluaciones</h2>
          <div className="big">{progress}%</div>
          <div className="mu">{evaluated.length} de {ids.length} alumnos evaluados</div>
          <div className="bar"><i style={{ width: progress + "%" }} /></div>

          <h2 className="section">Promedio general</h2>
          <div className="big medium">{overall || "-"}</div>
          <div className="bar"><i style={{ width: overall + "%" }} /></div>
          <div className="mu">Promedio de los alumnos ya evaluados.</div>
        </section>
      </div>

      {adding && (
        <StudentForm data={data} defaultGroup={user.group} onSave={saveStudent}
          showToast={showToast} onClose={() => setAdding(false)} />
      )}
    </>
  );
}

export default TeacherHome;
