const WA_CACHE_KEY = 'mce_whatsapp_direct_cache_v1';
const WA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const WA_EMOJI = {
  smile: String.fromCodePoint(0x1f60a),
  hands: String.fromCodePoint(0x1f64c),
  shirt: String.fromCodePoint(0x1f455),
  money: String.fromCodePoint(0x1f4b8),
  point: String.fromCodePoint(0x1f449),
  down: String.fromCodePoint(0x1f447),
  writing: String.fromCodePoint(0x270d, 0xfe0f),
};

const WHATSAPP_MESSAGE = [
  `Hola ${WA_EMOJI.smile} *Somos de Mercado Central Express*`,
  `*Gracias por confiar en nosotros* ${WA_EMOJI.hands}${WA_EMOJI.hands}${WA_EMOJI.hands}`,
  '',
  'Como nos compraste tu *pack de bolsas con succionador eléctrico*, o usas aspiradora, ahora puedes llevar *bolsas por tamaño*, según lo que necesites, *sin comprar el pack completo*.',
  '',
  `Disponibles en *3, 6 o 12 unidades*, también para *camisas y sacos* ${WA_EMOJI.shirt}`,
  '',
  `${WA_EMOJI.money} *Precio especial por cantidad*`,
  '',
  `${WA_EMOJI.point} *Puedes ver todas las opciones aquí, elegir lo que necesites y continuar tu compra fácilmente por WhatsApp* ${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}`,
  '',
  'https://elverantony.github.io/mercadocentralexpress/#/catalogo',
  '',
  `${WA_EMOJI.point} *Escríbenos y te damos más detalles* ${WA_EMOJI.writing}`,
].join('\n');

const waState = {
  contacts: [],
  skippedRows: 0,
  sentPhones: {},
  hasNotifiedCacheError: false,
};

const waElements = {
  input: document.getElementById('waPasteInput'),
  processBtn: document.getElementById('waProcessBtn'),
  resetBtn: document.getElementById('waResetBtn'),
  previewBody: document.getElementById('waPreviewBody'),
  contactCount: document.getElementById('waContactCount'),
  skippedCount: document.getElementById('waSkippedCount'),
  toastStack: document.getElementById('waToastStack'),
  srStatus: document.getElementById('waSrStatus'),
};

initializeWhatsappDirectModule();

function initializeWhatsappDirectModule() {
  if (!waElements.input) {
    return;
  }

  waElements.processBtn.addEventListener('click', processWhatsappList);
  waElements.resetBtn.addEventListener('click', resetWhatsappModule);
  waElements.input.addEventListener('input', handleWhatsappInputChange);
  waElements.previewBody.addEventListener('click', handlePreviewActionClick);

  resetWhatsappResults(false);
  restoreWhatsappCache();

  if (!waState.contacts.length) {
    announceWhatsapp('Listo para procesar contactos y abrir WhatsApp directo.', 'info', false);
  }
}

function handleWhatsappInputChange() {
  if (!waElements.input.value.trim()) {
    resetWhatsappResults(false);
  }

  persistWhatsappCache();
}

function handlePreviewActionClick(event) {
  const actionButton = event.target.closest('[data-wa-phone]');
  if (!actionButton) {
    return;
  }

  const phone = String(actionButton.dataset.waPhone || '').trim();
  if (!phone) {
    return;
  }

  markPhoneAsSent(phone);
  copyWhatsappMessageToClipboard();
}

function processWhatsappList() {
  const rawText = waElements.input.value || '';

  if (!rawText.trim()) {
    resetWhatsappResults(false);
    persistWhatsappCache();
    announceWhatsapp('Pega texto con nombres y telefonos antes de procesar.', 'error', true, 'Entrada vacia');
    return;
  }

  const processed = parseClipboardText(rawText);

  if (!processed.contacts.length) {
    resetWhatsappResults(false);
    waState.skippedRows = processed.skippedRows;
    updateWhatsappSummary();
    persistWhatsappCache();
    announceWhatsapp('No se detectaron telefonos validos para WhatsApp.', 'error', true, 'Sin contactos validos');
    return;
  }

  waState.contacts = processed.contacts;
  waState.skippedRows = processed.skippedRows;

  cleanupSentPhones();
  renderWhatsappPreview(waState.contacts);
  updateWhatsappSummary();
  persistWhatsappCache();

  announceWhatsapp(
    `Se prepararon ${processed.contacts.length} enlaces directos para WhatsApp.`,
    'success',
    true,
    'Lista procesada'
  );
}

