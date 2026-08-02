/*
  HOME-LOADER.JS
  Construye el grid de Home leyendo las entradas del blog con la
  etiqueta "test". No hay que tocar este archivo para añadir un test
  nuevo: basta con publicar la entrada con esa etiqueta (Fase 4).

  Cada entrada debe contener, en algún punto de su cuerpo, un bloque:

    <script type="application/json" id="test-data">
      { "title": "...", "cardImage": "...", "cardDescription": "..." }
    </script>

  Ese bloque es JSON puro (sin funciones, sin comas finales) para que
  se pueda leer sin ejecutar nada.
*/
(function () {
  'use strict';

  var root = document.getElementById('home-root');
  if (!root) return;

  var isHomepage = /^\/?(index\.html)?$/.test(window.location.pathname);
  if (!isHomepage) {
    root.remove();
    return;
  }

  var GRID_ID = 'home-grid';
  var LABEL = 'test';
  var FEED_URL = '/feeds/posts/default/-/' + LABEL + '?alt=json&max-results=150';

  function extractTestData(rawHtml) {
    if (!rawHtml) return null;
    var match = rawHtml.match(/<script[^>]*id=["']test-data["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!match) return null;
    try {
      return JSON.parse(match[1]);
    } catch (err) {
      console.warn('[home-loader] Bloque test-data inválido en una entrada:', err);
      return null;
    }
  }

  function getPermalink(entry) {
    var links = entry.link || [];
    for (var i = 0; i < links.length; i++) {
      if (links[i].rel === 'alternate') return links[i].href;
    }
    return '#';
  }

  function buildCard(test, url) {
    var a = document.createElement('a');
    a.className = 'card test-card';
    a.href = url;

    var title = test.title || 'Test';
    var desc = test.cardDescription || '';
    var image = '';

    if (test.cardImage) {
      image =
        '<div class="test-card__image-wrap">' +
          '<img class="test-card__image" src="' + test.cardImage + '" alt="" loading="lazy" width="400" height="240">' +
        '</div>';
    }

    a.innerHTML =
      image +
      '<div class="test-card__body">' +
        '<h3 class="test-card__title">' + title + '</h3>' +
        '<p class="test-card__desc">' + desc + '</p>' +
        '<span class="btn btn-primary btn-block">Comenzar</span>' +
      '</div>';

    return a;
  }

  function showMessage(grid, text) {
    grid.innerHTML = '<p class="home-empty">' + text + '</p>';
  }

  function render(entries) {
    var grid = document.getElementById(GRID_ID);
    if (!grid) return;

    if (!entries.length) {
      showMessage(grid, 'Muy pronto habrá tests disponibles. Vuelve pronto.');
      return;
    }

    var fragment = document.createDocumentFragment();

    entries.forEach(function (entry) {
      var data = extractTestData(entry.content && entry.content.$t);
      if (!data) return;
      fragment.appendChild(buildCard(data, getPermalink(entry)));
    });

    if (!fragment.childNodes.length) {
      showMessage(grid, 'Muy pronto habrá tests disponibles. Vuelve pronto.');
      return;
    }

    grid.innerHTML = '';
    grid.appendChild(fragment);
  }

  fetch(FEED_URL)
    .then(function (res) { return res.json(); })
    .then(function (json) {
      var entries = (json.feed && json.feed.entry) || [];
      render(entries);
    })
    .catch(function (err) {
      console.error('[home-loader] No se pudieron cargar los tests:', err);
      var grid = document.getElementById(GRID_ID);
      if (grid) showMessage(grid, 'No se pudieron cargar los tests. Actualiza la página.');
    });
})();
