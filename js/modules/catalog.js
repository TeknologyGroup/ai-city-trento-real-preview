'use strict';
(() => {
  const app = window.AICity;
  const { node, append, button, actions, page, field, details, announce } = app.ui;
  const { state, navigation: nav } = app;
  const available = id => {
    const record = state.get(id);
    if (!record || record.status !== 'Pubblicata') {
      nav.error('La scheda richiesta non è disponibile nel catalogo: potrebbe essere in bozza o sospesa.');
      return null;
    }
    return record;
  };
  function catalog() {
    const main = page('Scopri una bottega', 'Esplora · Trento immaginaria');
    append(main, node('p', 'Una piccola raccolta di attività inventate. Scegli dall’elenco o usa lo schema: entrambi mostrano gli stessi risultati.', 'lead'));
    if (!state.valid) { nav.error('I dati iniziali della demo non sono disponibili o non sono validi.'); return; }
    const form = node('form', undefined, 'filters');
    form.setAttribute('role', 'search'); form.setAttribute('aria-label', 'Ricerca attività fittizie');
    form.addEventListener('submit', event => { event.preventDefault(); update(); });
    const searchBox = node('div'), categoryBox = node('div');
    const search = field(searchBox, 'catalog-query', 'Nome o categoria', node('input'));
    search.type = 'search'; search.maxLength = 180; search.value = state.filters.query;
    const category = field(categoryBox, 'catalog-category', 'Categoria', node('select'));
    ['', ...state.categories].forEach(value => {
      const option = node('option', value || 'Tutte le categorie'); option.value = value; category.append(option);
    });
    category.value = state.filters.category;
    append(form, searchBox, categoryBox); main.append(form);
    const clear = () => {
      Object.assign(state.filters, { query: '', category: '', selectedId: null });
      search.value = ''; category.value = ''; update(); search.focus();
    };
    actions(main, button('Cancella filtri', clear));
    const count = node('p', '', 'result-count');
    const results = node('div'); append(main, count, results);
    let previousCount = null;
    function update() {
      state.filters.query = search.value; state.filters.category = category.value;
      const response = app.services.catalog.search(search.value, category.value);
      if (response.status !== 'OK') {
        results.replaceChildren(node('p', 'Catalogo o filtro non disponibile. Cancella i filtri oppure ripristina la demo.', 'error-panel'));
        count.textContent = 'Ricerca non disponibile'; return;
      }
      const found = response.records;
      count.textContent = found.length === 1 ? '1 attività fittizia' : found.length + ' attività fittizie';
      if (previousCount !== found.length) announce(count.textContent);
      previousCount = found.length;
      results.replaceChildren();
      if (!found.length) {
        const empty = node('section', undefined, 'empty-state');
        append(empty, node('h2', 'Nessuna corrispondenza'), node('p', 'Prova un altro nome o rimuovi i filtri. Le schede in bozza o sospese non compaiono nel catalogo.'));
        actions(empty, button('Rimuovi filtri', clear, true)); results.append(empty); return;
      }
      const layout = node('div', undefined, 'catalog-layout');
      const list = node('section'); list.setAttribute('aria-labelledby', 'list-title');
      const title = node('h2', 'Elenco delle attività'); title.id = 'list-title'; list.append(title);
      const cards = new Map();
      const selection = node('div', undefined, 'map-selection'); selection.setAttribute('aria-live', 'polite');
      const mapPanel = app.cityMap.create(record => select(record, true));
      const select = (record, moveFocus) => {
        state.filters.selectedId = record.id;
        cards.forEach((card, id) => card.classList.toggle('selected', id === record.id));
        mapPanel.select(record.id);
        selection.replaceChildren();
        append(selection, node('p', 'Selezionata: ' + record.name));
        actions(selection, button('Apri il profilo selezionato', () => nav.go('profile', { id: record.id }), true));
        if (moveFocus) cards.get(record.id).querySelector('h3').focus();
      };
      found.forEach((record, index) => {
        const card = node('article', undefined, 'card'); card.id = 'merchant-' + record.id;
        const heading = node('h3', record.name); heading.tabIndex = -1;
        append(card, node('span', String(index + 1).padStart(2, '0') + ' · DEMO', 'eyebrow'), heading,
          node('p', record.category + ' · ' + record.zone, 'muted'), node('p', record.description));
        actions(card, button('Apri profilo: ' + record.name, () => { state.filters.selectedId = record.id; nav.go('profile', { id: record.id }); }, true));
        list.append(card); cards.set(record.id, card);
      });
      mapPanel.update(found);
      append(layout, list, append(mapPanel.element, selection)); results.append(layout);
      const selected = found.find(record => record.id === state.filters.selectedId);
      if (selected) select(selected, false);
    }
    search.addEventListener('input', update); category.addEventListener('change', update); update();
  }
  function profile({ id, returnTo }) {
    const record = available(id); if (!record) return;
    const main = page(record.name, 'Profilo merchant · demo');
    actions(main, button('← Torna ai risultati', () => nav.go('catalog')));
    if (returnTo === 'planner') actions(main, button('Torna al piano', () => nav.go('planner')));
    main.append(node('p', 'Posizione non disponibile: bottega DEMO senza coordinate verificate.', 'field-hint'));
    const card = node('article', undefined, 'profile-card'); details(card, record);
    actions(card, button('Che cosa significa verifica?', () => nav.go('verification', { id, returnTo })),
      button('Simula apertura del sito ↗', () => nav.go('external', { id, returnTo }), true));
    main.append(card);
    actions(main, button('Aggiungi bottega al piano', () => app.discovery.add('merchant', record.id)));
    const section = node('section');section.setAttribute('aria-label', 'Prodotti e servizi dimostrativi');
    append(section, node('h2', 'Prodotti e servizi · DEMO'), node('p', 'Esempi inventati: nessun prezzo, stock o disponibilità reale. Nessun checkout.'));
    const search = field(section, 'offer-query', 'Cerca nei prodotti e servizi', node('input'));search.type = 'search';search.maxLength = 180;
    const type = field(section, 'offer-type', 'Tipo di offerta', node('select'));
    ['', 'Prodotto', 'Servizio'].forEach(value => {const option = node('option', value || 'Tutti i tipi');option.value=value;type.append(option);});type.value='';
    const results = node('div');section.append(results);
    function offers() {
      results.replaceChildren();const q=search.value.trim().toLocaleLowerCase('it');
      const found=app.content.offersFor(id).filter(o => (!type.value || o.type===type.value) && (o.name+' '+o.description).toLocaleLowerCase('it').includes(q));
      if (!found.length) results.append(node('p', 'Nessuna offerta dimostrativa corrispondente.', 'empty-state'));
      found.forEach(offer => {const item=node('article', undefined, 'card');append(item,node('h3',offer.name),node('p',offer.type+' · DEMO','badge'),node('p',offer.description));actions(item,button('Simula contatto: '+offer.name,()=>nav.go('contact',{id,offerId:offer.id,returnTo})));results.append(item);});
    }
    search.addEventListener('input',offers);type.addEventListener('change',offers);offers();main.append(section);
    actions(main, button('Simula contatto diretto',()=>nav.go('contact',{id,returnTo})));
  }
  function verification({ id, returnTo }) {
    if (!available(id)) return;
    const main = page('Una verifica, spiegata', 'Trasparenza · stato simulato');
    append(main, node('p', 'Nel prodotto futuro AI CITY potrebbe controllare la corrispondenza tra attività e collegamento, indicando metodo e data.', 'lead'),
      node('p', 'Questa demo non esegue verifiche. L’etichetta non certifica prodotti, disponibilità, affidabilità commerciale o sicurezza assoluta.', 'error-panel'));
    actions(main, button('Torna al profilo', () => nav.go('profile', { id, returnTo })));
  }
  function external({ id, returnTo }) {
    const record = available(id); if (!record) return;
    const main = page('Qui il percorso continuerebbe', 'Uscita commerciale simulata');
    append(main, node('p', 'Nel prodotto futuro passeresti al sito del commerciante. Nessun sito viene aperto in questa demo.', 'lead'),
      node('p', record.domain, 'domain'), node('p', 'Dominio .example fittizio, mostrato soltanto come testo.'),
      node('p', 'Nessun checkout interno e nessuna commissione AI CITY sulle vendite dirette.'));
    actions(main, button('Torna al profilo', () => nav.go('profile', { id, returnTo }), true), button('Torna ai risultati', () => nav.go('catalog')));
  }
  function contact({ id, offerId, returnTo }) {
    const record=available(id);if (!record) return;
    const offer=offerId ? app.content.getOffer(offerId) : null;
    if (offerId && (!offer || offer.merchantId!==record.id)) {nav.error('Offerta non disponibile per questa scheda.');return;}
    const main=page('Contatto commerciale dimostrativo','Nessun messaggio inviato');
    append(main,node('p','Nel prodotto futuro contatteresti direttamente il commerciante tramite un canale verificato. Nessun canale reale è configurato qui.','lead'),
      node('p','Scheda DEMO: '+record.name),node('p',offer ? 'Interesse dimostrativo: '+offer.name : 'Richiesta dimostrativa di informazioni.'),
      node('p','Nessun invio, prenotazione o ordine. Nessun checkout interno e nessuna commissione AI CITY sulle vendite dirette.','badge'));
    actions(main,button('Torna al profilo',()=>nav.go('profile',{id,returnTo}),true));
  }
  nav.registerRoute('contact',contact);
  nav.registerRoute('catalog', catalog); nav.registerRoute('profile', profile);
  nav.registerRoute('verification', verification); nav.registerRoute('external', external);
  nav.registerModule({ id: 'city-map', label: 'City Map', entry: 'catalog', version: '0.4.0' });
})();
