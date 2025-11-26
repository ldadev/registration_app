import { validateStep } from "./validation.js";
import { smoothScrollToForm } from "./utils.js"; // ✅ integración directa

// 🔥 Array de títulos por step (puedes personalizar aquí)
const stepTitles = [
  'DATOS BÁSICOS',
  'UBICACIÓN Y CONTACTO',
  'DATOS ACADÉMICOS',
  'INFORMACIÓN LABORAL EN EL SERVICIO MÉDICO',
  'FIRMA'
];

let currentStep = 0;
let steps, prevBtn, nextBtn, submitBtn, formElement;
let titleElement; // elemento h2 dinámico

/**
 * Inicializa la navegación entre pasos del formulario multipaso.
 */
export function initSteps() {
  steps = document.querySelectorAll(".step");
  prevBtn = document.getElementById("prevBtn");
  nextBtn = document.getElementById("nextBtn");
  submitBtn = document.getElementById("submitBtn");
  formElement = document.getElementById("userForm");
  titleElement = document.getElementById("formStepTitle");

  if (!steps.length || !formElement || !titleElement) {
    console.warn("⚠️ No se encontraron pasos, formulario o elemento de título.");
    return;
  }

  initModalidadListeners();
  showStep(currentStep);
  attachButtonListeners();
}

/**
 * Actualiza el texto del encabezado con el título del step actual.
 */
function updateStepTitle(n) {
  if (titleElement) {
    titleElement.textContent = stepTitles[n] || "Formulario";
  }
}

/**
 * Asigna los eventos a los botones de navegación.
 */
function attachButtonListeners() {
  if (nextBtn) {
    nextBtn.onclick = () => {
      if (!validateStep(steps[currentStep], currentStep)) return;
      currentStep++;
      if (currentStep >= steps.length) currentStep = steps.length - 1;
      showStep(currentStep);
    };
  }

  if (prevBtn) {
    prevBtn.onclick = () => {
      currentStep--;
      if (currentStep < 0) currentStep = 0;
      showStep(currentStep);
    };
  }

  if (submitBtn) {
    submitBtn.onclick = e => {
      if (!validateStep(steps[currentStep], currentStep)) {
        e.preventDefault();
        return;
      }
      console.log("✅ Validaciones completas. Enviando formulario...");
      // formElement.submit(); // ← solo si manejas el envío manual
    };
  }
}

/**
 * Muestra el paso indicado y oculta los demás.
 * Controla la visibilidad de los botones según el paso actual.
 */
function showStep(n) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === n);
    step.style.display = i === n ? "block" : "none";
  });

  if (prevBtn) prevBtn.style.display = n === 0 ? "none" : "inline-block";
  if (nextBtn) nextBtn.style.display = n === steps.length - 1 ? "none" : "inline-block";
  if (submitBtn) submitBtn.classList.toggle("d-none", n !== steps.length - 1);

  updateStepTitle(n);

  // ✅ Desplazamiento suave con integración modal (sin destello)
  const current = steps[n];
  if (current) {
    setTimeout(() => {
      smoothScrollToForm(formElement, current);
    }, 50); // Pequeño retraso evita flicker visual
  }

  console.log(`📍 Mostrando paso ${n + 1} de ${steps.length}`);
}

/* =========================
   Listeners y lógica de UI
   ========================= */

function initModalidadListeners() {
  const modalidadSelect = document.getElementById("modalidadTrabajo");
  const tipoVinculacionSelect = document.getElementById("tipoVinculacion");
  const tipoVinculacionDiv = document.getElementById("tipoVinculacionDiv");
  const fechaInicioDiv = document.getElementById("fechaInicioDiv");
  const fechaFinDiv = document.getElementById("fechaFinDiv");
  const fechaInicioInput = document.querySelector("input[name='fechaInicio']");
  const fechaFinInput = document.querySelector("input[name='fechaFin']");

  const handleModalidadChange = () => {
    const val = (modalidadSelect?.value || "").trim();
    if (!tipoVinculacionDiv || !tipoVinculacionSelect) return;

    if (val === "Remota" || val === "Presencial y Remota") {
      tipoVinculacionDiv.classList.remove("d-none");
      tipoVinculacionSelect.setAttribute("required", "required");
    } else {
      tipoVinculacionDiv.classList.add("d-none");
      tipoVinculacionSelect.removeAttribute("required");
      tipoVinculacionSelect.value = "";
      if (fechaInicioDiv) fechaInicioDiv.classList.add("d-none");
      if (fechaFinDiv) fechaFinDiv.classList.add("d-none");
      if (fechaInicioInput) fechaInicioInput.value = "";
      if (fechaFinInput) fechaFinInput.value = "";
    }
  };

  const handleTipoVincChange = () => {
    const val = (tipoVinculacionSelect?.value || "").trim();
    if (!fechaInicioDiv || !fechaFinDiv) return;

    if (val === "Contratista") {
      fechaInicioDiv.classList.remove("d-none");
      fechaFinDiv.classList.remove("d-none");
      const fin = document.querySelector("input[name='fechaFin']");
      const ini = document.querySelector("input[name='fechaInicio']");
      if (ini) ini.setAttribute("required", "required");
      if (fin) fin.setAttribute("required", "required");
    } else {
      fechaInicioDiv.classList.add("d-none");
      fechaFinDiv.classList.add("d-none");
      const fin = document.querySelector("input[name='fechaFin']");
      const ini = document.querySelector("input[name='fechaInicio']");
      if (ini) {
        ini.removeAttribute("required");
        ini.value = "";
      }
      if (fin) {
        fin.removeAttribute("required");
        fin.value = "";
      }
    }
  };

  if (modalidadSelect) modalidadSelect.addEventListener("change", handleModalidadChange);
  if (tipoVinculacionSelect) tipoVinculacionSelect.addEventListener("change", handleTipoVincChange);

  handleModalidadChange();
  handleTipoVincChange();
}

/* ==========================================
   🔄 Restablecer formulario tras el envío
   ========================================== */
window.addEventListener("formReset", () => {
  currentStep = 0;
  showStep(currentStep);
  if (formElement) formElement.reset();
  console.log("🧹 Formulario restablecido y vuelto al paso 1");
});
