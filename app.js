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
  logoPromise: null,
  loadingStartedAt: 0,
};

const elements = {
  fileInput: document.getElementById('excelFile'),
  uploadZone: document.getElementById('uploadZone'),
  previewBody: document.getElementById('previewBody'),
  toastStack: document.getElementById('toastStack'),
  srStatus: document.getElementById('srStatus'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  loadingTitle: document.getElementById('loadingTitle'),
  loadingMessage: document.getElementById('loadingMessage'),
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
  state.logoPromise = preloadLogo();
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
    if (window.EMBEDDED_LOGO_DATA_URL) {
      state.logoDataUrl = window.EMBEDDED_LOGO_DATA_URL;
      return state.logoDataUrl;
    }

    state.logoDataUrl = await loadImageAsDataUrl('assets/logo.png');
  } catch {
    state.logoDataUrl = null;
  }

  return state.logoDataUrl;
}

function loadImageAsDataUrl(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };

    image.onerror = () => reject(new Error('No se pudo cargar el logo.'));
    image.src = src;
  });
}

function handleFileSelection(event) {
  const [file] = event.target.files;
  if (file) {
    processExcelFile(file);
  }
}

function processExcelFile(file) {
  showLoading('Procesando archivo', 'Leyendo y validando la informacion del Excel...');
  const reader = new FileReader();

  reader.onload = async (event) => {
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
      await hideLoading();
      announce('Archivo cargado correctamente.', 'success', true, 'Archivo cargado');
    } catch (error) {
      console.error(error);
      resetLoadedData();
      await hideLoading();
      announce('Error al leer archivo. Verifica encabezados exactos y orden requerido.', 'error', true, 'Error de lectura');
    }
  };

  reader.onerror = async () => {
    resetLoadedData();
    await hideLoading();
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
        <td>${escapeHtml(row.CLIENTE)}</td>
        <td>${escapeHtml(row.CELULAR)}</td>
        <td>${escapeHtml(row.DIRECCION)}</td>
        <td>${escapeHtml(row.PRODUCTO)}</td>
        <td>${escapeHtml(row.PRECIO)}</td>
        <td>${escapeHtml(row.DISTRITO)}</td>
        <td>${escapeHtml(row['FECHA DE ENVIO'])}</td>
        <td>${escapeHtml(row.OBSERVACION)}</td>
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

function showLoading(title, message) {
  if (!elements.loadingOverlay) {
    return;
  }

  state.loadingStartedAt = performance.now();
  elements.loadingTitle.textContent = title;
  elements.loadingMessage.textContent = message;
  elements.loadingOverlay.hidden = false;
  elements.loadingOverlay.setAttribute('aria-hidden', 'false');
}

async function hideLoading() {
  if (!elements.loadingOverlay) {
    return;
  }

  const elapsed = performance.now() - state.loadingStartedAt;
  const minimumDuration = 3000;
  const remainingTime = Math.max(0, minimumDuration - elapsed);

  if (remainingTime > 0) {
    await wait(remainingTime);
  }

  elements.loadingOverlay.hidden = true;
  elements.loadingOverlay.setAttribute('aria-hidden', 'true');
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
  }, getToastDuration(type));
}

function getToastDuration(type) {
  if (type === 'success' || type === 'error') {
    return 5000;
  }

  return 4000;
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

async function generatePdfCards() {
  if (!state.rows.length) {
    announce('Carga un archivo antes de generar el PDF.', 'error', true, 'Accion bloqueada');
    return;
  }

  showLoading('Generando PDF', 'Organizando tarjetas y preparando el documento final...');
  await Promise.resolve(state.logoPromise || preloadLogo());
  await waitForNextFrame();

  try {
    const { jsPDF } = window.jspdf;
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
    await hideLoading();
    announce('PDF listo para descargar.', 'success', true, 'Documento generado');
  } catch (error) {
    console.error(error);
    state.generatedPdf = null;
    updateActionButton();
    await hideLoading();
    announce('No se pudo generar el PDF.', 'error', true, 'Error al generar');
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForNextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

function drawCard(pdf, row, x, y, width, height) {
  pdf.setDrawColor(173, 43, 39);
  pdf.setLineWidth(0.55);
  pdf.rect(x, y, width, height);

  pdf.setDrawColor(173, 43, 39);
  pdf.setLineWidth(1.1);
  pdf.line(x, y, x + width, y);

  if (state.logoDataUrl) {
    try {
      pdf.addImage(state.logoDataUrl, 'PNG', x + 6, y + 5, 20, 20);
    } catch (error) {
      console.warn('No se pudo insertar el logo en el PDF.', error);
    }
  }

  pdf.setTextColor(80, 27, 25);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10.2);
  const companyLines = pdf.splitTextToSize('Mercado Central Express', width - 36);
  pdf.text(companyLines, x + 30, y + 10);

  pdf.setDrawColor(228, 215, 210);
  pdf.setLineWidth(0.25);
  pdf.line(x + 5, y + 28, x + width - 5, y + 28);

  const contentX = x + 6;
  let cursorY = y + 35;

  const fields = [
    ['CLIENTE', row.CLIENTE],
    ['CELULAR', row.CELULAR],
    ['DIRECCION', row.DIRECCION],
    ['PRODUCTO', row.PRODUCTO],
    ['PRECIO', row.PRECIO],
    ['DISTRITO', row.DISTRITO],
    ['FECHA DE ENVIO', row['FECHA DE ENVIO']],
    ['OBSERVACION', row.OBSERVACION],
  ];

  fields.forEach(([label, value], index) => {
    cursorY = writeField(pdf, label, value || '-', contentX, cursorY, width - 12);

    if (index < fields.length - 1) {
      pdf.setDrawColor(242, 236, 233);
      pdf.setLineWidth(0.2);
      pdf.line(contentX, cursorY - 1.5, x + width - 6, cursorY - 1.5);
    }
  });
}

function writeField(pdf, label, value, x, y, maxWidth) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.1);
  pdf.setTextColor(118, 52, 48);
  pdf.text(label, x, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.8);
  pdf.setTextColor(42, 42, 42);

  const textLines = pdf.splitTextToSize(value, maxWidth);
  const valueY = y + 4.2;
  pdf.text(textLines, x, valueY);

  return valueY + (textLines.length * 3.9) + 2.6;
}

function downloadGeneratedPdf() {
  if (!state.generatedPdf) {
    announce('Primero genera el PDF antes de descargarlo.', 'error', true, 'Accion bloqueada');
    return;
  }

  state.generatedPdf.save('tarjetas-mercado-central-express.pdf');
  announce('La descarga del PDF ha comenzado.', 'success', true, 'Descarga iniciada');
}




