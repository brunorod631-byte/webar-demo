# Demo WebAR · Ficha de vehículo

Demo de Realidad Aumentada en el navegador con [`<model-viewer>`](https://modelviewer.dev) de Google.
HTML/CSS/JS plano, sin build ni frameworks. Pensada para automotoras, pero genérica: cambiando el `.glb` y los textos sirve para cualquier rubro.

```
index.html   ficha de producto + visor <model-viewer> (todo comentado)
style.css    estilos (variables de marca en :root)
script.js    cambio de color, aviso de RA, barra de carga
qr.html      generador de QR imprimible
models/      archivos .glb  (auto-demo.glb = placeholder Khronos ToyCar)
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

`script.js` tiñe el material de carrocería con la API de materiales (`setBaseColorFactor`). Con el ToyCar de ejemplo el color se **multiplica** con su textura (queda un tinte); con un auto de pintura sólida se ve el color exacto. Si el modelo trae **variantes** nativas (`KHR_materials_variants`), es más prolijo usar `visor.variantName = '...'`.

## QR para el local

Abrí `qr.html` (ya publicada, así toma la URL sola), revisá la URL y usá **Imprimir / guardar PDF**, o descargá el QR con clic derecho. También podés generarlo en cualquier generador (ej. qr-code-generator.com) apuntando a la URL pública.
