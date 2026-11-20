'use strict';
(() => {
  const app = window.AICity;
  const { node, append, button, actions, page, field, details, announce } = app.ui;
  const { state, navigation: nav } = app;
  const find = id => {
    const record = state.get(id);
    if (!record) nav.error('Questa scheda editoriale non è disponibile. Torna alla gestione.');
    return record;
  };
  function editorial({ message = '' } = {}) {
    const main = page('Il catalogo, dietro le quinte', 'Gestione AI CITY · simulazione');
    append(main, node('p', 'Nessuna autenticazione o privilegio reale. Inserisci solo dati inventati; tutte le modifiche scompaiono al ricaricamento.', 'lead'));
    if (!state.valid) { nav.error('Dati iniziali non validi. La gestione non può essere inizializzata.'); return; }
    if (message) { main.append(node('p', message, 'feedback')); announce(message); }
    actions(main, button('Inserisci scheda fittizia', () => nav.go('editor-edit', { id: null }), true), button('Esplora catalogo', () => nav.go('catalog')));
    state.all().forEach(record => {
      const card = node('article', undefined, 'card');
      append(card, node('h2', record.name), node('p', record.status + ' · stato simulato', 'badge'));
      actions(card, button('Modifica: ' + record.name, () => nav.go('editor-edit', { id: record.id })),
        button('Anteprima: ' + record.name, () => nav.go('editor-preview', { id: record.id })));
      if (record.status === 'Pubblicata') actions(card, button('Sospendi: ' + record.name, () => {
        state.transition(record.id, 'Sospesa'); nav.go('editorial', { message: 'Scheda sospesa nella demo e rimossa dal catalogo.' });
      }));
      main.append(card);
    });
  }
  function edit({ id = null } = {}) {
    const record = id === null ? { name: 'Nuova bottega DEMO', category: 'Cartoleria', description: 'Attività interamente inventata per questa dimostrazione.', zone: 'Zona demo E', hours: 'Lun–ven 10:00–17:00. Orari fittizi.', domain: 'nuova-bottega.example' } : find(id);
    if (!record) return;
    const main = page(id === null ? 'Una nuova scheda fittizia' : 'Modifica la scheda', 'Gestione editoriale · bozza');
    append(main, node('p', 'Salvare imposta la scheda in bozza e annulla la revisione. Lasciare questa schermata senza salvare scarta i campi modificati.'));
    const form = node('form'); form.noValidate = true;
    const fields = {};
    const specs = [['name', 'Nome inventato', 100], ['category', 'Categoria', 0], ['description', 'Descrizione fittizia', 500], ['zone', 'Zona dimostrativa', 100], ['hours', 'Orari fittizi', 180], ['domain', 'Dominio .example', 100]];
    specs.forEach(([key, label, limit]) => {
      const input = node(key === 'category' ? 'select' : key === 'description' ? 'textarea' : 'input');
      if (key === 'category') state.categories.forEach(value => input.append(node('option', value)));
      if (limit) input.maxLength = limit;
      input.required = true; input.value = record[key];
      fields[key] = field(form, 'edit-' + key, label, input, key === 'domain' ? 'Solo un dominio inventato come bottega-demo.example, senza protocollo o percorso.' : undefined);
    });
    const errors = node('div', undefined, 'form-errors'); errors.setAttribute('role', 'alert'); form.append(errors);
    const save = node('button', 'Salva bozza', 'primary'); save.type = 'submit';
    actions(form, save, button('Annulla modifiche', () => nav.go('editorial')));
    form.addEventListener('submit', event => {
      event.preventDefault(); errors.replaceChildren();
      Object.values(fields).forEach(input => { input.removeAttribute('aria-invalid'); });
      const values = Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value.trim()]));
      const issues = [];
      specs.forEach(([key, label, limit]) => {
        if (!values[key]) issues.push([key, label + ': inserisci un valore fittizio.']);
        else if (limit && values[key].length > limit) issues.push([key, label + ': testo troppo lungo.']);
      });
      if (!state.categories.includes(values.category)) issues.push(['category', 'Seleziona una categoria disponibile.']);
      if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.example$/.test(values.domain)) issues.push(['domain', 'Usa soltanto un dominio fittizio .example, senza protocollo o percorso.']);
      if (issues.length) {
        append(errors, node('p', 'Correggi i campi indicati:'));
        issues.forEach(([key, text]) => { fields[key].setAttribute('aria-invalid', 'true'); errors.append(node('p', text)); });
        fields[issues[0][0]].focus(); return;
      }
      state.save(id, values); nav.go('editorial', { message: 'Bozza salvata soltanto nella memoria della pagina.' });
    });
    main.append(form);
  }
  function preview({ id }) {
    const record = find(id); if (!record) return;
    const main = page('Anteprima e revisione', 'Gestione editoriale · simulazione');
    append(main, node('h2', record.name), node('p', record.status + ' · stato simulato', 'badge'));
    details(main, record);
    if (record.status === 'Bozza' || record.status === 'Sospesa') {
      const checklist = node('fieldset'); checklist.append(node('legend', 'Controlli editoriali dichiarativi — nessuna verifica automatica'));
      const items = ['Ho usato soltanto informazioni inventate.', 'Ho controllato completezza e possibili duplicati nella demo.', 'Il dominio è fittizio e la verifica è dichiarata simulata.', 'Ho controllato chiarezza dei testi e struttura della scheda.'];
      const boxes = items.map(text => {
        const label = node('label', undefined, 'check'); const checkbox = node('input'); checkbox.type = 'checkbox';
        append(label, checkbox, node('span', text)); checklist.append(label); return checkbox;
      });
      main.append(checklist);
      const review = button('Invia in revisione', () => {
        state.transition(id, 'In revisione', boxes.every(box => box.checked)); nav.go('editor-preview', { id });
      }, true);
      review.disabled = true;
      boxes.forEach(box => box.addEventListener('change', () => { review.disabled = !boxes.every(item => item.checked); }));
      actions(main, review);
    }
    if (record.status === 'In revisione') {
      main.append(node('p', 'Checklist completata. La pubblicazione riguarda soltanto questa demo locale; non è una verifica reale.', 'feedback'));
      actions(main, button('Pubblica nella demo', () => {
        state.transition(id, 'Pubblicata'); nav.go('editorial', { message: 'Scheda pubblicata nel catalogo dimostrativo locale.' });
      }, true), button('Rimanda in bozza', () => { state.transition(id, 'Bozza'); nav.go('editor-preview', { id }); }));
    }
    actions(main, button('Torna alla gestione', () => nav.go('editorial')));
  }
  nav.registerRoute('editorial', editorial); nav.registerRoute('editor-edit', edit); nav.registerRoute('editor-preview', preview);
  nav.registerModule({ id: 'editorial', label: 'Gestione demo', entry: 'editorial', version: '0.4.0' });
})();
