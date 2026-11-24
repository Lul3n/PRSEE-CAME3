import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut, sendEmailVerification } from "firebase/auth";
import { auth } from "./firebase";
import {
  findUser, listenData, newStudentId,
  saveStudentDoc, saveTeacherDoc, deleteStudentDoc, deleteTeacherDoc,
} from "./db";
import { roleLabel } from "./data";
import Login from "./screens/Login";
import AdminHome from "./screens/AdminHome";
import TeacherHome from "./screens/TeacherHome";
import ParentHome from "./screens/ParentHome";
import StudentDetail from "./screens/StudentDetail";

const EMPTY = { teachers: [], students: {} };

function App() {
  // Sesión de Firebase Auth.
  const [authEmail, setAuthEmail] = useState(null); // null = nadie ha iniciado sesión
  const [verified, setVerified] = useState(false);  // ¿ya abrió el enlace de verificación?
  const [checking, setChecking] = useState(true);   // esperando a Firebase al abrir la página

  // Rol y datos que vienen de Firestore.
  const [user, setUser] = useState(null);           // { role, name, email, group }
  const [loadingUser, setLoadingUser] = useState(false);
  const [data, setData] = useState(EMPTY);

  const [studentId, setStudentId] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  function showToast(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }

  // 1. Firebase avisa cuando alguien entra o sale (y recuerda la sesión al recargar).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setAuthEmail(fbUser ? fbUser.email.toLowerCase() : null);
      setVerified(fbUser ? fbUser.emailVerified : false);
      setStudentId(null);
      setChecking(false);
    });
    return unsubscribe;
  }, []);

  // 2. Con el correo verificado, se busca en Firestore qué rol tiene.
  useEffect(() => {
    setUser(null);
    setData(EMPTY);
    if (!authEmail || !verified) return;

    setLoadingUser(true);
    findUser(authEmail)
      .then((found) => setUser(found))
      .catch(() => showToast("No se pudieron cargar tus datos"))
      .finally(() => setLoadingUser(false));
  }, [authEmail, verified]);

  // 3. Con el rol listo, se escuchan sus datos en tiempo real.
  useEffect(() => {
    if (!user) return;
    return listenData(user, setData);
  }, [user]);

  function logout() {
    signOut(auth);
  }

  async function checkVerified() {
    // reload trae el estado nuevo de la cuenta y getIdToken(true) renueva el permiso
    // para que Firestore también sepa que ya está verificado.
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    if (auth.currentUser.emailVerified) {
      setVerified(true);
    } else {
      showToast("Todavía no aparece verificado");
    }
  }

  async function resendVerification() {
    try {
      await sendEmailVerification(auth.currentUser);
      showToast("Correo enviado");
    } catch {
      showToast("Espera un momento antes de pedir otro correo");
    }
  }

  function openStudent(id) {
    setStudentId(id);
    window.scrollTo(0, 0);
  }

  // Guardar en Firestore. onSnapshot actualiza la pantalla solo.
  function saveStudent(id, student) {
    const studentKey = id || newStudentId();
    saveStudentDoc(studentKey, student).catch(() => showToast("No se pudo guardar el alumno"));
    return studentKey;
  }

  function saveTeacher(teacher) {
    saveTeacherDoc(teacher).catch(() => showToast("No se pudo guardar el maestro"));
  }

  function deleteStudent(id) {
    setStudentId(null);
    deleteStudentDoc(id).catch(() => showToast("No se pudo eliminar el alumno"));
  }

  function deleteTeacher(teacher) {
    deleteTeacherDoc(teacher).catch(() => showToast("No se pudo eliminar el maestro"));
  }

  const props = {
    data, user, openStudent, showToast,
    saveStudent, saveTeacher, deleteStudent, deleteTeacher,
  };

  let content;
  if (checking || loadingUser) {
    content = <p className="mu">Cargando...</p>;
  } else if (!authEmail) {
    content = <Login />;
  } else if (!verified) {
    content = (
      <section className="card">
        <h2>Verifica tu correo</h2>
        <p className="mu">
          Te enviamos un enlace a {authEmail}. Ábrelo y después regresa aquí.
          Si no lo ves, revisa la carpeta de spam.
        </p>
        <div className="chips actions">
          <button className="btn" onClick={checkVerified}>Ya lo verifiqué</button>
          <button className="btn ghost" onClick={resendVerification}>Reenviar correo</button>
        </div>
      </section>
    );
  } else if (!user) {
    content = (
      <section className="card">
        <h2>Tu correo no está dado de alta en CAME</h2>
        <p className="mu">Pide a la administración que registre {authEmail}.</p>
        <button className="btn" onClick={logout}>Cerrar sesión</button>
      </section>
    );
  } else if (studentId && data.students[studentId]) {
    content = <StudentDetail {...props} id={studentId} onBack={() => setStudentId(null)} />;
  } else if (user.role === "admin") {
    content = <AdminHome {...props} />;
  } else if (user.role === "teacher") {
    content = <TeacherHome {...props} />;
  } else {
    content = <ParentHome {...props} />;
  }

  return (
    <>
      <header className="top">
        <span className="brand" aria-label="CAME">
          <span>C</span><span>A</span><span>M</span><span>E</span>
        </span>
        <span className="role">{roleLabel(user)}</span>
        {authEmail && (
          <button className="btn ghost sm" onClick={logout}>Cerrar sesión</button>
        )}
      </header>
      <main className="wrap">{content}</main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}

export default App;
