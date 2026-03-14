# Mercado Central Express Cards

Herramienta web para convertir un archivo Excel de pedidos en un PDF con tarjetas de envio imprimibles.

## Que hace

- Lee el Excel directamente en el navegador
- Valida el orden exacto de columnas
- Muestra una vista previa de los pedidos cargados
- Genera un PDF A4 con 4 tarjetas por pagina
- Permite descargar el PDF sin usar backend ni base de datos

## Formato obligatorio del Excel

El archivo debe tener exactamente estos encabezados y en este orden:

1. CLIENTE
2. CELULAR
3. DIRECCION
4. PRODUCTO
5. PRECIO
6. DISTRITO
7. FECHA DE ENVIO
8. OBSERVACION

## Como usarlo

1. Abre `index.html` en el navegador o publica la carpeta en GitHub Pages.
2. Sube tu archivo Excel desde el panel izquierdo.
3. Revisa la vista previa de pedidos.
4. Pulsa `Generar PDF`.
5. Cuando termine, pulsa `Descargar PDF`.

## Tecnologias

- HTML
- CSS
- JavaScript
- SheetJS por CDN para leer Excel
- jsPDF por CDN para generar PDF

## Despliegue gratis en GitHub Pages

Este proyecto ya no depende de Astro ni de GitHub Actions, asi que puedes publicarlo gratis desde la rama principal.

### Paso a paso

1. Sube estos archivos al repositorio:
   - `index.html`
   - `style.css`
   - `app.js`
   - `assets/logo.png`
2. En GitHub entra a tu repositorio.
3. Ve a `Settings`.
4. Entra a `Pages`.
5. En `Source`, elige `Deploy from a branch`.
6. En `Branch`, elige `main`.
7. En `Folder`, elige `/ (root)`.
8. Guarda los cambios.
9. Espera 1 o 2 minutos.
10. Abre tu sitio en:

`https://elverantony.github.io/MCE/`

## Privacidad

- Todo el procesamiento ocurre localmente en el navegador
- No se envian datos a servidores
- No requiere login
- No guarda informacion del usuario
