/* ============================================================
   script.js — lógica de la ficha (JS plano, sin frameworks)
   ============================================================
   Hace tres cosas:
   1. Cambiar el color del vehículo (API de materiales de model-viewer).
   2. Avisar si el dispositivo no soporta Realidad Aumentada.
   3. Ocultar la barra de carga cuando el modelo terminó de cargar.
   ============================================================ */

const visor = document.getElementById('visor');
const nombreColor = document.getElementById('color-nombre');
const swatches = document.querySelectorAll('.swatch');

/* ------------------------------------------------------------
   CONFIGURACIÓN DE COLOR  ★ ajustá esto al cambiar de modelo ★
   ------------------------------------------------------------
   Un .glb se compone de "materiales" (carrocería, vidrio, goma...).
   Para pintar solo la carrocería hay que saber el NOMBRE de su
   material. Para verlos: abrí la consola del navegador y corré
       document.getElementById('visor').model.materials.map(m => m.name)
   o abrí el .glb en https://gltf.report o Blender.

   En el modelo de ejemplo (ToyCar) la carrocería se llama "ToyCar".
   En tu auto real probablemente sea algo como "Body", "Carroceria",
   "CarPaint"... y lo cambiás acá. Podés poner varios nombres.
------------------------------------------------------------ */
const MATERIALES_CARROCERIA = ['ToyCar'];

/* Materiales a ocultar. El modelo de ejemplo trae una tela roja ("Fabric")
   que cubre el auto; la hacemos transparente. Con tu modelo real
   dejá el array vacío: []. */
const MATERIALES_OCULTOS = ['Fabric'];

/* Espera a que el modelo termine de cargar; recién ahí existe
   visor.model y se pueden leer/modificar sus materiales. */
visor.addEventListener('load', () => {
  visor.model.materials
    .filter(m => MATERIALES_OCULTOS.includes(m.name))
    .forEach(m => {
      m.setAlphaMode('BLEND');
      m.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
    });

  // Guardamos el color original de cada material para poder "volver".
  visor.materialesCarroceria = visor.model.materials.filter(m =>
    MATERIALES_CARROCERIA.includes(m.name)
  );

  if (visor.materialesCarroceria.length === 0) {
    // Ayuda para el desarrollador: el nombre configurado no existe.
    console.warn(
      'No se encontró ningún material de carrocería. Materiales del modelo:',
      visor.model.materials.map(m => m.name)
    );
  }

  // Si el modelo tuviera "variantes" nativas (KHR_materials_variants),
  // se listarían acá. Es la forma más limpia de ofrecer colores:
  // visor.availableVariants → ['Rojo', 'Azul', ...]; y se aplica con
  // visor.variantName = 'Rojo'.
  if (visor.availableVariants && visor.availableVariants.length) {
    console.info('Variantes del modelo:', visor.availableVariants);
  }
});

/* Convierte '#rrggbb' → [r, g, b, a] con valores 0–1 (lo que pide model-viewer). */
function hexARgba(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1];
}

/* Aplica un color a la carrocería.
   - 'original' → restaura blanco (1,1,1): la textura original se ve sin tinte.
   - '#hex'     → multiplica el color base por ese tinte.
   Nota: si el material trae una textura de color (como el ToyCar), el tinte
   se MULTIPLICA con ella: el resultado es un "teñido", no un color plano.
   Un modelo de auto real, con pintura de color sólido, muestra el color exacto. */
function pintar(color) {
  const materiales = visor.materialesCarroceria || [];
  const rgba = color === 'original' ? [1, 1, 1, 1] : hexARgba(color);
  materiales.forEach(m => m.pbrMetallicRoughness.setBaseColorFactor(rgba));
}

/* Un solo listener para todos los botones de color. */
swatches.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!visor.loaded) return; // modelo aún cargando

    pintar(btn.dataset.color);

    // Actualiza estado visual y accesible (radio buttons).
    swatches.forEach(b => {
      const activo = b === btn;
      b.classList.toggle('is-active', activo);
      b.setAttribute('aria-checked', String(activo));
    });
    nombreColor.textContent = btn.dataset.nombre;
  });
});

/* ------------------------------------------------------------
   Aviso "no hay RA en este dispositivo"
   ------------------------------------------------------------
   model-viewer expone visor.canActivateAR (true/false) una vez que
   detecta qué modo de RA puede usar. En una PC de escritorio será
   false: el botón "Ver en tu espacio" no aparece y mostramos un
   texto explicativo en su lugar. */
visor.addEventListener('load', () => {
  if (!visor.canActivateAR) {
    document.getElementById('ar-aviso').hidden = false;
  }
});

/* Si el usuario sale de la RA y vuelve, model-viewer avisa con estos
   eventos (útiles para analítica en el futuro). */
visor.addEventListener('ar-status', (e) => {
  console.info('Estado RA:', e.detail.status); // not-presenting | session-started | object-placed | failed
});

/* Oculta la barra de progreso cuando termina de cargar. */
visor.addEventListener('progress', (e) => {
  const barra = visor.querySelector('.progress');
  const relleno = visor.querySelector('.progress-fill');
  const p = e.detail.totalProgress;
  relleno.style.width = `${p * 100}%`;
  barra.classList.toggle('done', p === 1);
});
