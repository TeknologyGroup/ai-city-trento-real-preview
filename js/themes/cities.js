'use strict';
window.AICity = window.AICity || {};
(() => {
  // Configurazione editoriale locale. Nessun simbolo ufficiale o foto autorizzata disponibile.
  const trento = Object.freeze({
    id: 'trento', name: 'Trento', theme: 'trento',
    symbol: Object.freeze({ kind: 'neutral', label: 'Segno grafico neutro, non uno stemma o una bandiera ufficiale' }),
    colors: Object.freeze({ cream: '#fbf5eb', burgundy: '#854c56', forest: '#173f35', ochre: '#b58d57' }),
    cover: Object.freeze({ kind: 'css-placeholder', source: null, authorized: false, label: 'Paesaggio astratto dimostrativo, non una veduta reale di Trento' }),
    introduction: 'Esplora botteghe immaginarie e piccoli percorsi di scoperta. Una demo per avvicinarsi alla città, con semplicità.',
    merchantCategories: Object.freeze(['Cartoleria', 'Artigianato']),
    sections: Object.freeze([
      Object.freeze({ id: 'shops', label: 'Negozi e botteghe', icon: 'bag', available: true }),
      Object.freeze({ id: 'food', label: 'Mangiare e bere', icon: 'food', available: false }),
      Object.freeze({ id: 'places', label: 'Luoghi da scoprire', icon: 'place', available: true }),
      Object.freeze({ id: 'events', label: 'Eventi e attività', icon: 'calendar', available: false })
    ])
  });
  const neutral = Object.freeze({ ...trento, id: 'neutral', name: 'Città', theme: 'neutral', introduction: 'Catalogo dimostrativo con dati inventati.' });
  window.AICity.cities = Object.freeze({
    active: trento,
    list: () => [trento],
    resolve: id => id === trento.id ? trento : neutral
  });
})();
