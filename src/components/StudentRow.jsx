import { initials, isEvaluated } from "../data";

function StudentRow({ student, extra, onOpen }) {
  const done = isEvaluated(student);
  return (
    <div className="row">
      <div className="av">{initials(student.name)}</div>
      <div className="grow">
        <b>{student.name}</b>
        <span className={done ? "badge b-ok" : "badge b-wa"}>
          {done ? "Evaluado" : "Sin evaluar"}
        </span>{" "}
        <span className="badge b-test">{student.test}</span>
        {extra && <span className="mu extra">{extra}</span>}
      </div>
      <button className="btn ghost sm" onClick={onOpen}>Abrir</button>
    </div>
  );
}

export default StudentRow;
