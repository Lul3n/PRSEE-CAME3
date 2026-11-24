# CAME · Plataforma de Registro y Seguimiento para Educación Especial

App web (React + Vite) para el seguimiento de evaluaciones PAC: administrador, maestras y madres/padres.

## Correr en tu compu
Primero copia `.env.example` como `.env` y llénalo con la configuración de Firebase
(Configuración del proyecto > Tus apps > Web). El `.env` no se sube a git.
```
npm install
npm run dev
```

## Publicar en Firebase Hosting
```
npm install -g firebase-tools   (solo la primera vez)
firebase login
firebase use --add              (elige el proyecto de Firebase)
npm run deploy
```

## Firebase
- **Authentication** (correo y contraseña): al crear cuenta se manda un correo de verificación,
  y no se ven datos hasta abrir ese enlace.
- **Firestore**: guarda los datos. Colecciones:
  - `admins/{correo}`: `{ name }`. Se crean a mano en la consola.
  - `teachers/{correo}`: `{ name, group, email }`.
  - `students/{id}`: datos del alumno, `tutors`, `tutorEmails` y `evaluations`.
- El rol se decide por el correo: si está en `admins`, en `teachers` o en los tutores de algún alumno.
- `firestore.rules`: quién puede leer y escribir (admin todo, maestra su grupo, tutores solo a sus hijos).
  `npm run deploy` sube la página y las reglas.

## Evaluaciones PAC
Cada alumno tiene la prueba que se le aplica (PAC1 o PAC2). Las evaluaciones son
checklists con los indicadores del PDF (`src/pacTests.js`), calificados en 3 niveles:
Aún no lo logra, En proceso y Lo logra, cada uno con comentario opcional.
Maestra y admin crean y editan evaluaciones; madres y padres solo las consultan.
La gráfica compara las evaluaciones que se seleccionen (% de logro por área).

## Estructura
- `src/data.js`: listas fijas y funciones de apoyo
- `src/db.js`: lectura y escritura en Firestore
- `src/pac.js`: niveles de logro y cálculo de porcentajes
- `src/pacTests.js`: indicadores de PAC1 y PAC2
- `src/firebase.js`: conexión con Firebase
- `src/App.jsx`: sesión y qué pantalla se muestra
- `src/screens/`: Login, AdminHome, TeacherHome, ParentHome, StudentDetail
- `src/components/`: StudentRow, Radar, Modal, StudentForm, EvaluationModal, TeacherForm
