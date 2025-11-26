// modules/correo.js
export function initCorreoLogic() {
  document.addEventListener("DOMContentLoaded", () => {
    const estadoCorreoSelect = document.getElementById("estadoCorreo");
    const correoDiv = document.getElementById("correoUnivalleDiv");
    const correoInput = document.getElementById("correoUnivalle");

    if (!estadoCorreoSelect) return;

    const actualizar = () => {
      const val = estadoCorreoSelect.value;
      if (val === "Activo" || val === "Inactivo") {
        correoDiv.classList.remove("d-none");
        correoInput.setAttribute("required", "required");
      } else {
        correoDiv.classList.add("d-none");
        correoInput.removeAttribute("required");
        correoInput.value = "";
      }
    };

    estadoCorreoSelect.addEventListener("change", actualizar);
    actualizar();
  });
}
