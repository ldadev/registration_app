export function initFirma() {
  const canvas = document.getElementById("signature-pad");
  const ctx = canvas.getContext("2d");
  const fileInput = document.getElementById("signatureFile");
  const previewDiv = document.getElementById("signaturePreview");
  const clearBtn = document.getElementById("clearSignature");

  let drawing = false, lastX = null, lastY = null, lastTime = null, uploadedSignature = null;

  ctx.lineWidth = 0.9;
  ctx.strokeStyle = "rgba(30,30,30,1)";
  ctx.lineCap = "round";

  function getXY(e) {
    // Si es touch event
    if (e.touches) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.touches[0].clientX - rect.left) * (canvas.width / rect.width),
        y: (e.touches[0].clientY - rect.top) * (canvas.height / rect.height)
      };
    } else {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    }
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getXY(e);

    let now = performance.now(), thickness = 0.9;
    if (lastX !== null) {
      const dx = x - lastX, dy = y - lastY, dt = now - lastTime;
      const speed = Math.sqrt(dx * dx + dy * dy) / (dt || 1);
      thickness = Math.max(0.7, Math.min(1.3, 1.3 - speed * 16));
      ctx.lineWidth = thickness;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x; lastY = y; lastTime = now;
  }

  // Mouse Events
  canvas.addEventListener("mousedown", e => {
    drawing = true;
    ctx.beginPath();
    const { x, y } = getXY(e);
    lastX = x; lastY = y; lastTime = performance.now();
    ctx.moveTo(x, y);
  });
  canvas.addEventListener("mousemove", draw);
  ["mouseup", "mouseout"].forEach(evt => canvas.addEventListener(evt, () => drawing = false));

  // Touch Events
  canvas.addEventListener("touchstart", e => {
    drawing = true;
    ctx.beginPath();
    const { x, y } = getXY(e);
    lastX = x; lastY = y; lastTime = performance.now();
    ctx.moveTo(x, y);
  });
  canvas.addEventListener("touchmove", draw);
  canvas.addEventListener("touchend", () => drawing = false);
  canvas.addEventListener("touchcancel", () => drawing = false);

  // Carga de imagen
  if (fileInput) {
    fileInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => {
          uploadedSignature = ev.target.result;
          previewDiv.innerHTML = `<img src="${uploadedSignature}" class="img-fluid border rounded" style="max-height:200px;">`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      uploadedSignature = null;
      previewDiv.innerHTML = "";
    });
  }

  return { canvas, ctx, getSignature: () => uploadedSignature || canvas.toDataURL("image/png") };
}