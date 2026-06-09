(function () {
  const toggle = document.querySelector('.mobile-toggle');
  const panel = document.querySelector('.mobile-panel');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    const dots = Array.from(slider.querySelectorAll('.hero-dot'));
    const prev = slider.querySelector('[data-prev]');
    const next = slider.querySelector('[data-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-go') || 0));
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  const results = document.getElementById('search-results');
  const searchBox = document.getElementById('search-box');
  const heading = document.getElementById('search-heading');

  if (results && searchBox && Array.isArray(window.SEARCH_INDEX)) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    searchBox.value = initialQuery;

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="./' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-badge">搜索</span>',
        '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
        '    <span class="poster-play">▶</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="./' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <div class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '    <p>' + escapeHtml(movie.text) + '</p>',
        '    <div class="movie-tags"><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function runSearch(query) {
      const normalized = query.trim().toLowerCase();
      if (!normalized) {
        heading.textContent = '输入关键词开始搜索';
        results.innerHTML = '';
        return;
      }

      const matched = window.SEARCH_INDEX.filter(function (movie) {
        return movie.search.includes(normalized);
      }).slice(0, 120);

      heading.textContent = '“' + query + '” 的搜索结果';

      if (!matched.length) {
        results.innerHTML = '<div class="text-panel"><h2>暂无匹配内容</h2><p>请尝试其他片名、地区、类型、年份或标签。</p></div>';
        return;
      }

      results.innerHTML = matched.map(card).join('');
    }

    searchBox.addEventListener('input', function () {
      runSearch(searchBox.value);
    });

    runSearch(initialQuery);
  }
})();
