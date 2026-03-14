import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const REQUIRED_COLUMNS = [
  'CLIENTE',
  'CELULAR',
  'DIRECCION',
  'PRODUCTO',
  'PRECIO',
  'DISTRITO',
  'FECHA DE ENVIO',
  'OBSERVACION',
];

const state = {
  rows: [],
  workbookSheets: 0,
  generatedPdf: null,
  logoDataUrl: null,
};

const elements = {
  fileInput: document.getElementById('excelFile'),
  uploadZone: document.getElementById('uploadZone'),
  previewBody: document.getElementById('previewBody'),
  toastStack: document.getElementById('toastStack'),
  srStatus: document.getElementById('srStatus'),
  actionBtn: document.getElementById('actionBtn'),
  orderCount: document.getElementById('orderCount'),
  sheetCount: document.getElementById('sheetCount'),
};

initializeApp();

function initializeApp() {
  if (!elements.fileInput) {
    return;
  }

  attachEventListeners();
  preloadLogo();
  updateActionButton();
  announce('Esperando archivo Excel.', 'info', false);
}

function attachEventListeners() {
  elements.fileInput.addEventListener('change', handleFileSelection);
  elements.actionBtn.addEventListener('click', handlePrimaryAction);

  ['dragenter', 'dragover'].forEach((eventName) => {
    elements.uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.uploadZone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    elements.uploadZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      elements.uploadZone.classList.remove('is-dragover');
    });
  });

  elements.uploadZone.addEventListener('drop', (event) => {
    const [file] = event.dataTransfer.files;
    if (file) {
      elements.fileInput.files = event.dataTransfer.files;
      processExcelFile(file);
    }
  });
}

function handlePrimaryAction() {
  if (state.generatedPdf) {
    downloadGeneratedPdf();
    return;
  }

  generatePdfCards();
}

async function preloadLogo() {
  try {
    const logoPath = `${import.meta.env.BASE_URL}assets/logo.png`;
    const response = await fetch(logoPath);
    const blob = await response.blob();
    state.logoDataUrl = await blobToDataUrl(blob);
  } catch {
    state.logoDataUrl = null;
  }
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('No se pudo convertir el logo.'));
    reader.readAsDataURL(blob);
  });
}

function handleFileSelection(event) {
  const [file] = event.target.files;
  if (file) {
    processExcelFile(file);
  }
}

function processExcelFile(file) {
  announce('Leyendo archivo Excel...', 'info', true, 'Procesando archivo');
  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const workbook = XLSX.read(event.target.result, { type: 'array', cellDates: true });
      const rows = extractWorkbookRows(workbook);

      if (!rows.length) {
        throw new Error('No se encontraron filas validas en el archivo.');
      }

      state.rows = rows;
      state.workbookSheets = workbook.SheetNames.length;
      state.generatedPdf = null;

      updateSummary();
      renderPreview(rows);
      updateActionButton();
      announce('Archivo cargado correctamente.', 'success', true, 'Archivo cargado');
    } catch (error) {
      console.error(error);
      resetLoadedData();
      announce('Error al leer archivo. Verifica encabezados exactos y orden requerido.', 'error', true, 'Error de lectura');
    }
  };

  reader.onerror = () => {
    resetLoadedData();
    announce('Error al leer archivo.', 'error', true, 'Error de lectura');
  };

  reader.readAsArrayBuffer(file);
}

function extractWorkbookRows(workbook) {
  const extractedRows = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const jsonRows = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: false,
      dateNF: 'dd/mm/yyyy',
      blankrows: false,
    });

    validateHeaders(jsonRows);

    jsonRows.forEach((row) => {
      if (isEmptyRow(row)) {
        return;
      }

      extractedRows.push(normalizeRow(row));
    });
  });

  return extractedRows;
}

function validateHeaders(rows) {
  if (!rows.length) {
    throw new Error('La hoja no contiene filas de datos.');
  }

  const headers = Object.keys(rows[0]);
  const exactMatch =
    headers.length === REQUIRED_COLUMNS.length &&
    REQUIRED_COLUMNS.every((column, index) => headers[index] === column);

  if (!exactMatch) {
    throw new Error('Los encabezados del Excel no coinciden con el formato requerido.');
  }
}

