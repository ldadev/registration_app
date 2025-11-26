// modules/submit.js
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.esm.js';

// URL de tu Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsnzfKD8iUEJUa99VRvvxndQ_T4PqE2f6R5p799v2FfQvytbkti4t3gZNh6FGhzsVw/exec";

/**
 * Inicializa el listener de envío del formulario.
 */
export function initFormSubmission() {
  const form = document.getElementById("userForm");
  if (!form) {
    console.warn("⚠️ initFormSubmission: No se encontró #userForm");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // --- Obtener canvas y firma subida ---
    const canvas = document.getElementById("signature-pad");
    const previewImg = document.querySelector("#signaturePreview img");
    const uploadedSignature = previewImg ? previewImg.src : null;

    // --- Verificar si el canvas está vacío ---
    function isCanvasEmpty(canvasEl) {
      if (!canvasEl) return true;
      const ctx = canvasEl.getContext("2d");
      const data = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height).data;
      return !data.some((_, i) => i % 4 === 3 && data[i] !== 0);
    }

    const firmaCanvasVacia = isCanvasEmpty(canvas);
    if (firmaCanvasVacia && !uploadedSignature) {
      Swal.fire("Error", "Debe dibujar o cargar su firma antes de enviar.", "error");
      return;
    }

    // --- Preparar datos del formulario ---
    const plainForm = Object.fromEntries(new FormData(form).entries());
    plainForm.firmaDataURL = !firmaCanvasVacia ? canvas.toDataURL("image/png") : uploadedSignature;
    plainForm.correoDestino =
      (plainForm.estadoCorreo !== "No tengo" &&
        plainForm.estadoCorreo !== "En trámite" &&
        plainForm.correoUnivalle)
        ? plainForm.correoUnivalle
        : plainForm.correo;

    const jsonString = encodeURIComponent(JSON.stringify(plainForm));

    // --- Mostrar loading ---
    Swal.fire({
      title: "Enviando...",
      text: "Por favor espere mientras se guarda la información.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // --- Crear iframe temporal ---
    let iframe = document.getElementById("gsheetFrame");
    if (iframe) iframe.remove();
    iframe = document.createElement("iframe");
    iframe.id = "gsheetFrame";
    iframe.name = "gsheetFrame";
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // --- Escuchar respuesta ---
    const handleMessage = (event) => {
      let data = event.data;
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch (err) {}
      }

      Swal.close();

      if (data?.status === "success") {
        Swal.fire("✅ Éxito", data.message || "Usuario guardado correctamente.", "success")
          .then(() => {
            // ✅ Cerrar modal al finalizar
            const modalEl = document.getElementById("registroModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            resetAfterSubmit(form, canvas);
          });
      } else {
        Swal.fire("⚠️ Error", data?.message || "Error desconocido al enviar el formulario.", "error");
      }

      window.removeEventListener("message", handleMessage);
    };
    window.addEventListener("message", handleMessage);

    // --- Enviar al script dentro del iframe ---
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <form id="tempForm" method="POST" action="${SCRIPT_URL}" target="_self">
        <input type="hidden" name="json" value="${jsonString}" />
      </form>
      <script>
        (async function () {
          const form = document.getElementById("tempForm");
          form.addEventListener("submit", async (e) => {
            e.preventDefault();
            try {
              const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
              const data = await res.json();
              window.parent.postMessage(data, "*");
            } catch (err) {
              window.parent.postMessage({ status: "error", message: "Error al procesar la respuesta del servidor." }, "*");
            }
          });
          form.submit();
        })();
      <\/script>
    `);
    doc.close();

    // --- Fallback: cierre si no hay respuesta ---
    setTimeout(() => {
      try {
        if (Swal.isLoading && Swal.isLoading()) {
          Swal.close();
          Swal.fire({
            text: "Solicitud enviada. Revisa tu correo electrónico.",
            icon: "success"
          }).then(() => {
            const modalEl = document.getElementById("registroModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            resetAfterSubmit(form, canvas);
          });
          window.removeEventListener("message", handleMessage);
        }
      } catch (e) {}
    }, 10000);
  });
}

/**
 * 🔄 Limpieza tras el envío exitoso
 */
function resetAfterSubmit(formElement, canvasEl) {
  try {
    if (formElement) formElement.reset();

    if (canvasEl) {
      const ctx = canvasEl.getContext("2d");
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }

    const previewDiv = document.getElementById("signaturePreview");
    if (previewDiv) previewDiv.innerHTML = "";

    window.dispatchEvent(new Event("formReset"));
  } catch (err) {
    console.error("resetAfterSubmit error:", err);
  }
}
