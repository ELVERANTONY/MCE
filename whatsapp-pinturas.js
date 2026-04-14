const WA_CACHE_KEY = 'mce_whatsapp_pinturas_cache_v3';
const WA_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const PAINTS_URL = 'https://elverantony.github.io/mercadocentralexpress1/';

const WA_EMOJI = {
  smile: String.fromCodePoint(0x1f60a),
  sparkleHeart: String.fromCodePoint(0x1f496),
  sparkles: String.fromCodePoint(0x2728),
  palette: String.fromCodePoint(0x1f3a8),
  yogaWoman: String.fromCodePoint(0x1f9d8, 0x200d, 0x2640, 0xfe0f),
  star: String.fromCodePoint(0x1f31f),
  puzzle: String.fromCodePoint(0x1f9e9),
  target: String.fromCodePoint(0x1f3af),
  moneyBag: String.fromCodePoint(0x1f4b0),
  truck: String.fromCodePoint(0x1f69a),
  cash: String.fromCodePoint(0x1f4b5),
  point: String.fromCodePoint(0x1f449),
  down: String.fromCodePoint(0x1f447),
};

const PAINTS_TEMPLATES = [
  ({ greeting }) =>
    [
      greeting,
      '',
      `Vimos que anteriormente compraste *pinturas con diamantes* con nosotros ${WA_EMOJI.sparkleHeart}`,
      `Por eso queremos mostrarte *nuevas opciones que te pueden encantar* ${WA_EMOJI.sparkles}`,
      '',
      `${WA_EMOJI.palette} Hemos preparado *packs de 3 pinturas (40x30 cm c/u)*`,
      `Ideales para *relajarte y decorar tu hogar*`,
      '',
      `${WA_EMOJI.yogaWoman} Perfectas para *desconectarte del estrés* y *disfrutar tu tiempo*`,
      '',
      `${WA_EMOJI.point} *Elige tu pack favorito y continúa tu pedido fácilmente por WhatsApp* ${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}`,
      '',
      PAINTS_URL,
    ].join('\n'),
  ({ greeting }) =>
    [
      greeting,
      '',
      `Como ya compraste *pinturas con diamantes*, queremos compartirte *nuevos diseños* ${WA_EMOJI.sparkleHeart}`,
      '',
      `${WA_EMOJI.palette} *Packs de 3 pinturas (40x30 cm c/u)*`,
      `Perfectas para *decorar tus espacios* y *relajarte* ${WA_EMOJI.sparkles}`,
      '',
      `${WA_EMOJI.star} Una actividad creativa que *muchos clientes están disfrutando*`,
      '',
      `${WA_EMOJI.point} *Mira las opciones y elige tu favorita aquí* ${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}`,
      '',
      PAINTS_URL,
    ].join('\n'),
  ({ greeting }) =>
    [
      greeting,
      '',
      `Sabemos que te gustan las *pinturas con diamantes* ${WA_EMOJI.sparkles}`,
      `Por eso te compartimos *nuevas opciones* que están gustando mucho ${WA_EMOJI.sparkleHeart}`,
      '',
      `${WA_EMOJI.palette} *Pack de 3 pinturas (40x30 cm c/u)*`,
      `Para relajarte, entretenerte y decorar`,
      '',
      `${WA_EMOJI.puzzle} Ideal para *pasar un buen momento en casa*`,
      '',
      `${WA_EMOJI.point} *Revisa los diseños y elige el tuyo aquí* ${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}`,
      '',
      PAINTS_URL,
    ].join('\n'),
  ({ greeting }) =>
    [
      greeting,
      '',
      `Te escribimos porque ya eres cliente de *pinturas con diamantes* ${WA_EMOJI.sparkleHeart}`,
      '',
      `${WA_EMOJI.palette} Tenemos *packs de 3 pinturas (40x30 cm c/u)*`,
      `Perfectos para *seguir disfrutando esta actividad* ${WA_EMOJI.sparkles}`,
      '',
      `${WA_EMOJI.target} Muchos clientes los usan para *relajarse y decorar su hogar*`,
      '',
      `${WA_EMOJI.point} *Elige tu pack aquí y continúa por WhatsApp* ${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}`,
      '',
      PAINTS_URL,
    ].join('\n'),
  ({ greeting }) =>
    [
      greeting,
      '',
      `Como ya probaste nuestras *pinturas con diamantes*, queríamos mostrarte *nuevas opciones* ${WA_EMOJI.sparkleHeart}`,
      '',
      `${WA_EMOJI.palette} *Packs de 3 pinturas (40x30 cm c/u)*`,
      `Ideales para disfrutar tu tiempo libre y decorar ${WA_EMOJI.sparkles}`,
      '',
      `${WA_EMOJI.yogaWoman} Una forma entretenida de *relajarte en casa*`,
      '',
      `${WA_EMOJI.point} *Mira los diseños disponibles y elige el tuyo aquí* ${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}${WA_EMOJI.down}`,
      '',
      PAINTS_URL,
    ].join('\n'),
];

