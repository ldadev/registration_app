// js/modules/modalDimmer.js
export function initModalDimmer() {
  const modal = document.getElementById("registroModal");
  const carousel = document.getElementById("imageCarousel");

  if (!modal || !carousel) return;

  modal.addEventListener("show.bs.modal", () => {
    carousel.classList.add("dimmed");
  });

  modal.addEventListener("hidden.bs.modal", () => {
    carousel.classList.remove("dimmed");
  });
}
