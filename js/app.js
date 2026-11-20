'use strict';
(() => {
  const app = window.AICity;
  if (!app || !app.state || !app.ui || !app.navigation || !app.cities) return;
  document.documentElement.dataset.city = app.cities.active.theme;
  const nav = app.navigation;
  const home = document.getElementById('home'), explore = document.getElementById('explore'), manage = document.getElementById('manage');
  home.dataset.nav = 'intro';explore.dataset.nav = 'catalog';manage.dataset.nav = 'editorial';
  const places = document.getElementById('places-nav'), planner = document.getElementById('planner-nav');
  places.dataset.nav = 'places';planner.dataset.nav = 'planner';
  const closeMenu = () => { const menu = document.querySelector('.compact-menu');if(menu)menu.open=false; };
  home.addEventListener('click', () => {closeMenu();nav.go('intro');});
  explore.addEventListener('click', () => {closeMenu();nav.go('catalog');});
  places.addEventListener('click', () => {closeMenu();nav.go('places');});
  planner.addEventListener('click', () => {closeMenu();nav.go('planner');});
  manage.addEventListener('click', () => nav.go('editorial'));
  document.getElementById('city-selector').addEventListener('change', event => {
    event.target.value = app.cities.active.id;
    app.ui.announce('Solo Trento è disponibile nella demo.');
  });
  document.getElementById('reset').addEventListener('click', () => {
    app.state.reset();app.discovery.reset();closeMenu();nav.go('intro');app.ui.announce('Demo ripristinata. Schede e filtri sono tornati allo stato iniziale.');
  });
  window.addEventListener('error', () => nav.error('Si è verificato un errore locale. Ricarica la pagina e verifica che tutti i file siano presenti.'));
  nav.go('intro');
})();
