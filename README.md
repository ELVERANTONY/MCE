# Mercado Central Express - Generador de Tarjetas de Envio

Aplicacion web construida con Astro para convertir pedidos de Excel en tarjetas de envio PDF listas para imprimir, recortar y pegar en paquetes. Todo el procesamiento ocurre en el navegador usando `xlsx` y `jspdf`, sin backend ni base de datos.

## Stack

- Astro
- JavaScript
- SheetJS (`xlsx`)
- jsPDF
- GitHub Pages para despliegue estatico

## Estructura

```text
mercado-central-express-cards/
|-- .github/workflows/deploy.yml
|-- public/assets/logo.png
|-- src/
|   |-- components/CardGeneratorApp.astro
|   |-- layouts/BaseLayout.astro
|   |-- pages/index.astro
|   |-- scripts/card-generator.js
|   `-- styles/global.css
|-- astro.config.mjs
|-- package.json
|-- tsconfig.json
`-- README.md
```

## Formato obligatorio del Excel

El archivo debe incluir exactamente estos encabezados y en este orden:

1. `CLIENTE`
2. `CELULAR`
3. `DIRECCION`
4. `PRODUCTO`
5. `PRECIO`
6. `DISTRITO`
7. `FECHA DE ENVIO`
8. `OBSERVACION`

Cada fila del Excel se convierte en una tarjeta dentro del PDF.

No cambies los nombres ni el orden de los encabezados. El sistema valida ese formato exacto para asegurar un procesamiento estable y sin errores.

## Desarrollo local

1. Entra a la carpeta del proyecto.
2. Instala dependencias con `npm install`.
3. Inicia el entorno local con `npm run dev`.
4. Abre la URL que muestre Astro en el navegador.

## Uso

1. Sube el archivo Excel desde la interfaz.
2. Revisa la vista previa de pedidos.
3. Haz clic en `Generar Tarjetas PDF`.
4. Descarga el PDF generado.

## Reemplazar el logo

Sustituye el archivo [logo.png](/c:/MCM/mercado-central-express-cards/public/assets/logo.png) por el logo oficial de la empresa manteniendo el mismo nombre y ruta:

`public/assets/logo.png`

## Despliegue en GitHub Pages

### Opcion 1: con GitHub Actions recomendado

1. Crea un repositorio en GitHub.
2. Sube el contenido completo del proyecto.
3. Asegurate de que la rama principal sea `main`.
4. En GitHub entra a `Settings > Pages`.
5. En `Source`, selecciona `GitHub Actions`.
6. Haz push a `main` y el workflow `.github/workflows/deploy.yml` publicara el sitio automaticamente.

### Opcion 2: build manual

1. Ejecuta `npm install`.
2. Ejecuta el build con base para GitHub Pages:
   `set BASE_PATH=/NOMBRE-DEL-REPO/ && npm run build`
3. Publica el contenido de `dist/` en GitHub Pages.

## Notas importantes

- La app no guarda informacion ni envia datos a servidores.
- El PDF se genera en formato A4 con 6 tarjetas por pagina.
- Si luego quieres uso offline total incluso sin instalar desde internet, podemos vendorizar las dependencias dentro del repositorio.

## Verificacion

La migracion de archivos quedo lista, pero no pude ejecutar `npm install` ni `npm run build` en este entorno porque `npm` y `node` no estan disponibles aqui.