const waState = {
  contacts: [],
  skippedRows: 0,
  sentPhones: {},
  messageTemplateByPhone: {},
  hasPendingTemplatePersist: false,
  hasNotifiedCacheError: false,
};

const waElements = {
  input: document.getElementById('waPaintPasteInput'),
  processBtn: document.getElementById('waPaintProcessBtn'),
  resetBtn: document.getElementById('waPaintResetBtn'),
  previewBody: document.getElementById('waPaintPreviewBody'),
  contactCount: document.getElementById('waPaintContactCount'),
  skippedCount: document.getElementById('waPaintSkippedCount'),
  toastStack: document.getElementById('waPaintToastStack'),
  srStatus: document.getElementById('waPaintSrStatus'),
};

initializeWhatsappPaintsModule();

function initializeWhatsappPaintsModule() {
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
  const message = getMessageForPhone(phone);
  copyWhatsappMessageToClipboard(message);
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
  waState.messageTemplateByPhone = {};
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
  waState.messageTemplateByPhone = normalizeTemplateByPhone(payload.messageTemplateByPhone);
  waState.contacts = normalizeCachedContacts(payload.contacts);

  cleanupSentPhones();
  renderWhatsappPreview(waState.contacts);
  updateWhatsappSummary();

  if (waState.contacts.length) {
    announceWhatsapp(
      'Se restauro tu lista guardada, ten en cuenta que se perderá en 24 horas.',
      'success',
      true,
      'Lista recuperada'
    );
  }
}

