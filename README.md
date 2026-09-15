# A Birthday Adventure 🌷

Mini-juego narrativo de cumpleaños para celular: HTML, CSS y JavaScript, sin librerías.

**Inicio → Música → Jardín de tulipanes → Cinnamoroll Quest → Jurassic Surprise → Carta → Regalo**

## Personalizar

Todo se edita en el objeto `CONFIG`, al inicio de [`script.js`](script.js):

| Campo | Qué cambia |
|---|---|
| `name` / `from` | Su nombre y tu firma en la carta |
| `playlistUrl`, `songs` | El link de Spotify y la lista de canciones |
| `firstMemory` | Foto y texto del recuerdo que aparece en el jardín |
| `rolls` | Los 5 mensajes y fotos de Cinnamoroll |
| `cinnamoroll` | Qué stickers aparecen en el nivel 3 (están recortados en `cinammon/sprites/`) |
| `letter` | Los párrafos de la carta (`{name}` pone su nombre; si un párrafo empieza con `*`, sale más grande) |
| `gallery` | Las fotos de la galería que aparece después de la carta |
| `gift` | Lo que hay dentro de la caja de regalo (título, texto, detalle y una foto opcional) |

Las fotos van en la carpeta `fotos/`.

## Probar en tu compu

```bash
python -m http.server 5173
```

Luego abre http://localhost:5173 (si abres el `index.html` con doble clic, algunas cosas pueden no cargar bien).

## Publicar con GitHub Pages

1. Crea un repositorio en GitHub y sube todos los archivos (`index.html`, `styles.css`, `script.js`, `fotos/`).
2. En el repositorio, ve a **Settings → Pages**.
3. En **Source**, elige **Deploy from a branch**, luego la rama `main` y la carpeta `/ (root)`.
4. Espera un par de minutos. El link será `https://TU-USUARIO.github.io/NOMBRE-DEL-REPO/`.

> Si el repositorio es público, cualquiera que tenga el link podrá ver las fotos.

## Notas

- El progreso se guarda en `localStorage`: si cierra la página, puede continuar donde se quedó.
- La música del nivel 1 es "Happy Birthday" en versión 8-bit, generada en el navegador (es de dominio público). Las canciones de Olivia Rodrigo solo abren en Spotify.
- Los stickers de Cinnamoroll (Sanrio) son para un regalo personal; si el repo es público, tenlo en cuenta.
