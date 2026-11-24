// Lectura y escritura en Firestore.
//
// Colecciones:
//   admins/{correo}    -> { name }                       (se crean a mano en la consola)
//   teachers/{correo}  -> { name, group, email }
//   students/{id}      -> { name, age, disability, group, test, comments,
//                           tutors: [...], tutorEmails: [...], evaluations: [...] }
//
// tutorEmails es una lista con solo los correos de los tutores; sirve para que
// madres y padres puedan buscar a sus hijos (y para las reglas de seguridad).

import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  onSnapshot, query, where,
} from "firebase/firestore";
import { db } from "./firebase";

// Averigua quién es el usuario según su correo: admin, maestra o tutor.
export async function findUser(email) {
  const admin = await getDoc(doc(db, "admins", email));
  if (admin.exists()) {
    return { role: "admin", name: admin.data().name || "Administración", email };
  }

  const teacher = await getDoc(doc(db, "teachers", email));
  if (teacher.exists()) {
    const t = teacher.data();
    return { role: "teacher", name: t.name, group: t.group, email };
  }

  const kids = await getDocs(
    query(collection(db, "students"), where("tutorEmails", "array-contains", email))
  );
  if (!kids.empty) {
    const tutor = kids.docs[0].data().tutors.find((t) => t.email.toLowerCase() === email);
    return { role: "parent", name: tutor ? tutor.name : email, email };
  }

  return null;
}

// Escucha en tiempo real los datos que le tocan a cada usuario.
// Cada vez que algo cambia en Firestore se llama onChange con los datos nuevos.
// Regresa una función para dejar de escuchar (al cerrar sesión).
export function listenData(user, onChange) {
  let teachers = [];
  let students = {};
  const update = () => onChange({ teachers, students });

  // Consulta de alumnos según el rol.
  let studentsQuery = collection(db, "students");
  if (user.role === "teacher") {
    studentsQuery = query(studentsQuery, where("group", "==", user.group));
  } else if (user.role === "parent") {
    studentsQuery = query(studentsQuery, where("tutorEmails", "array-contains", user.email));
  }

  const stopStudents = onSnapshot(studentsQuery, (snap) => {
    students = {};
    snap.forEach((d) => {
      students[d.id] = d.data();
    });
    update();
  });

  // Madres y padres no necesitan la lista de maestros.
  let stopTeachers = () => {};
  if (user.role !== "parent") {
    stopTeachers = onSnapshot(collection(db, "teachers"), (snap) => {
      teachers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      update();
    });
  }

  return () => {
    stopStudents();
    stopTeachers();
  };
}

// Crea un id nuevo para un alumno (Firestore lo genera sin tener que guardar todavía).
export function newStudentId() {
  return doc(collection(db, "students")).id;
}

// Guarda un alumno. merge: true solo cambia los campos que se mandan.
export function saveStudentDoc(id, student) {
  const fields = { ...student };
  if (student.tutors) {
    fields.tutorEmails = student.tutors.map((t) => t.email).filter(Boolean);
  }
  return setDoc(doc(db, "students", id), fields, { merge: true });
}

// Borra un alumno (con sus evaluaciones, que van dentro del mismo documento).
export function deleteStudentDoc(id) {
  return deleteDoc(doc(db, "students", id));
}

// Borra un maestro. Su cuenta de Authentication sigue existiendo, pero ya no tiene rol.
export function deleteTeacherDoc(teacher) {
  return deleteDoc(doc(db, "teachers", teacher.id));
}

// Guarda un maestro. El id del documento es su correo.
export async function saveTeacherDoc(teacher) {
  const { id, ...fields } = teacher;
  // Si le cambiaron el correo, se borra el documento con el correo anterior.
  if (id && id !== fields.email) {
    await deleteDoc(doc(db, "teachers", id));
  }
  await setDoc(doc(db, "teachers", fields.email), fields);
}
