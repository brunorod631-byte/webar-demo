# WebAR · Productos en realidad aumentada desde el navegador

**[Ver demo en vivo](https://brunorod631-byte.github.io/webar-demo)** · funciona en el celular, sin instalar ninguna app.

Fichas de producto en realidad aumentada: el cliente escanea un QR o abre un enlace y ve el producto (un auto, un plato) a escala real en su propio espacio.

## Problema

Mostrar un producto físico en una web se limita a fotos. Las soluciones de RA suelen exigir descargar una app, lo que frena a la mayoría de los usuarios.

## Solución

Páginas web estáticas que usan la RA nativa del teléfono (WebXR / Scene Viewer en Android, AR Quick Look en iPhone). Sin build ni backend: se publican en cualquier hosting estático con HTTPS.

Pensada para automotoras, pero genérica: cambiando el `.glb` y los textos sirve para cualquier rubro.

## Qué incluye

| Página | Qué hace | Estado |
|---|---|---|
| `index.html` | Ficha de vehículo: selector de autos, cambio de color de carrocería, panel de animaciones (si el modelo las trae) y RA a escala real | Demo funcional |
| `menu.html` | Ficha de plato para restaurante en RA | Demo funcional |
| `qr.html` | Generador de QR imprimible para el local | Demo funcional |
| `xr.html` | Personaje interactivo en RA y VR con three.js + WebXR | Experimental |
| `pie.html` | Zapatilla sobre el pie con la cámara (MediaPipe Pose + three.js) | Experimental |
| `pruebas.html` | Laboratorio: zapatilla en RA de superficie | Experimental |

## Stack

HTML, CSS y JavaScript sin frameworks · [`<model-viewer>`](https://modelviewer.dev) · three.js · WebXR · MediaPipe Pose · modelos glTF comprimidos con Draco (`gltf-transform`) · GitHub Pages

## Desafíos técnicos

- **Compatibilidad entre dispositivos:** Android usa WebXR / Scene Viewer y iPhone AR Quick Look; la página detecta si hay soporte y, si no, muestra un aviso en lugar del botón.
- **Peso de los modelos:** compresión Draco y texturas a 1024 px para que carguen en redes móviles.
- **Escala real:** los modelos se ajustan a metros para que el auto aparezca a tamaño real (`ar-scale="fixed"`).
- **Color del vehículo:** se modifica el material de la carrocería con la API de materiales, conservando materiales separados al optimizar (`--palette false`).

---

## Documentación técnica

```text
index.html   demo Autos: ficha de vehículo + visor <model-viewer> (todo comentado)
pruebas.html laboratorio: zapatilla en RA de superficie
xr.html      personaje animado interactivo en RA y VR con three.js + WebXR (experimental)
pie.html     prototipo experimental: zapatilla sobre el pie con la cámara (MediaPipe + three.js)
menu.html    demo Restaurante: ficha de plato (pizza), misma base sin selector de color
style.css    estilos (variables de marca en :root)
script.js    cambio de color, aviso de RA, barra de carga
qr.html      generador de QR imprimible
models/      archivos .glb  (porsche-911.glb = modelo de demostración)
assets/      logo y poster placeholder
```

## Correr en local

```bash
npx http-server -p 8080        # o: npx live-server
```

Abrí `http://localhost:8080`. En la PC vas a ver el visor 3D, pero **no el botón de RA**.

### Probar RA en el celular (requiere HTTPS)

La RA no funciona por `http://` (excepto `localhost`), así que para probar desde el celu necesitás un túnel HTTPS:

```bash
npx http-server -p 8080          # terminal 1
ngrok http 8080                   # terminal 2 → te da https://xxxx.ngrok-free.app
# alternativa sin cuenta:
npx cloudflared tunnel --url http://localhost:8080
```

Abrí esa URL `https://...` en el celular. Para dejarlo fijo, subilo a un hosting estático con HTTPS (Netlify, Cloudflare Pages, GitHub Pages, Vercel): alcanza con arrastrar la carpeta.

## Reemplazar el modelo por uno real

1. Copiá tu archivo a `models/` (ej. `models/hilux-2025.glb`).
2. En `index.html`, atributo `src` de `<model-viewer>` (marcado con ★): `src="models/hilux-2025.glb"`.
3. En `script.js`, `MATERIALES_CARROCERIA`: poné el nombre del material de la carrocería. Para verlos, con la página abierta, en la consola del navegador:
   `document.getElementById('visor').model.materials.map(m => m.name)`
4. Textos/precio/specs: en `index.html`, sección `.info`.

Recomendaciones para el `.glb`: formato **glTF binario (.glb)**, idealmente **< 15 MB** (carga rápida en 4G), origen en la base del auto, y **escala real en metros** (un auto mide ~4,5 m) para que en RA salga a tamaño real; en ese caso usá `ar-scale="fixed"`. Se puede comprimir con `gltf-transform optimize`.

## Soporte de RA

| Dispositivo / navegador | Modo | Notas |
|---|---|---|
| Android + Chrome | `webxr` → `scene-viewer` | Requiere Google Play Services for AR (ARCore). Es lo más fluido. |
| iPhone/iPad + Safari | `quick-look` | Usa AR Quick Look nativo; model-viewer genera el USDZ automáticamente. Abrir desde Safari (los navegadores dentro de otras apps pueden fallar). |
| PC de escritorio | — | Solo visor 3D (rotar/zoom). El botón de RA no aparece. |

Detalle: si el celular no es compatible, el botón no se muestra y aparece un aviso.

## Color del vehículo

`script.js` tiñe el material de carrocería con la API de materiales (`setBaseColorFactor`). Si el material trae textura de color, el color se **multiplica** con su textura (queda un tinte); con un auto de pintura sólida se ve el color exacto. Si el modelo trae **variantes** nativas (`KHR_materials_variants`), es más prolijo usar `visor.variantName = '...'`.

## QR para el local

Abrí `qr.html` (ya publicada, así toma la URL sola), revisá la URL y usá **Imprimir / guardar PDF**, o descargá el QR con clic derecho. También podés generarlo en cualquier generador (ej. qr-code-generator.com) apuntando a la URL pública.

## Créditos

Modelo `models/porsche-911.glb`: basado en "(FREE) Porsche 911 Carrera 4S" (https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf) de Karol Miklas (https://sketchfab.com/karolmiklas), licencia [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/). Se convirtió a .glb y se comprimió (Draco, texturas a 1024 px). La licencia exige atribución y que las versiones modificadas conserven la misma licencia; es solo un modelo de demostración. Para clientes reales usá el modelo propio del cliente.

Modelo `models/pizza-bigboss.glb`: basado en "Pizza "BigBoss" Pancho" (https://sketchfab.com/3d-models/pizza-bigboss-pancho-29832125251a44939fae1a21a3288f88) de ponomarovmax (https://sketchfab.com/ponomarovmax), licencia [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/). Convertido a .glb, comprimido (Draco, texturas 1024 px) y escalado a ~35 cm con `scale`.

## Agregar otra demo (otro rubro)

Copiá `menu.html` como base, cambiá `src`, los textos y (si aplica) `data-materiales-color`, y sumá el link en el `<nav class="demos">` de las páginas. Si el modelo trae un tamaño irreal, corregilo con el atributo `scale` (ver comentario en `menu.html`).

## Prueba: zapatilla sobre el pie (experimental)

`pie.html` usa la cámara del celular, detecta talón y punta de cada pie con MediaPipe Pose (33 puntos del cuerpo) y dibuja la zapatilla con three.js. Corre 100 % en el navegador. Limitaciones conocidas: la zapatilla puede temblar, no la tapa la pierna, y el cuerpo entero tiene que verse (≈2 m). Tiene un "Modo demo" con puntos simulados para calibrar sin cámara. El modelo `models/zapatilla-escolar.glb` se recortó para quitar la base de terreno del escaneo (autoría y licencia: pendiente de confirmar).


### Animaciones y varios autos en la ficha

- Si el `.glb` trae animaciones, aparece un panel "Abrir / cerrar" con un botón por animación (etiquetas en español en `ETIQUETAS_ANIM`, `script.js`). model-viewer aplica una animación a la vez.
- Para sumar un auto a `index.html`, agregá un botón `.veh` con `data-src`, `data-materiales` (material de pintura), `data-titulo`, `data-motor`, `data-anio`, `data-trans` y `data-escala` (`fixed` = tamaño real si el modelo está en metros, `auto` = el usuario puede escalar).
- Al optimizar modelos con `gltf-transform optimize`, usar `--palette false` si se quiere cambiar el color de un material de color sólido.

Modelo `models/gorila-lowpoly.glb`: "Low poly Gorilla animal 3d model free" (https://sketchfab.com/3d-models/low-poly-gorilla-animal-3d-model-free-20bbf9e673814a76ba207b8494f17939) de iRahulRajput (https://sketchfab.com/rt699448), licencia [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/). Convertido, comprimido (Draco, 305 KB); mide ~1 m de alto, sin animaciones.

`pruebas.html` usa el mismo selector `.veh` que `index.html` (botones con `data-src`, `data-titulo`, `data-scale`, etc.). Un elemento con `data-solo="zapatilla"` solo se muestra cuando el botón activo tiene `data-tipo="zapatilla"`.

## Prueba: personaje interactivo en RA y VR (`xr.html`)

three.js + WebXR, sin build. Un mismo personaje (`models/robot-expresivo.glb`, "RobotExpressive", CC0, incluido en los ejemplos de three.js; 14 animaciones) con dos botones: **Entrar en RA** (Android/Chrome con ARCore, o modo con cámara del Meta Quest 3) y **Entrar en VR** (visores). Una sesión WebXR es RA **o** VR, nunca las dos a la vez; por eso es la misma escena con dos modos. Interacción: tocar/apuntar al personaje → reacciona; tocar el piso → camina hasta ahí; siempre gira a mirar al usuario. En RA usa hit-test (aro verde) para apoyarlo en el piso y una capa DOM con botones sobre la cámara. Sin RA/VR (PC, iPhone/Safari) funciona como vista previa 3D con las mismas interacciones. iPhone no soporta WebXR: no hay RA en esta página.
