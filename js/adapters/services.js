'use strict';
(() => {
  const app = window.AICity;
  // Contratto sincrono locale. Un adapter remoto futuro richiederà revisione esplicita.
  const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('it');
  const catalog = Object.freeze({
    mode: 'local',
    search(query, category) {
      if (!app.state.valid) return { status: 'INVALID_DATA', records: [] };
      if (category && !app.state.categories.includes(category)) return { status: 'INVALID_FILTER', records: [] };
      const q = normalize(query);
      return { status: 'OK', records: app.state.published().filter(record => (!category || record.category === category) && normalize(record.name + ' ' + record.category).includes(q)) };
    }
  });
  const unavailable = capability => Object.freeze({ status: 'UNAVAILABLE', capability, reason: 'Servizio esterno non configurato né autorizzato.' });
  app.services = Object.freeze({
    catalog,
    geography: Object.freeze({ mode: 'schematic', availability: () => unavailable('real-geography') }),
    external: Object.freeze({ availability: () => unavailable('external-navigation') })
  });
})();
