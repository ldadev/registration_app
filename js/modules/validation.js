// modules/validation.js
export const numericFields = [
  "documento", "telefono", "celular", "tarjetaProfesional",
  "intensidadHoraria", "registroSalud"
];

// 🔢 Bloquea entrada no numérica
export function enableNumericOnlyInputs() {
  numericFields.forEach(name => {
    const input = document.querySelector(`input[name='${name}']`);
    if (!input) return;

    input.addEventListener("keydown", e => {
      if (
        [46, 8, 9, 27, 13, 110].includes(e.keyCode) ||
        e.ctrlKey || e.metaKey ||
        (e.keyCode >= 35 && e.keyCode <= 40)
      ) return;

      if (
        (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
        (e.keyCode < 96 || e.keyCode > 105)
      ) {
        e.preventDefault();
      }
    });
  });

  console.log("🔢 Validadores numéricos activados");
}

// ============================================
// 🧩 VALIDACIÓN DE CADA PASO
// ============================================
export function validateStep(stepElement, stepIndex) {
  const numericOnlyRegex = /^\d+$/;
  const inputs = stepElement.querySelectorAll("input, select, textarea");

  for (let input of inputs) {
    // Omitir opcionales vacíos
    if (
      ["telefono", "observaciones", "tarjetaProfesional", "registroSalud"].includes(input.name) &&
      input.value.trim() === ""
    ) continue;

    // 🔢 Validación numérica
    if (numericFields.includes(input.name) && input.value.trim() !== "") {
      const cleanValue = input.value.trim().replace(/\s/g, "");
      if (!numericOnlyRegex.test(cleanValue)) {
        Swal.fire(
          "Error de Formato",
          `El campo **${input.name.toUpperCase()}** solo debe contener números.`,
          "error"
        );
        return false;
      }
    }

    // 📧 Validación especial de correo institucional
    if (input.name === "correoUnivalle") {
      const estadoCorreo = document.querySelector("select[name='estadoCorreo']")?.value?.trim();
      if (estadoCorreo !== "No tengo" && estadoCorreo !== "En trámite" && input.value.trim() === "") {
        Swal.fire(
          "Error",
          "Debe ingresar su correo institucional si el estado no es 'No tengo' ni 'En trámite'.",
          "error"
        );
        return false;
      }
    }

    // ✅ Validación HTML5 estándar
    if (!input.checkValidity()) {
      input.reportValidity();
      return false;
    }
  }

  // ============================================
  // 📄 Validaciones adicionales: Modalidad y Contrato
  // ============================================
  const stepId = stepElement.id?.toLowerCase();

  if (stepId === "step4" || stepId.includes("contrato")) {
    const modalidadSelect = document.getElementById("modalidadTrabajo");
    const tipoVinculacionSelect = document.getElementById("tipoVinculacion");
    const fechaInicio = document.querySelector("input[name='fechaInicio']")?.value?.trim();
    const fechaFin = document.querySelector("input[name='fechaFin']")?.value?.trim();

    if (
      (modalidadSelect?.value === "Remota" || modalidadSelect?.value === "Presencial y Remota") &&
      tipoVinculacionSelect?.value === ""
    ) {
      Swal.fire(
        "Error",
        "Debe seleccionar el tipo de vinculación si la modalidad es remota o presencial y remota.",
        "error"
      );
      return false;
    }

    if (
      tipoVinculacionSelect?.value === "Contratista" &&
      (!fechaInicio || !fechaFin)
    ) {
      Swal.fire(
        "Error",
        "Debe ingresar las fechas de inicio y fin del contrato para contratistas.",
        "error"
      );
      return false;
    }
  }

  return true;
}

// ============================================
// 📧 Control de visibilidad de Correo Univalle
// ============================================
export function initCorreoVisibility() {
  const estadoCorreoSelect = document.getElementById("estadoCorreo");
  const correoDiv = document.getElementById("correoUnivalleDiv");
  const correoInput = document.getElementById("correoUnivalle");

  if (!estadoCorreoSelect || !correoDiv || !correoInput) return;

  const actualizarVisibilidad = () => {
    const valorSeleccionado = estadoCorreoSelect.value;

    if (valorSeleccionado === "Activo" || valorSeleccionado === "Inactivo") {
      correoDiv.classList.remove("d-none");
      correoInput.setAttribute("required", "required");
    } else {
      correoDiv.classList.add("d-none");
      correoInput.removeAttribute("required");
      correoInput.value = "";
    }
  };

  estadoCorreoSelect.addEventListener("change", actualizarVisibilidad);
  actualizarVisibilidad(); // Ejecutar al inicio
}
