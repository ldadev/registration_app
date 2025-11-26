// /public/js/main.js

console.log("✅ main.js cargado correctamente");

// Importaciones
import { smoothScrollToForm } from "./modules/utils.js"; 
import { initSteps } from "./modules/steps.js";
import { enableNumericOnlyInputs, validateStep, initCorreoVisibility } from "./modules/validation.js";
import { initCorreoLogic } from "./modules/correo.js";
import { initFirma } from "./modules/firma.js";
import { cargarSelect, cargarMunicipios } from "./modules/api.js";
import { initFormSubmission } from "./modules/submit.js"; // <-- Usa Swal
import { initModalDimmer } from "./modules/modalDimmer.js";


// 💡 SOLUCIÓN: Usamos el evento 'load' de la ventana.
// Este evento espera a que todos los recursos externos (incluyendo SweetAlert2)
// se carguen completamente antes de ejecutar la inicialización.
window.addEventListener("load", () => {
  smoothScrollToForm();
  enableNumericOnlyInputs();
  initCorreoVisibility();
  initSteps();
  initCorreoLogic();
  initFirma();

  // Funciones asíncronas de carga de datos
  cargarSelect("profesional", "tipoProfesional");
  cargarSelect("especialidad", "especialidad");
  cargarMunicipios();
  
  initModalDimmer();

  // Inicializar la lógica de envío (que depende de Swal)
  initFormSubmission(); 
  
  console.log("🚀 Todas las inicializaciones completadas después de cargar recursos.");
});