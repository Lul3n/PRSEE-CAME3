import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase";

// Debe coincidir con Authentication > Configuración > Política de contraseñas.
const PASSWORD_RULES =
  "mínimo 8 caracteres, con al menos una mayúscula, una minúscula, un número y un carácter especial (por ejemplo ! # $ %).";

// Traduce los códigos de error de Firebase a mensajes para el usuario.
function errorMessage(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Ese correo ya tiene cuenta. Inicia sesión.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "La contraseña no cumple los requisitos: " + PASSWORD_RULES;
    case "auth/invalid-email":
      return "Escribe un correo válido.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento e intenta otra vez.";
    case "auth/invalid-api-key":
    case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
      return "Falta configurar Firebase (src/firebase.js).";
    default:
      return "No se pudo conectar. Revisa tu internet e intenta de nuevo.";
  }
}

// mode: "login" para iniciar sesión, "registro" para crear la cuenta.
function Login() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "registro";

  function changeMode(newMode) {
    setMode(newMode);
    setPassword("");
    setConfirm("");
    setError("");
    setInfo("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Escribe tu correo y tu contraseña.");
      return;
    }
    if (isRegister && password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        // Se manda un enlace para comprobar que el correo sí es suyo.
        await sendEmailVerification(cred.user);
      } else {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      }
      // Si sale bien, App se entera con onAuthStateChanged y cambia de pantalla.
    } catch (err) {
      setError(errorMessage(err.code));
    }
    setLoading(false);
  }

  async function handleForgot() {
    setError("");
    setInfo("");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Escribe tu correo para enviarte el enlace.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setInfo("Si el correo tiene cuenta, te llegará un enlace para cambiar la contraseña.");
    } catch (err) {
      setError(errorMessage(err.code));
    }
  }

  return (
    <div className="login">
      <div className="login-logo" aria-hidden="true">
        <span>C</span><span>A</span><span>M</span><span>E</span>
      </div>
      <p className="login-tag">Plataforma de Registro y Seguimiento para Educación Especial</p>

      <form className="card" onSubmit={handleSubmit}>
        <h1 className="login-title">{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h1>
        {isRegister && (
          <p className="mu">Usa el correo que registró la escuela.</p>
        )}

        <label htmlFor="em">Correo</label>
        <input id="em" type="email" autoComplete="username" placeholder="correo@ejemplo.com"
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="pw">Contraseña</label>
        <input id="pw" type="password" autoComplete={isRegister ? "new-password" : "current-password"}
          placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />

        {isRegister && (
          <>
            <p className="mu hint">La contraseña debe tener {PASSWORD_RULES}</p>
            <label htmlFor="pw2">Confirmar contraseña</label>
            <input id="pw2" type="password" autoComplete="new-password" placeholder="••••••••"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </>
        )}

        {error && <p className="error">{error}</p>}
        {info && <p className="mu">{info}</p>}

        <button type="submit" className="btn full" disabled={loading}>
          {loading ? "Espera..." : isRegister ? "Crear cuenta" : "Entrar"}
        </button>

        {!isRegister && (
          <button type="button" className="link" onClick={handleForgot}>¿Olvidaste tu contraseña?</button>
        )}
      </form>

      {isRegister ? (
        <button className="link" onClick={() => changeMode("login")}>¿Ya tienes cuenta? Inicia sesión</button>
      ) : (
        <button className="link" onClick={() => changeMode("registro")}>¿Primera vez? Crea tu cuenta</button>
      )}
    </div>
  );
}

export default Login;
