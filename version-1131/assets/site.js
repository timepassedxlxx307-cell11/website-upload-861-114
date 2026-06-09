(function () {
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initCovers() {
    document.querySelectorAll('img[data-cover]').forEach(function (img) {
      img.addEventListener('error', function () {
        img.remove();
      }, { once: true });
    });
  }

  function initSliders() {
    document.querySelectorAll('[data-slider]').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
      if (slides.length < 2) {
        return;
      }
      var current = 0;
      var timer = null;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }
      function play() {
        clearInterval(timer);
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
          play();
        });
      });
      slider.addEventListener('mouseenter', function () {
        clearInterval(timer);
      });
      slider.addEventListener('mouseleave', play);
      show(0);
      play();
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      if (!buttons.length || !cards.length) {
        return;
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var value = button.getAttribute('data-filter-value');
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          cards.forEach(function (card) {
            var match = value === 'all' || card.getAttribute('data-type') === value || card.getAttribute('data-region') === value || card.getAttribute('data-year') === value;
            card.hidden = !match;
          });
        });
      });
    });
  }

  function initSearch() {
    var page = document.querySelector('[data-search-page]');
    if (!page) {
      return;
    }
    var input = page.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(page.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input && initial) {
      input.value = initial;
    }
    function applySearch() {
      var value = input ? input.value.trim().toLowerCase() : '';
      var terms = value.split(/\s+/).filter(Boolean);
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var match = terms.every(function (term) {
          return text.indexOf(term) !== -1;
        });
        card.hidden = !match;
      });
    }
    if (input) {
      input.addEventListener('input', applySearch);
      var form = input.closest('form');
      if (form) {
        form.addEventListener('submit', function (event) {
          event.preventDefault();
          applySearch();
        });
      }
    }
    applySearch();
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (stage) {
      var video = stage.querySelector('video[data-m3u8]');
      var button = stage.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var loaded = false;
      var hls = null;
      function loadMedia() {
        if (loaded) {
          return;
        }
        loaded = true;
        var url = video.getAttribute('data-m3u8');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }
      function start() {
        loadMedia();
        stage.classList.add('is-playing');
        var playTask = video.play();
        if (playTask && playTask.catch) {
          playTask.catch(function () {
            stage.classList.remove('is-playing');
          });
        }
      }
      button.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', function () {
        stage.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        stage.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  onReady(function () {
    initMenu();
    initCovers();
    initSliders();
    initFilters();
    initSearch();
    initPlayers();
  });
})();
