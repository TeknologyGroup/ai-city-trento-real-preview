'use strict';
window.AICity = window.AICity || {};
(() => {
  const categories = Object.freeze(window.AICity.cities ? Array.from(window.AICity.cities.active.merchantCategories) : ['Cartoleria', 'Artigianato']);
  const statuses = Object.freeze(['Bozza', 'In revisione', 'Pubblicata', 'Sospesa']);
  const copy = value => JSON.parse(JSON.stringify(value));
  const validate = record => record && Number.isInteger(record.id) && record.id > 0 &&
    Object.entries({ name: 100, description: 500, zone: 100, hours: 180, domain: 100 }).every(([key, limit]) => typeof record[key] === 'string' && record[key].trim() && record[key].length <= limit) &&
    categories.includes(record.category) && statuses.includes(record.status) &&
    typeof record.reviewed === 'boolean' && (record.status !== 'Pubblicata' || record.reviewed) && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.example$/.test(record.domain);
  const initial = window.DEMO_DATA;
  const valid = Array.isArray(initial) && initial.length > 0 && initial.every(validate) && new Set(initial.map(r => r.id)).size === initial.length;
  let records = valid ? copy(initial) : [];
  let nextId = valid ? Math.max(...records.map(r => r.id)) + 1 : 1;
  const filters = { query: '', category: '', selectedId: null };
  const get = id => records.find(record => record.id === Number(id));
  const save = (id, values) => {
    const existing = id === null ? null : get(id);
    if (id !== null && !existing) throw new Error('Scheda non disponibile.');
    const record = { ...values, id: existing ? existing.id : nextId, status: 'Bozza', reviewed: false };
    if (!validate(record)) throw new Error('Dati della scheda non validi.');
    if (existing) Object.assign(existing, record);
    else { records.push(record); nextId += 1; }
    return record;
  };
  const transition = (id, target, checked = false) => {
    const record = get(id);
    const allowed = { Bozza: ['In revisione'], 'In revisione': ['Bozza', 'Pubblicata'], Pubblicata: ['Sospesa'], Sospesa: ['In revisione'] };
    if (!record || !allowed[record.status].includes(target)) throw new Error('Passaggio editoriale non disponibile.');
    if (target === 'In revisione' && checked !== true) throw new Error('Completa tutti i controlli editoriali.');
    if (target === 'Pubblicata' && !record.reviewed) throw new Error('La revisione è necessaria.');
    record.status = target;
    record.reviewed = target === 'In revisione' || target === 'Pubblicata';
  };
  window.AICity.state = {
    categories, filters, valid, get, save, transition,
    all: () => records.slice(),
    published: () => records.filter(r => r.status === 'Pubblicata'),
    reset: () => {
      records = valid ? copy(initial) : [];
      nextId = valid ? Math.max(...records.map(r => r.id)) + 1 : 1;
      Object.assign(filters, { query: '', category: '', selectedId: null });
    }
  };
})();
