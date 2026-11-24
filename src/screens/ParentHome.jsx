import { initials } from "../data";

function ParentHome({ data, user, openStudent }) {
  const ids = Object.keys(data.students).filter((id) =>
    data.students[id].tutors.some((t) => t.email.toLowerCase() === user.email)
  );
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <h1>¡Hola, {firstName}! Elige a tu hijo o hija</h1>
      {ids.length === 0 && <p className="mu">No hay alumnos vinculados a tu correo.</p>}
      <div className="kids">
        {ids.map((id) => {
          const s = data.students[id];
          return (
            <button key={id} className="kid" onClick={() => openStudent(id)}>
              <div className="av lg">{initials(s.name)}</div>
              <b>{s.name}</b>
              <div className="mu">{s.age} años · {s.group}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export default ParentHome;
