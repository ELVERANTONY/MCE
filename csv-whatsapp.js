const csvState = {
  contacts: [],
  skippedRows: 0,
  hasProcessedList: false,
  hasGeneratedCsv: false,
  csvBlobUrl: '',
  csvFileName: '',
};

const csvElements = {
  input: document.getElementById('csvPasteInput'),
  processBtn: document.getElementById('csvProcessBtn'),
  downloadBtn: document.getElementById('csvDownloadBtn'),
  previewBody: document.getElementById('csvPreviewBody'),
  contactCount: document.getElementById('csvContactCount'),
  skippedCount: document.getElementById('csvSkippedCount'),
  toastStack: document.getElementById('csvToastStack'),
  srStatus: document.getElementById('csvSrStatus'),
};

initializeCsvModule();

function initializeCsvModule() {
  if (!csvElements.input) {
    return;
  }

  csvElements.processBtn.addEventListener('click', handlePrimaryCsvAction);
  csvElements.downloadBtn.addEventListener('click', handleSecondaryCsvAction);
  csvElements.input.addEventListener('input', handleCsvInputChange);

  resetCsvResults();
  syncCsvActionButtons();
  announceCsv('Listo para procesar texto pegado desde Excel.', 'info', false);
}

function handlePrimaryCsvAction() {
  if (!csvState.hasProcessedList) {
    processCsvList();
    return;
  }

  if (!csvState.hasGeneratedCsv) {
    generateCsvFile();
    return;
  }

  downloadCsvFile();
}

function handleSecondaryCsvAction() {
  if (!csvState.hasGeneratedCsv) {
    return;
  }

  resetCsvModule(true);
  announceCsv('La lista anterior se limpio para pegar una nueva.', 'success', true, 'Lista limpiada');
}

function handleCsvInputChange() {
  const hasText = Boolean(csvElements.input.value.trim());

  if (!hasText) {
    resetCsvResults();
    syncCsvActionButtons();
    return;
  }

  if (csvState.hasProcessedList || csvState.hasGeneratedCsv) {
    resetCsvResults();
  }

  syncCsvActionButtons();
}

function processCsvList() {
  const rawText = csvElements.input.value || '';

  if (!rawText.trim()) {
    resetCsvResults();
    syncCsvActionButtons();
    announceCsv('Pega texto antes de procesar la lista.', 'error', true, 'Entrada vacia');
    return;
  }

  const processed = parseClipboardText(rawText);

  if (!processed.contacts.length) {
    resetCsvResults();
    syncCsvActionButtons();
    announceCsv('No se detectaron telefonos validos para exportar.', 'error', true, 'Sin contactos validos');
    return;
  }

  releaseCsvBlobUrl();
  csvState.contacts = processed.contacts;
  csvState.skippedRows = processed.skippedRows;
  csvState.hasProcessedList = true;
  csvState.hasGeneratedCsv = false;
  csvState.csvFileName = '';

  renderCsvPreview(processed.contacts);
  updateCsvSummary();
  syncCsvActionButtons();
  announceCsv(`Se prepararon ${processed.contacts.length} contactos para WhatsApp.`, 'success', true, 'Lista procesada');
}

function generateCsvFile() {
  if (!csvState.contacts.length) {
    announceCsv('Procesa una lista valida antes de generar el CSV.', 'error', true, 'Generacion bloqueada');
    return;
  }

  releaseCsvBlobUrl();

  const rows = [
    ['name', 'Phone number'],
    ...csvState.contacts.map((contact) => [contact.name, contact.phone]),
  ];

  const csvContent = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const stamp = getDateStamp();

  csvState.csvBlobUrl = URL.createObjectURL(blob);
  csvState.csvFileName = `Lista de difusión para Whatsapp - ${stamp}.csv`;
  csvState.hasGeneratedCsv = true;

  syncCsvActionButtons();
  announceCsv('El archivo CSV ya esta listo para descargar.', 'success', true, 'CSV generado');
}

