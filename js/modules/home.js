'use strict';
(() => {
 const app=window.AICity,{node,append,button,actions,page,field,announce}=app.ui;
 app.navigation.registerRoute('intro',()=>{
  const city=app.cities.active,main=page('Esplora Trento','AI CITY · versione sperimentale');main.classList.add('home-page');
  const hero=node('section',undefined,'hero'),title=main.querySelector('h1'),eyebrow=main.querySelector('.eyebrow');
  append(hero,eyebrow,title,node('p','112 luoghi dal Comune di Trento, una mappa da esplorare e un piano di visita da costruire. Informazioni da fonte aperta: nessun sopralluogo o disponibilità in tempo reale.','lead'));
  const landscape=node('div',undefined,'landscape');landscape.setAttribute('role','img');landscape.setAttribute('aria-label',city.cover.label);append(landscape,node('span',undefined,'landscape-sun'),node('span',undefined,'landscape-ridge'),node('span',undefined,'landscape-village'));append(hero,landscape,node('p','Paesaggio astratto · nessuna fotografia reale','art-caption'));
  const form=node('form',undefined,'home-search');form.setAttribute('role','search');form.setAttribute('aria-label','Cerca un luogo reale');
  const input=node('input');input.type='search';input.maxLength=180;input.placeholder='Biblioteca, nido, luogo…';input.enterKeyHint='search';
  field(form,'home-query','Cerca un luogo',input,'Ricerca nei luoghi dalla fonte comunale. Le botteghe inventate sono nella sezione DEMO separata.');const submit=node('button','Cerca','primary');submit.type='submit';form.append(submit);form.addEventListener('submit',event=>{event.preventDefault();app.discovery.showReal(input.value);});hero.append(form);main.append(hero);
  actions(main,button('Mappa della città',()=>app.discovery.showReal(),true),button('Luoghi reali',()=>app.discovery.showReal()),button('Pianifica una visita',()=>app.navigation.go('planner')));
  const categories=node('section',undefined,'home-categories');categories.setAttribute('aria-labelledby','categories-title');const heading=node('h2','Esplora per categoria');heading.id='categories-title';categories.append(heading);const grid=node('div',undefined,'category-grid');
  for(const [label,value] of [['Biblioteche','Biblioteca'],['Nidi comunali','Asilo nido'],['Spazi e strutture','Infrastrutture e impianti'],['Cimiteri','Cimitero']]){const tile=button('',()=>app.discovery.showReal('',value));tile.className='category-tile';append(tile,node('span',label,'category-name'),node('span','Fonte Comune di Trento','category-status'));grid.append(tile);}categories.append(grid);main.append(categories);
  const featured=node('section',undefined,'featured');append(featured,node('h2','Luoghi da esplorare'));const cards=node('div',undefined,'featured-grid');
  app.content.realPlaces.slice(0,2).forEach((record,index)=>{const card=node('article',undefined,'featured-card'),art=node('div',undefined,'merchant-art art-'+index);art.setAttribute('aria-hidden','true');append(art,node('span',record.category,'art-tag'),node('span','Illustrazione astratta','art-note'));const body=node('div',undefined,'featured-body');append(body,node('h3',record.name),node('p','Comune di Trento · CC BY 4.0'));actions(body,button('Scopri il luogo: '+record.name,()=>app.navigation.go('real-place',{id:record.id}),true));append(card,art,body);cards.append(card);});featured.append(cards);main.append(featured);
  const notice=node('section',undefined,'scenario-panel');append(notice,node('h2','Dati aperti, limiti trasparenti'),node('p','Catalogo parziale di 112 luoghi importati il 19 novembre 2026. Coordinate e informazioni dalla fonte comunale; nessun orario verificato sul posto, nessuna prenotazione. Tile OpenStreetMap solo su tua scelta. Nessuna adesione commerciale implicita.'));main.append(notice);
  actions(main,button('Botteghe DEMO · sezione sperimentale',()=>app.navigation.go('catalog')),button('Gestione DEMO · simulazione',()=>app.navigation.go('editorial')));title.focus();announce('Esplora Trento: 112 luoghi da fonte comunale.');
 });
})();
