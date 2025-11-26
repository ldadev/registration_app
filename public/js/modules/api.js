// modules/api.js

// ======================================
// 🌐 Conexión a Google Apps Script
// ======================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwsnzfKD8iUEJUa99VRvvxndQ_T4PqE2f6R5p799v2FfQvytbkti4t3gZNh6FGhzsVw/exec";

/**
 * Carga opciones dinámicas desde Apps Script (tipoProfesional, especialidad)
 */
export function cargarSelect(tipo, selectId) {
  const select = document.getElementById(selectId);
  if (!select) {
    console.warn(`⚠️ No se encontró el select con id="${selectId}"`);
    return;
  }

  select.innerHTML = `<option>Cargando...</option>`;

  const callbackName = tipo === "profesional"
    ? "llenarSelect_tipoProfesional"
    : "llenarSelect_especialidad";
  
  // Definir el callback que recibe los datos
  window[callbackName] = function (data) {
    select.innerHTML = `<option value="">Seleccione...</option>`;
    data.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      select.appendChild(opt);
    });
    console.log(`✅ Select "${selectId}" cargado (${data.length} elementos)`);
  };

  // Crear un script dinámico para el JSONP de Apps Script
  const script = document.createElement("script");
  script.src = `${SCRIPT_URL}?type=${tipo}&callback=${callbackName}`;
  script.async = true;
  document.head.appendChild(script);
}

// ======================================
// 🗺️ Cargar Departamentos y Municipios DANE
// ======================================
export async function cargarMunicipios() {
  try {
    const url = "https://www.datos.gov.co/resource/82di-kkh9.json?$limit=2000";
    const res = await fetch(url);
    const data = await res.json();

    const dptoSelect = document.getElementById("departamentoSelect");
    const mpioSelect = document.getElementById("municipioSelect");
    if (!dptoSelect || !mpioSelect) {
      console.warn("⚠️ No se encontraron los selects de departamento o municipio");
      return;
    }

    // Normalizar datos
    const daneData = data.map(d => ({
      dpto: d.dpto.trim(),
      nom_mpio: d.nom_mpio.trim()
    }));

    // Llenar departamentos únicos
    const deptos = [...new Set(daneData.map(d => d.dpto))].sort();
    dptoSelect.innerHTML = '<option value="">Seleccione...</option>';
    deptos.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      dptoSelect.appendChild(opt);
    });

    // Al cambiar de departamento → llenar municipios
    dptoSelect.onchange = e => {
      const municipios = daneData.filter(d => d.dpto === e.target.value);
      mpioSelect.innerHTML = '<option value="">Seleccione...</option>';
      municipios.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.nom_mpio;
        opt.textContent = m.nom_mpio;
        mpioSelect.appendChild(opt);
      });
    };

    console.log("🗺️ Datos DANE cargados correctamente");
  } catch (err) {
    console.error("❌ Error cargando municipios:", err);
  }
}
