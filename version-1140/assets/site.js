(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      button.textContent = menu.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(parseInt(dot.getAttribute("data-hero-dot"), 10));
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function uniqueValues(cards, attribute) {
    var values = [];

    cards.forEach(function (card) {
      var value = card.getAttribute(attribute);

      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });

    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

    panels.forEach(function (panel) {
      var list = document.querySelector("[data-filter-list]");

      if (!list) {
        return;
      }

      var input = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var reset = panel.querySelector("[data-filter-reset]");
      var empty = document.querySelector("[data-filter-empty]");
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      fillSelect(region, uniqueValues(cards, "data-region"));
      fillSelect(type, uniqueValues(cards, "data-type"));
      fillSelect(year, uniqueValues(cards, "data-year"));

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchRegion = !regionValue || card.getAttribute("data-region") === regionValue;
          var matchType = !typeValue || card.getAttribute("data-type") === typeValue;
          var matchYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var match = matchKeyword && matchRegion && matchType && matchYear;

          card.hidden = !match;

          if (match) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, region, type, year].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });

      if (reset) {
        reset.addEventListener("click", function () {
          if (input) {
            input.value = "";
          }

          if (region) {
            region.value = "";
          }

          if (type) {
            type.value = "";
          }

          if (year) {
            year.value = "";
          }

          apply();
        });
      }

      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".video-player[data-play-url]"));

    players.forEach(function (video) {
      var wrap = video.closest(".video-wrap");
      var cover = wrap ? wrap.querySelector("[data-player-cover]") : null;
      var streamUrl = video.getAttribute("data-play-url");
      var hls = null;
      var attached = false;

      function attach() {
        if (attached || !streamUrl) {
          return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        attach();

        if (cover) {
          cover.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