function resetWhatsappModule() {
  waElements.input.value = '';
  resetWhatsappResults(true);
  announceWhatsapp('Se limpio la lista para pegar nuevos contactos.', 'success', true, 'Lista limpiada');
}

function resetWhatsappResults(shouldClearCache) {
  waState.contacts = [];
  waState.skippedRows = 0;
  waState.sentPhones = {};
  renderWhatsappPreview([]);
  updateWhatsappSummary();

  if (shouldClearCache) {
    clearWhatsappCache();
  }
}

function restoreWhatsappCache() {
  const payload = readWhatsappCache();
  if (!payload) {
    return;
  }

  const cachedInput = typeof payload.rawInput === 'string' ? payload.rawInput : '';
  const cachedSkipped = Number.isFinite(payload.skippedRows) ? Math.max(0, payload.skippedRows) : 0;

  waElements.input.value = cachedInput;
  waState.skippedRows = cachedSkipped;
  waState.sentPhones = normalizeSentPhones(payload.sentPhones);
  waState.contacts = normalizeCachedContacts(payload.contacts);

  cleanupSentPhones();
  renderWhatsappPreview(waState.contacts);
  updateWhatsappSummary();

  if (waState.contacts.length) {
    announceWhatsapp('Se restauro tu lista guardada, ten en cuenta que se perderá en 24 horas.', 'success', true, 'Lista recuperada');
  }
}

function persistWhatsappCache() {
  const payload = {
    version: 1,
    expiresAt: Date.now() + WA_CACHE_TTL_MS,
    rawInput: waElements.input.value || '',
    contacts: waState.contacts,
    skippedRows: waState.skippedRows,
    sentPhones: waState.sentPhones,
  };

  try {
    localStorage.setItem(WA_CACHE_KEY, JSON.stringify(payload));
    waState.hasNotifiedCacheError = false;
  } catch (_error) {
    if (!waState.hasNotifiedCacheError) {
      announceWhatsapp('No fue posible guardar cache local en este navegador.', 'error', true, 'Cache no disponible');
      waState.hasNotifiedCacheError = true;
    }
  }
}

function clearWhatsappCache() {
  try {
    localStorage.removeItem(WA_CACHE_KEY);
  } catch (_error) {
    // No-op
  }
}

function readWhatsappCache() {
  try {
    const raw = localStorage.getItem(WA_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      clearWhatsappCache();
      return null;
    }

    const expiresAt = Number(parsed.expiresAt);
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
      clearWhatsappCache();
      return null;
    }

    return parsed;
  } catch (_error) {
    clearWhatsappCache();
    return null;
  }
}

function normalizeCachedContacts(cachedContacts) {
  if (!Array.isArray(cachedContacts)) {
    return [];
  }

  return cachedContacts
    .map((contact) => {
      if (!contact || typeof contact !== 'object') {
        return null;
      }

      const phone = normalizePeruPhone(contact.phone || '');
      if (!phone) {
        return null;
      }

      const name = cleanName(contact.name || '');
      return {
        name: name || 'Cliente',
        phone,
      };
    })
    .filter(Boolean)
    .slice(0, 300);
}

function normalizeSentPhones(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const sentPhones = {};
  Object.entries(value).forEach(([phone, stamp]) => {
    if (!/^519\d{8}$/.test(phone)) {
      return;
    }

    if (!Number.isFinite(stamp)) {
      return;
    }

    sentPhones[phone] = stamp;
  });

  return sentPhones;
}

function cleanupSentPhones() {
  const phoneSet = new Set(waState.contacts.map((contact) => contact.phone));
  const cleaned = {};

  Object.entries(waState.sentPhones).forEach(([phone, stamp]) => {
    if (!phoneSet.has(phone)) {
      return;
    }

    cleaned[phone] = stamp;
  });

  waState.sentPhones = cleaned;
}

