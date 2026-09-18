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
   CONFIGURACIÓN POR MODELO  ★ se define en el HTML de cada demo ★
   ------------------------------------------------------------
   Un .glb se compone de "materiales" (carrocería, vidrio, goma...).
   Para cambiar el color de una parte hay que saber el NOMBRE de su
   material. Para verlos: abrí la consola del navegador y corré
       document.getElementById('visor').model.materials.map(m => m.name)
   o abrí el .glb en https://gltf.report o Blender.

   Luego se declaran como atributos del <model-viewer>:
     data-materiales-color="paint"    → materiales que cambian de color
                                        (varios: "paint,trim")
     data-materiales-ocultos="Fabric" → materiales que se vuelven
                                        transparentes (opcional)
   Si la página no tiene botones de color (ej. menú de pizza), no pasa nada.
------------------------------------------------------------ */
const lista = (attr) => (visor.dataset[attr] || '').split(',').map(x => x.trim()).filter(Boolean);
// Funciones (no constantes): el selector de vehículo cambia estos atributos en vivo.
const materialesColor = () => lista('materialesColor');
const materialesOcultos = () => lista('materialesOcultos');

/* Espera a que el modelo termine de cargar; recién ahí existe
   visor.model y se pueden leer/modificar sus materiales. */
visor.addEventListener('load', () => {
  visor.model.materials
    .filter(m => materialesOcultos().includes(m.name))
    .forEach(m => {
      m.setAlphaMode('BLEND');
      m.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 0]);
    });

  visor.materialesCarroceria = visor.model.materials.filter(m =>
    materialesColor().includes(m.name)
  );
  // Guardamos el color original de cada material para poder "volver".
  visor.coloresOriginales = new Map(
    visor.materialesCarroceria.map(m => [m, [...m.pbrMetallicRoughness.baseColorFactor]])
  );

  if (materialesColor().length && visor.materialesCarroceria.length === 0) {
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
   - 'original' → restaura el color que traía el modelo (guardado al cargar).
   - '#hex'     → reemplaza el color base de la pintura.
   Nota: si el material trae una textura de color, el tinte se MULTIPLICA con
   ella (queda un "teñido"). En pintura de color sólido se ve el color exacto. */
function pintar(color) {
  const materiales = visor.materialesCarroceria || [];
  materiales.forEach(m => {
    const rgba = color === 'original' ? visor.coloresOriginales.get(m) : hexARgba(color);
    m.pbrMetallicRoughness.setBaseColorFactor(rgba);
  });
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

/* ------------------------------------------------------------
   DATOS DE CONTACTO  ★ completá esto con tus datos ★
   ------------------------------------------------------------
   Alimentan los botones "Quiero esto para mis vehículos" y la firma
   del pie. Si dejás todo vacío, el botón principal lleva a la
   sección "Así funciona".
   - nombre:   tu marca o nombre (ej. 'Bruno · WebAR')
   - whatsapp: solo números con código de país (ej. '59899123456')
   - email:    alternativa si no usás WhatsApp
------------------------------------------------------------ */
const CONTACTO = { nombre: 'Bruno Rodriguez', whatsapp: '', email: '' };

(function configurarContacto() {
  const mensaje = 'Hola! Vi la demo de Realidad Aumentada y quiero algo así para mis vehículos.';
  let href = null;
  if (CONTACTO.whatsapp) {
    href = `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
  } else if (CONTACTO.email) {
    href = `mailto:${CONTACTO.email}?subject=${encodeURIComponent('Demo Realidad Aumentada')}&body=${encodeURIComponent(mensaje)}`;
  }
  if (href) {
    ['cta', 'cta2'].forEach(id => {
      const a = document.getElementById(id);
      a.href = href;
      if (CONTACTO.whatsapp) { a.target = '_blank'; a.rel = 'noopener'; }
    });
  }
  if (CONTACTO.nombre) {
    document.getElementById('firma').textContent = `Demo creada por ${CONTACTO.nombre}`;
  }
})();

/* ------------------------------------------------------------
   ANIMACIONES (puertas, baúl, techo solar...)
   ------------------------------------------------------------
   Si el .glb trae animaciones, model-viewer las lista en
   visor.availableAnimations. Mostramos un botón por animación.
   Cada botón abre y cierra (alternando) recorriendo la animación
   hacia adelante o hacia atrás con visor.currentTime.
   Ojo: model-viewer aplica UNA animación a la vez; al elegir otra,
   la anterior vuelve a su posición inicial.
------------------------------------------------------------ */
const ETIQUETAS_ANIM = {
  'Open all doors': 'Todas las puertas',
  'Front left door': 'Puerta delantera izq.',
  'Front right door': 'Puerta delantera der.',
  'Rear left door': 'Puerta trasera izq.',
  'Rear right door': 'Puerta trasera der.',
  'Tailgate and shelf': 'Baúl',
  'Sunroof': 'Techo solar',
  'Airbags': 'Airbags',
  'Wind deflector': 'Deflector de viento',
  'Cupholder': 'Portavasos',
};
const OCULTAS_ANIM = /support arm/i;      // partes de otra animación; no merecen botón propio

const panelAnim = document.getElementById('anims');
const listaAnim = document.getElementById('anim-list');
let animActual = null, animAbierta = false, animRaf = 0;

function detenerAnimacion() {
  cancelAnimationFrame(animRaf);
  animActual = null; animAbierta = false;
}

async function alternarAnimacion(nombre, boton) {
  cancelAnimationFrame(animRaf);
  visor.removeAttribute('auto-rotate');            // que el auto no gire mientras se abre
  if (nombre !== animActual) {                     // animación nueva: arranca cerrada
    visor.animationName = nombre;
    animActual = nombre; animAbierta = false;
    listaAnim.querySelectorAll('button').forEach(b => b.classList.toggle('is-on', b === boton));
    await visor.updateComplete;
    visor.pause();
    visor.currentTime = 0;
  }
  const dur = visor.duration || 1;
  // OJO: currentTime = duración exacta "da la vuelta" a 0 (la animación se ve cerrada);
  // por eso el extremo "abierto" se deja apenas antes del final.
  const desde = visor.currentTime, hasta = animAbierta ? 0 : dur - 0.02;
  const t0 = performance.now(), ms = Math.max(300, Math.abs(hasta - desde) * 1000);
  const paso = (t) => {
    const k = Math.min(1, (t - t0) / ms);
    visor.currentTime = desde + (hasta - desde) * k;
    if (k < 1) animRaf = requestAnimationFrame(paso);
  };
  animRaf = requestAnimationFrame(paso);
  animAbierta = !animAbierta;
  boton.setAttribute('aria-pressed', String(animAbierta));
}

function construirAnimaciones() {
  if (!panelAnim) return;
  detenerAnimacion();
  listaAnim.innerHTML = '';
  const nombres = (visor.availableAnimations || []).filter(n => !OCULTAS_ANIM.test(n));
  panelAnim.hidden = nombres.length === 0;
  nombres.forEach(n => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'anim-btn';
    b.textContent = ETIQUETAS_ANIM[n] || n;
    b.addEventListener('click', () => alternarAnimacion(n, b));
    listaAnim.appendChild(b);
  });
}
visor.addEventListener('load', construirAnimaciones);

/* ------------------------------------------------------------
   SELECTOR DE VEHÍCULO (solo index.html)
   Cambia el modelo y los datos de la ficha según los data-* del botón.
------------------------------------------------------------ */
(function selectorVehiculo() {
  const botones = document.querySelectorAll('.veh');
  if (!botones.length) return;
  botones.forEach(b => b.addEventListener('click', () => {
    if (b.classList.contains('is-on')) return;
    botones.forEach(x => x.classList.toggle('is-on', x === b));

    detenerAnimacion();
    visor.animationName = undefined;
    visor.dataset.materialesColor = b.dataset.materiales;   // qué material se pinta en este modelo
    visor.setAttribute('ar-scale', b.dataset.escala || 'auto');
    visor.setAttribute('alt', `${b.dataset.titulo} en 3D. Arrastrá para rotarlo.`);
    visor.src = b.dataset.src;                              // dispara la carga; el evento 'load' reconfigura todo

    document.getElementById('veh-titulo').textContent = b.dataset.titulo;
    document.getElementById('sp-motor').textContent = b.dataset.motor;
    document.getElementById('sp-anio').textContent = b.dataset.anio;
    document.getElementById('sp-trans').textContent = b.dataset.trans;

    // El color vuelve a "Original" al cambiar de auto.
    swatches.forEach(x => {
      const orig = x.dataset.color === 'original';
      x.classList.toggle('is-active', orig);
      x.setAttribute('aria-checked', String(orig));
    });
    nombreColor.textContent = 'Original';
    panelAnim.hidden = true;
  }));
})();