function isEmptyRow(row) {
  return Object.values(row).every((value) => String(value).trim() === '');
}

function normalizeRow(row) {
  return REQUIRED_COLUMNS.reduce((accumulator, key) => {
    accumulator[key] = sanitizeValue(row[key]);
    return accumulator;
  }, {});
}

function sanitizeValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function renderPreview(rows) {
  if (!rows.length) {
    elements.previewBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="${REQUIRED_COLUMNS.length}">Aun no se han cargado pedidos.</td>
      </tr>
    `;
    return;
  }

  const previewRows = rows.slice(0, 12);
  const markup = previewRows
    .map((row) => `
      <tr>
        <td>${escapeHtml(row['CLIENTE'])}</td>
        <td>${escapeHtml(row['CELULAR'])}</td>
        <td>${escapeHtml(row['DIRECCION'])}</td>
        <td>${escapeHtml(row['PRODUCTO'])}</td>
        <td>${escapeHtml(row['PRECIO'])}</td>
        <td>${escapeHtml(row['DISTRITO'])}</td>
        <td>${escapeHtml(row['FECHA DE ENVIO'])}</td>
        <td>${escapeHtml(row['OBSERVACION'])}</td>
      </tr>
    `)
    .join('');

  elements.previewBody.innerHTML = markup;
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value || '-';
  return div.innerHTML;
}

function updateSummary() {
  elements.orderCount.textContent = String(state.rows.length);
  elements.sheetCount.textContent = String(state.workbookSheets);
}

function updateActionButton() {
  if (!elements.actionBtn) {
    return;
  }

  if (state.generatedPdf) {
    elements.actionBtn.disabled = false;
    elements.actionBtn.textContent = 'Descargar PDF';
    elements.actionBtn.classList.remove('btn-primary');
    elements.actionBtn.classList.add('btn-secondary');
    return;
  }

  elements.actionBtn.textContent = 'Generar PDF';
  elements.actionBtn.classList.remove('btn-secondary');
  elements.actionBtn.classList.add('btn-primary');
  elements.actionBtn.disabled = state.rows.length === 0;
}

function resetLoadedData() {
  state.rows = [];
  state.workbookSheets = 0;
  state.generatedPdf = null;
  updateSummary();
  renderPreview([]);
  updateActionButton();
}

function announce(message, type = 'info', shouldToast = true, title) {
  if (elements.srStatus) {
    elements.srStatus.textContent = message;
  }

  if (shouldToast) {
    showToast(title || getToastTitle(type), message, type);
  }
}

function getToastTitle(type) {
  if (type === 'success') {
    return 'Operacion completada';
  }

  if (type === 'error') {
    return 'Ocurrio un problema';
  }

  return 'Informacion';
}

function showToast(title, message, type = 'info') {
  if (!elements.toastStack) {
    return;
  }

  const toast = document.createElement('article');
  toast.className = `toast is-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${getToastIcon(type)}</div>
    <div class="toast-body">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(message)}</p>
    </div>
  `;

  elements.toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    toast.style.transition = 'opacity 180ms ease, transform 180ms ease';

    window.setTimeout(() => {
      toast.remove();
    }, 180);
  }, getToastDuration(type, title));
}

function getToastDuration(type, title = '') {
  const normalizedTitle = String(title).toLowerCase();

  if (type === 'success') {
    return 10000;
  }

  if (normalizedTitle.includes('procesando') || normalizedTitle.includes('preparando')) {
    return 7000;
  }

  if (type === 'error') {
    return 10000;
  }

  return 7000;
}

function getToastIcon(type) {
  if (type === 'success') {
    return 'OK';
  }

  if (type === 'error') {
    return '!';
  }

  return 'i';
}

function generatePdfCards() {
  if (!state.rows.length) {
    announce('Carga un archivo antes de generar el PDF.', 'error', true, 'Accion bloqueada');
    return;
  }

  announce('Generando PDF...', 'info', true, 'Preparando documento');

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const columns = 2;
    const rowsPerPage = 2;
    const horizontalGap = 8;
    const verticalGap = 8;
    const marginX = 12;
    const marginY = 12;
    const cardWidth = (pageWidth - (marginX * 2) - (horizontalGap * (columns - 1))) / columns;
    const cardHeight = (pageHeight - (marginY * 2) - (verticalGap * (rowsPerPage - 1))) / rowsPerPage;

    state.rows.forEach((row, index) => {
      if (index > 0 && index % (columns * rowsPerPage) === 0) {
        pdf.addPage();
      }

      const cardIndex = index % (columns * rowsPerPage);
      const col = cardIndex % columns;
      const rowIndex = Math.floor(cardIndex / columns);
      const x = marginX + col * (cardWidth + horizontalGap);
      const y = marginY + rowIndex * (cardHeight + verticalGap);

      drawCard(pdf, row, x, y, cardWidth, cardHeight);
    });

    state.generatedPdf = pdf;
    updateActionButton();
    announce('PDF listo para descargar.', 'success', true, 'Documento generado');
  } catch (error) {
    console.error(error);
    state.generatedPdf = null;
    updateActionButton();
    announce('No se pudo generar el PDF.', 'error', true, 'Error al generar');
  }
}

function drawCard(pdf, row, x, y, width, height) {
  pdf.setDrawColor(173, 43, 39);
  pdf.setLineWidth(0.5);
  pdf.rect(x, y, width, height);

  pdf.setFillColor(253, 244, 243);
  pdf.rect(x + 2, y + 2, width - 4, 20, 'F');

  if (state.logoDataUrl) {
    try {
      pdf.addImage(state.logoDataUrl, 'PNG', x + 5, y + 4.5, 18, 18);
    } catch (error) {
      console.warn('No se pudo insertar el logo en el PDF.', error);
    }
  }

  pdf.setTextColor(80, 27, 25);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.2);
  const companyLines = pdf.splitTextToSize('Mercado Central Express', width - 31);
  pdf.text(companyLines, x + 26, y + 8.5);

  const contentX = x + 5;
  let cursorY = y + 26;

  const fields = [
    ['Cliente', row['CLIENTE']],
    ['Celular', row['CELULAR']],
    ['Direccion', row['DIRECCION']],
    ['Producto', row['PRODUCTO']],
    ['Precio', row['PRECIO']],
    ['Distrito', row['DISTRITO']],
    ['Fecha de envio', row['FECHA DE ENVIO']],
    ['Observacion', row['OBSERVACION']],
  ];

  fields.forEach(([label, value]) => {
    cursorY = writeField(pdf, label, value || '-', contentX, cursorY, width - 8);
  });

  pdf.setDrawColor(220, 220, 220);
  pdf.setLineDashPattern([1, 1], 0);
  pdf.line(x + 3, y + height - 8, x + width - 3, y + height - 8);
  pdf.setLineDashPattern([], 0);
}

function writeField(pdf, label, value, x, y, maxWidth) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(51, 51, 51);
  pdf.text(`${label}:`, x, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(65, 65, 65);

  const labelWidth = pdf.getTextWidth(`${label}: `);
  const firstLineWidth = Math.max(12, maxWidth - labelWidth - 1);
  const textLines = pdf.splitTextToSize(value, firstLineWidth);
  const firstLineX = x + labelWidth + 0.8;

  if (textLines.length > 0) {
    pdf.text(textLines[0], firstLineX, y);
  }

  if (textLines.length > 1) {
    pdf.text(textLines.slice(1), x, y + 4);
  }

  return y + 4 + Math.max(0, textLines.length - 1) * 3.5 + 4;
}

function downloadGeneratedPdf() {
  if (!state.generatedPdf) {
    announce('Primero genera el PDF antes de descargarlo.', 'error', true, 'Accion bloqueada');
    return;
  }

  state.generatedPdf.save('tarjetas-mercado-central-express.pdf');
  announce('La descarga del PDF ha comenzado.', 'success', true, 'Descarga iniciada');
}





