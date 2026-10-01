(function () {
  var normalizar = function (s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  };
  var escapar = function (s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  var consulta = (new URLSearchParams(location.search).get('q') || '').trim();
  var campo = document.querySelector('.buscador input');
  var cont = document.getElementById('resultados');
  if (campo) campo.value = consulta;

  var terminos = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (!terminos.length) {
    cont.innerHTML = '<p>Escribe un texto en el buscador para encontrar contenido en el sitio.</p>';
    return;
  }

  // Resalta los términos dentro de un fragmento de texto
  function resaltar(texto) {
    var norm = normalizar(texto);
    var marcas = [];
    terminos.forEach(function (t) {
      var i = norm.indexOf(t);
      while (i !== -1) { marcas.push([i, i + t.length]); i = norm.indexOf(t, i + t.length); }
    });
    marcas.sort(function (a, b) { return a[0] - b[0]; });
    var html = '', pos = 0;
    marcas.forEach(function (m) {
      if (m[0] < pos) return;
      html += escapar(texto.slice(pos, m[0])) + '<mark>' + escapar(texto.slice(m[0], m[1])) + '</mark>';
      pos = m[1];
    });
    return html + escapar(texto.slice(pos));
  }

  function fragmento(texto) {
    var norm = normalizar(texto);
    var inicio = norm.indexOf(terminos[0]);
    var desde = Math.max(0, inicio - 80);
    var hasta = Math.min(texto.length, inicio + 220);
    return (desde > 0 ? '… ' : '') + texto.slice(desde, hasta) + (hasta < texto.length ? ' …' : '');
  }

  var encontrados = (window.INDICE_BUSQUEDA || []).map(function (p) {
    var normTexto = normalizar(p.titulo + ' ' + p.texto);
    var puntos = 0;
    var todos = terminos.every(function (t) {
      var n = normTexto.split(t).length - 1;
      puntos += n;
      return n > 0;
    });
    return todos ? { pagina: p, puntos: puntos } : null;
  }).filter(Boolean).sort(function (a, b) { return b.puntos - a.puntos; });

  if (!encontrados.length) {
    cont.innerHTML = '<p>No se encontraron resultados para <strong>' + escapar(consulta) + '</strong>.</p>';
    return;
  }

  var n = encontrados.length;
  cont.innerHTML = '<p class="resumen">' + n + (n === 1 ? ' resultado' : ' resultados') +
    ' para <strong>' + escapar(consulta) + '</strong></p>' +
    encontrados.map(function (r) {
      return '<article class="resultado"><h3><a href="' + r.pagina.url + '">' + escapar(r.pagina.titulo) + '</a></h3>' +
        '<p>' + resaltar(fragmento(r.pagina.texto)) + '</p></article>';
    }).join('');
})();