function persistWhatsappCache() {
  const payload = {
    version: 3,
    expiresAt: Date.now() + WA_CACHE_TTL_MS,
    rawInput: waElements.input.value || '',
    contacts: waState.contacts,
    skippedRows: waState.skippedRows,
    sentPhones: waState.sentPhones,
    messageTemplateByPhone: waState.messageTemplateByPhone,
  };

  try {
    localStorage.setItem(WA_CACHE_KEY, JSON.stringify(payload));
    waState.hasNotifiedCacheError = false;
  } catch (_error) {
    if (!waState.hasNotifiedCacheError) {
      announceWhatsapp('No fue posible guardar tu lista local en este navegador.', 'error', true, 'Guardado no disponible');
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

  const cleanedTemplates = {};
  Object.entries(waState.messageTemplateByPhone).forEach(([phone, templateIndex]) => {
    if (!phoneSet.has(phone)) {
      return;
    }

    cleanedTemplates[phone] = templateIndex;
  });
  waState.messageTemplateByPhone = cleanedTemplates;
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

  if (/\s{2,}/.test(line)) {
    return line
      .split(/\s{2,}/)
      .map((part) => part.trim())
      .filter((part) => part !== '');
  }

  if (line.includes(';')) {
    return line.split(';').map((part) => part.trim());
  }

  if (line.includes(',')) {
    return line.split(',').map((part) => part.trim());
  }

  const extracted = extractPhoneFromLine(line);
  if (extracted.phone) {
    return [extracted.name, extracted.phone].filter((value) => value !== '');
  }

  return [line.trim()];
}

function extractPhoneFromLine(line) {
  const raw = String(line || '').trim();
  if (!raw) {
    return { name: '', phone: '' };
  }

  const candidates = raw.match(/[+]?\d[\d\s().-]{6,}\d/g) || [];

  for (const candidate of candidates) {
    const phone = normalizePeruPhone(candidate);
    if (!phone) {
      continue;
    }

    const name = cleanName(raw.replace(candidate, ' '));
    return { name, phone };
  }

  return { name: cleanName(raw), phone: '' };
}

function detectHeaderRow(columns) {
  const normalized = columns.map((value) => removeDiacritics(value).toLowerCase().trim());
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

function removeDiacritics(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
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
    .replace(/[^0-9A-Za-zÀ-ÿÑñ\s]/g, ' ')
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
      const message = getMessageForContact(contact);
      const link = buildWhatsappLink(contact.phone, message);
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

  if (waState.hasPendingTemplatePersist) {
    waState.hasPendingTemplatePersist = false;
    persistWhatsappCache();
  }
}

function buildWhatsappLink(phone, message) {
  const encodedText = encodeWhatsappTextUtf8(String(message || ''));
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

async function copyWhatsappMessageToClipboard(message) {
  const textToCopy = String(message || '');
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(textToCopy);
      announceWhatsapp('Mensaje copiado con emojis. Solo pega y envia en WhatsApp.', 'success', true, 'Mensaje copiado');
      return;
    }

    fallbackCopyText(textToCopy);
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
  if (typeof TextEncoder === 'undefined') {
    return encodeURIComponent(text);
  }

  const bytes = new TextEncoder().encode(text);
  let encoded = '';

  bytes.forEach((byte) => {
    encoded += `%${byte.toString(16).toUpperCase().padStart(2, '0')}`;
  });

  return encoded;
}

function getMessageForContact(contact) {
  const phone = contact.phone;
  const firstName = getValidFirstName(contact.name);
  const greeting = firstName
    ? `Hola ${WA_EMOJI.smile} ${firstName}, somos de Mercado Central Express`
    : `Hola ${WA_EMOJI.smile}, somos de Mercado Central Express`;

  let templateIndex = waState.messageTemplateByPhone[phone];
  if (!Number.isInteger(templateIndex) || templateIndex < 0 || templateIndex >= PAINTS_TEMPLATES.length) {
    templateIndex = pickRandomIndex(PAINTS_TEMPLATES.length);
    waState.messageTemplateByPhone[phone] = templateIndex;
    waState.hasPendingTemplatePersist = true;
  }

  return PAINTS_TEMPLATES[templateIndex]({ greeting });
}

function getMessageForPhone(phone) {
  const contact = waState.contacts.find((item) => item.phone === phone);
  if (!contact) {
    return '';
  }
  return getMessageForContact(contact);
}

function pickRandomIndex(maxExclusive) {
  const max = Math.max(1, Number(maxExclusive) || 1);

  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] % max;
    }
  } catch (_error) {
    // ignore
  }

  return Math.floor(Math.random() * max);
}

function getValidFirstName(fullName) {
  const cleaned = cleanName(fullName);
  if (!cleaned) {
    return '';
  }

  const lowered = cleaned.toLowerCase();
  if (lowered.startsWith('cliente ')) {
    return '';
  }

  if (/\d/.test(cleaned)) {
    return '';
  }

  const token = cleaned.split(' ')[0] || '';
  if (token.length < 2) {
    return '';
  }

  return token.charAt(0).toUpperCase() + token.slice(1);
}

function normalizeTemplateByPhone(value) {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const out = {};
  Object.entries(value).forEach(([phone, templateIndex]) => {
    if (!/^519\d{8}$/.test(phone)) {
      return;
    }

    if (!Number.isInteger(templateIndex)) {
      return;
    }

    if (templateIndex < 0 || templateIndex >= PAINTS_TEMPLATES.length) {
      return;
    }

    out[phone] = templateIndex;
  });

  return out;
}
