'use strict';
(() => {
  const app = window.AICity, { node, append, button, actions, page, field, announce } = app.ui;
  const nav = app.navigation, data = app.content;
  const filters = { query: '', category: '', selectedId: null, district: '' };
  function places({query: incomingQuery, category: incomingCategory} = {}) {
    if(typeof incomingQuery==='string')filters.query=incomingQuery.slice(0,180);
    if(typeof incomingCategory==='string')filters.category=incomingCategory;
    const main = page('Luoghi reali di Trento', 'Esplora Trento · fonte Comune di Trento');
    const geographic=app.cityMap.explorer(record=>{filters.selectedId=record.id;});main.append(geographic.element);geographic.mount();
    actions(main, button('Apri Life Planner', () => nav.go('planner')));
    main.append(node('h2', 'Elenco accessibile dei luoghi'));
    main.append(node('p', 'Dati importati e DEMO sono distinti. Lo schema mostra solo luoghi inventati; i luoghi reali hanno coordinate dalla fonte e nessun sopralluogo.', 'lead'));
    const form = node('form', undefined, 'filters');form.setAttribute('role', 'search');form.setAttribute('aria-label', 'Ricerca luoghi di Trento');
    const searchBox = node('div'), categoryBox = node('div');append(form, searchBox, categoryBox);
    const query = field(searchBox, 'places-query', 'Nome o categoria del luogo', node('input'));query.type = 'search';query.maxLength = 180;query.value = filters.query;
    const category = field(categoryBox, 'places-category', 'Categoria del luogo', node('select'));
    ['', ...data.allCategories].forEach(value => { const option = node('option', value || 'Tutte le categorie');option.value = value;category.append(option); });category.value = filters.category;
    const mode=field(form,'places-mode','Tipo di contenuti',node('select'));
    [['real','Luoghi reali'],['demo','Luoghi DEMO'],['all','Reali e DEMO distinti']].forEach(([v,t])=>{const o=node('option',t);o.value=v;mode.append(o);});mode.value=filters.mode||'real';mode.addEventListener('change',render);
    const district=field(form,'places-district','Circoscrizione (solo dati reali)',node('select'));
    ['',...data.districts].forEach(value=>{const o=node('option',value||'Tutte le circoscrizioni');o.value=value;district.append(o);});district.value=filters.district;district.disabled=true;
    district.addEventListener('change',render);
    main.append(form);const count = node('p', '', 'result-count'), results = node('div');
    const clear = () => { filters.query = '';filters.category = '';filters.selectedId = null;filters.district='';district.value='';query.value = '';category.value = '';render();query.focus(); };
    actions(main, button('Cancella filtri luoghi', clear));append(main, count, results);
    function render() {
      filters.query = query.value;filters.category = category.value;filters.district=district.value;results.replaceChildren();
      const response = data.searchAll(query.value, category.value,district.value);
      filters.mode=mode.value;response.records=response.records.filter(r=>mode.value==='all'||(mode.value==='real'?!!r.metadata:!r.metadata));
      geographic.update(response.records);
      if (response.status !== 'OK') {count.textContent = 'Ricerca non disponibile';results.append(node('p', 'Dati o filtri non validi. Cancella i filtri per riprovare.', 'error-panel'));return;}
      count.textContent = response.records.length + ' luoghi · fonte aperta e DEMO distinti';announce(count.textContent);
      if (!response.records.length) {append(results, node('h2', 'Nessun luogo trovato'), node('p', 'Prova un altro nome o rimuovi i filtri.'));actions(results, button('Rimuovi filtri luoghi', clear));return;}
      const layout = node('div', undefined, 'catalog-layout'), list = node('section');list.setAttribute('aria-label', 'Elenco alternativo dei luoghi');
      const cards = new Map();
      const map = app.cityMap.create(record => {filters.selectedId = record.id;map.select(record.id);cards.forEach((card,id) => card.classList.toggle('selected',id===record.id));cards.get(record.id).querySelector('h2').focus();}, { prefix: 'place-card-' });
      response.records.forEach(record => {
        const card = node('article', undefined, 'card');card.id = 'place-card-' + record.id;if (filters.selectedId === record.id) card.classList.add('selected');
        const title = node('h2', record.name);title.tabIndex = -1;
        append(card, title, node('p', record.category + (record.metadata ? ' · Fonte aperta' : ' · DEMO'), 'badge'), node('p', record.description || 'Dato importato dal Comune di Trento · CC BY 4.0'));
        if(record.metadata)actions(card,button('Mostra sulla mappa: '+record.name,()=>geographic.select(record.id)));
        actions(card, button((record.metadata ? 'Apri luogo reale: ' : 'Apri luogo: ') + record.name, () => {filters.selectedId = record.id;nav.go(record.metadata ? 'real-place' : 'place', {id: record.id});}, true));list.append(card);cards.set(record.id, card);
      });map.update(response.records.filter(r=>!r.metadata));if (response.records.some(p => p.id === filters.selectedId)) map.select(filters.selectedId);
      append(layout, list);if(response.records.some(r=>!r.metadata))layout.append(map.element);results.append(layout);
    }
    query.addEventListener('input', render);category.addEventListener('change', render);form.addEventListener('submit', event => {event.preventDefault();render();});render();
  }
  function place({ id, returnTo }) {
    const record = data.getPlace(id);if (!record) {nav.error('Il luogo richiesto non è disponibile.');return;}
    const main = page(record.name, 'Scheda luogo · DEMO');
    append(main, node('p', record.description, 'lead'), node('p', record.category + ' · ' + record.zone), node('p', 'Fonte: ' + record.source.origin + '. Nessuna verifica geografica reale.', 'badge'));
    if (returnTo === 'planner') actions(main, button('Torna al piano', () => nav.go('planner')));
    main.append(node('p', 'Posizione non disponibile: luogo DEMO senza coordinate verificate.', 'field-hint'));
    actions(main, button('Torna ai luoghi', () => nav.go('places')), button('Aggiungi al piano', () => add('place', id), true), button('Living Twin · contenuto demo', () => nav.go('twin', {id, returnTo})));
  }
  function realPlace({id,returnTo}) {
    const record=data.getRealPlace(id);if(!record){nav.error('Luogo importato non disponibile.');return;}
    const main=page(record.name,'Dato importato da fonte aperta · controllo documentale');
    append(main,node('p',record.metadata.address || 'Indirizzo non fornito'),node('p',record.metadata.verificationScope),node('p','Fonte: Comune di Trento · CC BY 4.0 · acquisito 19/11/2026. Nessun orario o disponibilità verificato.'));
    const position=data.geographicPosition('real',id);
    if(position){const link=node('a','Apri posizione da fonte ufficiale in OpenStreetMap ↗');link.href='https://www.openstreetmap.org/?mlat='+position[1]+'&mlon='+position[0]+'#map=18/'+position[1]+'/'+position[0];link.target='_blank';link.rel='noopener';main.append(link);}
    const source=node('a','Consulta la fonte comunale');source.href=record.metadata.source;source.target='_blank';source.rel='noopener';main.append(source);
    main.append(node('p','Living Twin non disponibile: nessun contenuto con relazione e diritti verificati.'));
    actions(main,button('Aggiungi luogo reale al piano',()=>add('real',id)),button('Torna ai luoghi',()=>nav.go('places')));
    if(returnTo==='planner')actions(main,button('Torna al piano',()=>nav.go('planner')));
  }
  function add(kind, id) {try {data.planner.add(kind, id);nav.go('planner', {message: 'Tappa aggiunta al piano locale.'});} catch (error) {nav.go('planner', {message: error.message});}}
  function planner({ message = '' } = {}) {
    const main = page('Pianifica una visita', 'Life Planner · logica deterministica');
    append(main, node('p', 'Organizza fino a 12 tappe: luoghi importati e contenuti DEMO distinti. Gli orari sono scelti da te: nessun calcolo di tragitto, durata, apertura o disponibilità. Nessuna AI generativa.', 'lead'), node('p', 'Stato solo nella memoria della pagina. Nessun salvataggio permanente o dato personale; il ricaricamento cancella il piano.'));
    if (message) {const feedback = node('p', message, 'feedback');feedback.setAttribute('role', 'status');main.append(feedback);announce(message);}
    const planned = data.planner.all();
    const choices = [...data.search().records.map(r => ({kind: 'place', record: r})), ...app.state.published().map(r => ({kind: 'merchant', record: r})), ...data.realPlaces.map(r => ({kind:'real',record:r}))].filter(choice => !planned.some(step => step.kind === choice.kind && step.targetId === choice.record.id));
    const form = node('form');const select = field(form, 'planner-target', 'Scegli una tappa: fonte aperta o DEMO', node('select'));
    choices.forEach((choice,index) => {const option = node('option', choice.record.name + (choice.kind === 'real' ? ' · FONTE APERTA' : ' · DEMO') + ' · ' + (choice.kind === 'place' ? 'luogo' : 'merchant'));option.value = String(index);select.append(option);});select.value = '0';
    if (!choices.length) main.append(node('p', 'Tutte le tappe disponibili sono già nel piano. Puoi modificarle o rimuoverle sotto.', 'feedback'));
    const time = field(form, 'planner-time', 'Orario scelto da te (facoltativo)', node('input'));time.type = 'time';
    const submit = node('button', 'Aggiungi tappa', 'primary');submit.type = 'submit';submit.disabled = choices.length === 0 || planned.length >= 12;form.append(submit);
    form.addEventListener('submit', event => {event.preventDefault();const choice = choices[Number(select.value)];try {if (!choice) throw new Error('Scegli una tappa disponibile.');data.planner.add(choice.kind, choice.record.id, time.value);nav.go('planner', {message: 'Tappa aggiunta.'});}catch(error){nav.go('planner', {message: error.message});}});main.append(form);
    const steps = data.planner.all();
    if (!steps.length) main.append(node('p', 'Il piano è vuoto. Aggiungi un luogo o una bottega DEMO.', 'empty-state'));
    const list = node('ol');
    steps.forEach((step,index) => {
      const item = node('li', undefined, 'card'), label = step.record?.name || 'Tappa non più disponibile';
      append(item, node('h2', label), node('p', step.available ? (step.kind === 'real' ? 'Fonte aperta · coordinate documentali · nessuna prenotazione' : 'DEMO · senza coordinate · nessuna prenotazione') : 'Scheda sospesa o non disponibile', 'badge'));
      const edit = field(item, 'step-time-' + step.id, 'Orario per ' + label, node('input'));edit.type = 'time';edit.value = step.time;
      const up = button('Sposta su: ' + label, () => {data.planner.move(step.id, -1);nav.go('planner', {message: 'Ordine aggiornato.'});});up.disabled = index === 0;
      const down = button('Sposta giù: ' + label, () => {data.planner.move(step.id, 1);nav.go('planner', {message: 'Ordine aggiornato.'});});down.disabled = index === steps.length - 1;
      actions(item, button('Aggiorna orario: ' + label, () => {try {data.planner.setTime(step.id, edit.value);nav.go('planner', {message: 'Orario aggiornato, non verificato con disponibilità reali.'});}catch(error){nav.go('planner', {message:error.message});}}), up, down,
        button('Rimuovi: ' + label, () => {data.planner.remove(step.id);nav.go('planner', {message: 'Tappa rimossa.'});}));
      if (step.available) actions(item, button('Apri tappa: ' + label, () => nav.go(step.kind === 'real' ? 'real-place' : step.kind === 'place' ? 'place' : 'profile', {id: step.targetId, returnTo: 'planner'})));
      list.append(item);
    });main.append(list);
    actions(main, button('Svuota piano', () => {data.planner.reset();nav.go('planner', {message: 'Piano svuotato.'});}), button('Esplora luoghi', () => nav.go('places')), button('Esplora botteghe', () => nav.go('catalog')));
  }
  function twin({id, returnTo}) {
    const record = data.getPlace(id);if (!record) {nav.error('Contenuto non disponibile.');return;}
    const media = data.mediaFor(id)[0];
    if (!media || media.targetKey !== data.reference('place', id)?.key) {nav.error('Nessuna relazione documentata per questo contenuto.');return;}
    const main = page('Living Twin · ' + record.name, 'Contenuto dimostrativo, non gemello digitale reale');
    const art = node('div', undefined, 'merchant-art art-0');art.setAttribute('role', 'img');art.setAttribute('aria-label', 'Segno grafico astratto, non una fotografia del luogo');main.append(art);
    append(main, node('p', record.description || 'Dato importato dal Comune di Trento · CC BY 4.0'), node('p', 'Fonte: ' + record.source.origin), node('p', 'Attribuzione: ' + media.attribution), node('p', media.rights), node('p', media.relation), node('p', 'Nessuna fotografia o acquisizione esterna. Questo placeholder non documenta condizioni attuali, eventi o una ricostruzione reale.', 'badge'));
    actions(main, button('Torna al luogo', () => nav.go('place', {id, returnTo})));
  }
  nav.registerRoute('real-place',realPlace);
  nav.registerRoute('places', places);nav.registerRoute('place', place);nav.registerRoute('planner', planner);nav.registerRoute('twin', twin);
  nav.registerModule({id:'places', label:'Luoghi DEMO',entry:'places',version:'0.4.0-mvp'});
  nav.registerModule({id:'life-planner',label:'Planner locale deterministico',entry:'planner',version:'0.4.0-mvp'});
  app.discovery = Object.freeze({showReal:(query='',category='')=>{filters.mode='real';filters.district='';nav.go('places',{query,category});},add,reset: () => {filters.query='';filters.category='';filters.selectedId=null;filters.district='';filters.mode='real';data.planner.reset();}});
})();
