// Archivo: js/main.js
export function smoothScrollToForm(formElement, currentStep) {
  // pequeño delay para asegurar renderizado del DOM
  setTimeout(() => {
    if (!currentStep) return;

    const header = document.querySelector('.form-header');
    const stickyHeaderHeight = header ? header.offsetHeight : 0;
    const COMPENSATION_OFFSET = 30;
    const totalOffset = stickyHeaderHeight + COMPENSATION_OFFSET;

    // ¿el modal está visible ahora?
    const modalEl = document.getElementById('registroModal');
    const modalVisible = modalEl && modalEl.classList.contains('show');

    // elegimos contenedor según situación:
    // - si el modal está abierto (desktop o móvil) usamos .modal-body (si existe)
    // - si no hay modal visible y existe #mainScrollContainer, lo usamos
    // - si nada aplica, usamos window
    let scrollContainer = null;
    if (modalVisible) {
      scrollContainer = modalEl.querySelector('.modal-body') || modalEl.querySelector('.modal-content');
    }
    if (!scrollContainer) {
      scrollContainer = document.querySelector('#mainScrollContainer') || window;
    }

    // función que calcula target dentro de un contenedor (no window)
    const calcTargetInContainer = (container, element) => {
      const elRect = element.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();
      // offset del elemento relativo al contenedor + scrollTop actual del contenedor
      const relTop = elRect.top - contRect.top + (container.scrollTop || 0);
      return Math.max(0, Math.floor(relTop - totalOffset));
    };

    // función que calcula target en window
    const calcTargetInWindow = (element) => {
      const rect = element.getBoundingClientRect();
      return Math.max(0, Math.floor(window.scrollY + rect.top - totalOffset));
    };

    // Ejecutar scroll de manera robusta
    const doScroll = () => {
      if (scrollContainer === window) {
        const targetY = calcTargetInWindow(currentStep);
        // smooth; luego refuerzo sin smooth
        window.scrollTo({ top: targetY, behavior: 'smooth' });
        setTimeout(() => window.scrollTo({ top: targetY, behavior: 'auto' }), 300);
      } else {
        const targetY = calcTargetInContainer(scrollContainer, currentStep);
        // si el container soporta scrollTo con options
        if (typeof scrollContainer.scrollTo === 'function') {
          scrollContainer.scrollTo({ top: targetY, behavior: 'smooth' });
        } else {
          scrollContainer.scrollTop = targetY;
        }
        // refuerzo
        setTimeout(() => { scrollContainer.scrollTop = targetY; }, 300);
      }
    };

    // Aseguramos renderizado antes de scroll (evita flicker)
    // requestAnimationFrame + pequeño timeout es muy fiable
    requestAnimationFrame(() => {
      setTimeout(() => {
        doScroll();
      }, 20);
    });

    // focus en primer campo
    const firstInput = currentStep.querySelector("input, select, textarea");
    if (firstInput) {
      // pequeño delay para que el scroll empiece antes de enfocar
      setTimeout(() => firstInput.focus({ preventScroll: true }), 350);
    }

  }, 40); // delay inicial (40ms) para seguridad en navegadores lentos
}



const carouselElement = document.getElementById('imageCarousel');
const bannerTitle = document.getElementById('bannerTitle');
const bannerText = document.getElementById('bannerText');

const slideTexts = [
  { title: "Bienvenido al Servicio de salud", text: "¡Nos gusta tenerte aqui!" },
  { title: "Comprometidos con la Comunidad", text: "Regístrate y ayúdanos a cuidar de la comunidad Univalle." },
  { title: "Innovación en Salud", text: "Sé parte de un equipo profesional y en constante crecimiento." }
];

carouselElement.addEventListener('slid.bs.carousel', (event) => {
  const index = event.to;
  bannerTitle.textContent = slideTexts[index].title;
  bannerText.textContent = slideTexts[index].text;
});
