import { useEffect } from "react";

// Ventana encima de la pantalla. Se cierra con Esc.
// wide: ventana más ancha (para las evaluaciones).
function Modal({ title, subtitle, wide, onClose, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={wide ? "card wide" : "card"}>
        <h2>{title}</h2>
        {subtitle && <p className="mu modal-sub">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export default Modal;
