'use strict';
(() => {
  const app = window.AICity;
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const append = (parent, ...children) => { parent.append(...children); return parent; };
  const button = (text, action, primary = false) => {
    const element = node('button', text, primary ? 'primary' : '');
    element.type = 'button';
    element.addEventListener('click', () => app.navigation.guard(action));
    return element;
  };
  const actions = (parent, ...buttons) => append(parent, append(node('div', undefined, 'actions'), ...buttons));
  const announce = text => { document.getElementById('announcement').textContent = text; };
  const page = (title, section) => {
    const main = document.getElementById('main');
    main.replaceChildren();
    main.classList.remove('home-page');
    const heading = node('h1', title); heading.tabIndex = -1;
    append(main, node('p', section || 'Trento · demo', 'eyebrow'), heading);
    document.title = title + ' — AI CITY Demo 0.4.0';
    heading.focus();
    window.scrollTo(0, 0);
    return main;
  };
  const field = (parent, id, label, input, hint) => {
    input.id = id;
    const title = node('label', label); title.htmlFor = id;
    append(parent, title, input);
    if (hint) {
      const help = node('p', hint, 'field-hint'); help.id = id + '-hint';
      input.setAttribute('aria-describedby', help.id); parent.append(help);
    }
    return input;
  };
  const details = (parent, record) => {
    append(parent, node('p', 'Attività interamente fittizia', 'badge'), node('p', record.description, 'lead'));
    const list = node('dl', undefined, 'details');
    [['Categoria', record.category], ['Zona inventata', record.zone], ['Orari dimostrativi', record.hours],
      ['Dominio fittizio', record.domain], ['Verifica', 'Stato simulato: nessun controllo reale eseguito'],
      ['Fonte', 'Contenuto inventato per la demo']].forEach(([label, value]) => append(list, node('dt', label), node('dd', value)));
    parent.append(list);
  };
  app.ui = { node, append, button, actions, announce, page, field, details };
})();
