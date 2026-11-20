'use strict';
(() => {
  const { node, append, button } = window.AICity.ui;
  let activeReal = null;
  window.AICity.cityMap = Object.freeze({
    destroyReal() { if (activeReal) {activeReal.remove();activeReal = null;} },
    geographic() {
      const section = node('section', undefined, 'geo-section');section.setAttribute('aria-label', 'Cartografia reale di Trento');
      append(section, node('h2', 'Trento sulla mappa'), node('p', 'Cartografia OpenStreetMap reale. Le botteghe e i luoghi DEMO elencati sotto non sono posizionati su questa mappa. Nessun GPS o itinerario calcolato.'));
      const attribution = node('a', '© OpenStreetMap contributors · dati ODbL');attribution.href = 'https://www.openstreetmap.org/copyright';attribution.target = '_blank';attribution.rel = 'noopener';
      const external = node('a', 'Apri in OpenStreetMap ↗');external.href = 'https://www.openstreetmap.org/#map=14/46.067/11.121';external.target = '_blank';external.rel = 'noopener';
      const privacy = node('p', 'Caricando la mappa contatti il servizio tile OpenStreetMap: riceve IP e informazioni tecniche del browser. Servizio best-effort, non garantito e non illimitato. Puoi usare i luoghi DEMO senza caricarlo.', 'field-hint');
      const host = node('div');host.className = 'geo-frame';host.id='real-trento-map';host.setAttribute('aria-label','Mappa Trento: trascina, usa zoom o frecce da tastiera');
      const status = node('p', 'Mappa non caricata. Il collegamento esterno e l’elenco DEMO restano disponibili.', 'field-hint');status.setAttribute('role','status');
      const load = button('Carica mappa OpenStreetMap', () => {
        if (activeReal) return;
        if (!window.L) {status.textContent='Libreria cartografica non disponibile. Usa Apri in OpenStreetMap o la lista DEMO.';return;}
        try {
          activeReal = window.L.map(host, {scrollWheelZoom:false, touchZoom:true, keyboard:true, minZoom:10, maxZoom:18}).setView([46.067,11.121],14);
          window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom:18, referrerPolicy:'strict-origin-when-cross-origin',
            attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · ODbL'
          }).on('tileerror', () => {status.textContent='Alcune parti della mappa non sono disponibili. Usa il link OSM o la lista DEMO.';})
            .on('load', () => {status.textContent='Caricamento tile terminato. Se mancano parti, usa il link OSM. Nessun luogo DEMO è geolocalizzato.';}).addTo(activeReal);
          load.disabled = true;
        } catch (_) {
          if (activeReal) {activeReal.remove();activeReal=null;}
          status.textContent='Mappa non disponibile. Usa il collegamento esterno o la lista DEMO.';
        }
      });
      append(section, privacy, attribution);const links=node('p');links.append(external);section.append(links);section.append(load);append(section, status, host);
      return section;
    },
    create(onSelect, { prefix = 'merchant-' } = {}) {
      const section = node('section', undefined, 'map-section');
      section.setAttribute('aria-labelledby', 'map-title');
      const title = node('h2', 'Mappa dimostrativa, non geografica'); title.id = 'map-title';
      const disclosure = node('details');
      const summary = node('summary', 'Mostra o nascondi lo schema');
      const host = node('div', undefined, 'map');
      const markers = new Map();
      let entries = [], selected = null, rendered = false;
      const paint = () => {
        host.replaceChildren(); markers.clear();
        append(host, node('p', 'Schema delle sole schede DEMO, senza coordinate. Non rappresenta posizioni reali né la geografia di Trento.'));
        const pins = node('div', undefined, 'pins');
        entries.forEach((record, index) => {
          const marker = button((index + 1) + ' · ' + record.name, () => onSelect(record));
          marker.classList.add('pin');marker.setAttribute('aria-controls', prefix + record.id);
          marker.setAttribute('aria-pressed', String(selected === record.id));
          markers.set(record.id, marker);pins.append(marker);
        });
        host.append(pins);rendered = true;
      };
      append(disclosure, summary, host); append(section, title, disclosure);
      disclosure.addEventListener('toggle', () => { if (disclosure.open && !rendered) paint(); });
      return {
        element: section,
        update(records) { entries = records.slice();rendered = false;if (disclosure.open) paint(); },
        select(id) { selected = id;markers.forEach((marker, key) => marker.setAttribute('aria-pressed', String(key === id))); }
      };
    }
  });
})();
