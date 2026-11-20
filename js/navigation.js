'use strict';
(() => {
  const app = window.AICity;
  const routes = new Map();
  const modules = new Map();
  let current = { name: 'intro', params: {} };
  const error = message => {
    current = { name: 'error', params: {} };
    document.querySelectorAll('[data-nav]').forEach(button => button.removeAttribute('aria-current'));
    const ui = app.ui;
    const main = ui.page('Riprendiamo da qui', 'Recupero della navigazione');
    ui.append(main, ui.node('p', message, 'error-panel'), ui.node('p', 'Le modifiche restano soltanto in questa pagina. Il ripristino elimina tutte le modifiche simulate.'));
    ui.actions(main, ui.button('Torna all’introduzione', () => go('intro'), true), ui.button('Esplora le attività', () => go('catalog')));
  };
  const guard = action => {
    try { action(); }
    catch (_) { error('Non è stato possibile completare questa azione. Torna a una schermata disponibile o ripristina la demo.'); }
  };
  const go = (name, params = {}) => {
    if (app.cityMap) app.cityMap.destroyReal();
    const handler = routes.get(name);
    if (!handler) { error('Questa schermata non è disponibile nella demo.'); return; }
    current = { name, params };
    document.querySelectorAll('[data-nav]').forEach(button => {
      const active = (name === 'catalog' || name === 'profile' || name === 'verification' || name === 'external' || name === 'contact') ? 'catalog' : ['places','place','real-place','twin'].includes(name) ? 'places' : name.startsWith('editor') ? 'editorial' : name;
      if (button.dataset.nav === active) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    guard(() => handler(params));
  };
  app.navigation = {
    go, guard, error,
    registerRoute: (name, render) => {
      if (routes.has(name) || typeof render !== 'function') throw new Error('Registrazione schermata non valida.');
      routes.set(name, render);
    },
    registerModule: descriptor => {
      if (!descriptor || !descriptor.id || modules.has(descriptor.id)) throw new Error('Modulo non valido.');
      if (!routes.has(descriptor.entry)) throw new Error('Schermata iniziale del modulo assente.');
      modules.set(descriptor.id, Object.freeze({ ...descriptor }));
    },
    modules: () => Array.from(modules.values()),
    current: () => ({ name: current.name, params: { ...current.params } })
  };
})();