function markPhoneAsSent(phone) {
  if (!/^519\d{8}$/.test(phone)) {
    return;
  }

  waState.sentPhones[phone] = Date.now();
  renderWhatsappPreview(waState.contacts);
  persistWhatsappCache();
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

    const name = normalized.name || `Cliente ${generatedNameIndex}`;
    if (!normalized.name) {
      generatedNameIndex += 1;
    }

    contacts.push({
      name,
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
  const normalized = columns.map((value) =>
    value
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
  );
  return normalized.some((value) => {
    return (
      value === 'name' ||
      value === 'phone number' ||
      value === 'phone' ||
      value === 'nombre' ||
      value === 'telefono' ||
      value === 'celular'
    );
  });
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

function renderWhatsappPreview(contacts) {
  if (!contacts.length) {
    waElements.previewBody.innerHTML = `
      <tr class="empty-row">
        <td colspan="4">Aun no se han procesado contactos.</td>
      </tr>
    `;
    return;
  }

  waElements.previewBody.innerHTML = contacts
    .slice(0, 300)
    .map((contact, index) => {
      const link = buildWhatsappLink(contact.phone);
      const isSent = Boolean(waState.sentPhones[contact.phone]);
      const sentClass = isSent ? ' is-sent' : '';
      const sentLabel = isSent ? 'Enviado' : 'Enviar por WhatsApp';

      const actionCell = isSent
        ? `
            <button class="btn btn-whatsapp wa-send-btn${sentClass}" type="button" disabled aria-disabled="true">
              ${sentLabel}
            </button>
          `
        : `
            <a
              class="btn btn-whatsapp wa-send-btn${sentClass}"
              href="${link}"
              target="_blank"
              rel="noopener noreferrer"
              data-wa-phone="${contact.phone}"
            >
              ${sentLabel}
            </a>
          `;

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(contact.name)}</td>
          <td>${escapeHtml(formatWhatsappPhone(contact.phone))}</td>
          <td class="wa-action-cell">
            ${actionCell}
          </td>
        </tr>
      `;
    })
    .join('');
}

function buildWhatsappLink(phone) {
  const encodedText = encodeWhatsappTextUtf8(WHATSAPP_MESSAGE);
  const encodedPhone = encodeURIComponent(phone);
  return `https://api.whatsapp.com/send?phone=${encodedPhone}&text=${encodedText}&type=phone_number&app_absent=0`;
}

function formatWhatsappPhone(phone) {
  return `+${phone}`;
}

function updateWhatsappSummary() {
  waElements.contactCount.textContent = String(waState.contacts.length);
  waElements.skippedCount.textContent = String(waState.skippedRows);
}

function announceWhatsapp(message, type = 'info', shouldToast = true, title) {
  if (waElements.srStatus) {
    waElements.srStatus.textContent = message;
  }

  if (shouldToast) {
    showWhatsappToast(title || getToastTitle(type), message, type);
  }
}

function showWhatsappToast(title, message, type = 'info') {
  if (!waElements.toastStack) {
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

  waElements.toastStack.appendChild(toast);

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

async function copyWhatsappMessageToClipboard() {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(WHATSAPP_MESSAGE);
      announceWhatsapp('Mensaje copiado con emojis. Solo pega y envia en WhatsApp.', 'success', true, 'Mensaje copiado');
      return;
    }

    fallbackCopyText(WHATSAPP_MESSAGE);
    announceWhatsapp('Mensaje copiado con emojis. Solo pega y envia en WhatsApp.', 'success', true, 'Mensaje copiado');
  } catch (_error) {
    announceWhatsapp('No se pudo copiar automatico. Copialo manualmente si tu navegador lo bloquea.', 'error', true, 'Copia bloqueada');
  }
}

function fallbackCopyText(text) {
  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.top = '-9999px';
  helper.style.opacity = '0';
  document.body.appendChild(helper);
  helper.select();
  document.execCommand('copy');
  helper.remove();
}

function encodeWhatsappTextUtf8(text) {
  const bytes = new TextEncoder().encode(text);
  let encoded = '';

  bytes.forEach((byte) => {
    encoded += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`;
  });

  return encoded;
}