function downloadCsvFile() {
  if (!csvState.hasGeneratedCsv || !csvState.csvBlobUrl) {
    announceCsv('Genera el CSV antes de intentar descargarlo.', 'error', true, 'Descarga bloqueada');
    return;
  }

  const link = document.createElement('a');
  link.href = csvState.csvBlobUrl;
  link.download = csvState.csvFileName || `Lista de difusión para Whatsapp - ${getDateStamp()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  announceCsv('La descarga del CSV ha comenzado.', 'success', true, 'Descarga iniciada');
}

function syncCsvActionButtons() {
  if (!csvElements.processBtn || !csvElements.downloadBtn) {
    return;
  }

  const hasInput = Boolean(csvElements.input && csvElements.input.value.trim());

  if (csvState.hasGeneratedCsv) {
    csvElements.processBtn.textContent = 'Descargar CSV';
    csvElements.processBtn.disabled = false;
    csvElements.downloadBtn.hidden = false;
    csvElements.downloadBtn.textContent = 'Limpiar lista';
    csvElements.downloadBtn.disabled = false;
    return;
  }

  if (csvState.hasProcessedList) {
    csvElements.processBtn.textContent = 'Generar CSV';
    csvElements.processBtn.disabled = false;
    csvElements.downloadBtn.hidden = true;
    csvElements.downloadBtn.textContent = 'Limpiar lista';
    csvElements.downloadBtn.disabled = true;
    return;
  }

  csvElements.processBtn.textContent = 'Procesar lista';
  csvElements.processBtn.disabled = !hasInput;
  csvElements.downloadBtn.hidden = true;
  csvElements.downloadBtn.textContent = 'Limpiar lista';
  csvElements.downloadBtn.disabled = true;
}

function resetCsvResults() {
  releaseCsvBlobUrl();
  csvState.contacts = [];
  csvState.skippedRows = 0;
  csvState.hasProcessedList = false;
  csvState.hasGeneratedCsv = false;
  csvState.csvFileName = '';
  renderCsvPreview([]);
  updateCsvSummary();
}

function resetCsvModule(shouldClearInput = false) {
  resetCsvResults();

  if (shouldClearInput) {
    csvElements.input.value = '';
  }

  syncCsvActionButtons();
}

function releaseCsvBlobUrl() {
  if (!csvState.csvBlobUrl) {
    return;
  }

  URL.revokeObjectURL(csvState.csvBlobUrl);
  csvState.csvBlobUrl = '';
}

function parseClipboardText(rawText) {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { contacts: [], skippedRows: 0 };
  }

  const rows = lines.map((line) => parseLineColumns(line));
  const hasHeader = detectHeaderRow(rows[0]);
  const dataRows = hasHeader ? rows.slice(1) : rows;

  const contacts = [];
  let skippedRows = 0;
  let generatedNameIndex = 1;

  dataRows.forEach((columns) => {
    const normalized = normalizeContactRow(columns);

    if (!normalized.phone) {
      skippedRows += 1;
      return;
    }

    const contactName = normalized.name || `Cliente ${generatedNameIndex}`;
    if (!normalized.name) {
      generatedNameIndex += 1;
    }

    contacts.push({
      name: contactName,
      phone: normalized.phone,
    });
  });

  return { contacts, skippedRows };
}

function parseLineColumns(line) {
  if (line.includes('\t')) {
    return line.split('\t').map((part) => part.trim()).filter((part) => part !== '');
  }

  if (line.includes(';')) {
    return line.split(';').map((part) => part.trim());
  }

  if (line.includes(',')) {
    return line.split(',').map((part) => part.trim());
  }

  return [line.trim()];
}

function detectHeaderRow(columns) {
  const normalized = columns.map((value) => value.toLowerCase().trim());
  return normalized.some((value) => value === 'name' || value === 'phone number' || value === 'phone');
}

function normalizeContactRow(columns) {
  if (!columns.length) {
    return { name: '', phone: '' };
  }

  let name = '';
  let phone = '';

  if (columns.length >= 2) {
    const first = columns[0] || '';
    const second = columns[1] || '';
    const firstPhone = normalizePeruPhone(first);
    const secondPhone = normalizePeruPhone(second);

    if (firstPhone && !secondPhone) {
      phone = firstPhone;
      name = second;
    } else if (!firstPhone && secondPhone) {
      name = first;
      phone = secondPhone;
    } else if (firstPhone && secondPhone) {
      phone = firstPhone;
      name = second;
    } else {
      name = first;
    }
  } else {
    const only = columns[0] || '';
    const phoneValue = normalizePeruPhone(only);

    if (phoneValue) {
      phone = phoneValue;
    } else {
      name = only;
    }
  }

  return {
    name: cleanName(name),
    phone,
  };
}

function normalizePeruPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  let normalized = digits;

  if (normalized.startsWith('51') && normalized.length >= 11) {
    normalized = normalized.slice(0, 11);
  } else if (normalized.startsWith('9') && normalized.length >= 9) {
    normalized = `51${normalized.slice(0, 9)}`;
  } else if (normalized.startsWith('0') && normalized.length >= 10 && normalized[1] === '9') {
    normalized = `51${normalized.slice(1, 10)}`;
  } else if (normalized.length >= 9) {
    const lastNine = normalized.slice(-9);
    if (lastNine.startsWith('9')) {
      normalized = `51${lastNine}`;
    }
  }

  return /^519\d{8}$/.test(normalized) ? normalized : '';
}

function cleanName(value) {
  return String(value || '')
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function renderCsvPreview(contacts) {
  if (!contacts.length) {
    csvElements.previewBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="2">Aun no se han procesado contactos.</td>
      </tr>
    `;
    return;
  }

  csvElements.previewBody.innerHTML = contacts
    .slice(0, 200)
    .map((contact) => `
      <tr>
        <td>${escapeHtml(contact.name)}</td>
        <td>${escapeHtml(contact.phone)}</td>
      </tr>
    `)
    .join('');
}

function updateCsvSummary() {
  csvElements.contactCount.textContent = String(csvState.contacts.length);
  csvElements.skippedCount.textContent = String(csvState.skippedRows);
}

function escapeCsvValue(value) {
  const safe = String(value ?? '');
  return `"${safe.replace(/"/g, '""')}"`;
}

function getDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function announceCsv(message, type = 'info', shouldToast = true, title) {
  if (csvElements.srStatus) {
    csvElements.srStatus.textContent = message;
  }

  if (shouldToast) {
    showCsvToast(title || getToastTitle(type), message, type);
  }
}

function showCsvToast(title, message, type = 'info') {
  if (!csvElements.toastStack) {
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

  csvElements.toastStack.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-8px)';
    toast.style.transition = 'opacity 180ms ease, transform 180ms ease';

    window.setTimeout(() => {
      toast.remove();
    }, 180);
  }, getToastDuration(type));
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

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value || '-';
  return div.innerHTML;
}

