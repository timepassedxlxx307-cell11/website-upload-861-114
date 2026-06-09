(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "./search.html?q=" + encodeURIComponent(query);
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var heroIndex = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === heroIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === heroIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showHero(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(heroIndex + 1);
      }, 5600);
    }

    var filterPanel = document.querySelector("[data-filter-panel]");

    if (filterPanel) {
      var keyword = filterPanel.querySelector("[data-card-search]");
      var year = filterPanel.querySelector("[data-year-filter]");
      var type = filterPanel.querySelector("[data-type-filter]");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

      function applyFilter() {
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region")
          ].join(" ").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }
          if (t && card.getAttribute("data-type") !== t) {
            ok = false;
          }
          card.classList.toggle("is-hidden-card", !ok);
        });
      }

      [keyword, year, type].forEach(function (item) {
        if (item) {
          item.addEventListener("input", applyFilter);
          item.addEventListener("change", applyFilter);
        }
      });
    }

    var searchForm = document.querySelector("[data-search-page-form]");
    var resultBox = document.querySelector("[data-search-results]");
    var resultTitle = document.querySelector("[data-search-title]");

    if (searchForm && resultBox && window.SiteSearchData) {
      var input = searchForm.querySelector("input[name='q']");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";

      if (input) {
        input.value = initial;
      }

      function cardTemplate(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class=\"movie-card\">" +
          "<a class=\"poster-wrap\" href=\"" + item.url + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">" +
          "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-shade\"></span>" +
          "<span class=\"play-pill\">立即观看</span>" +
          "</a>" +
          "<div class=\"card-body\">" +
          "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>" +
          "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.region) + "</span></div>" +
          "<p>" + escapeHtml(item.oneLine) + "</p>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
          "</div>" +
          "</article>";
      }

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"]/g, function (char) {
          return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;"
          }[char];
        });
      }

      function runSearch(value) {
        var query = (value || "").trim().toLowerCase();
        var source = window.SiteSearchData;
        var results = source.filter(function (item) {
          if (!query) {
            return true;
          }
          var hay = [item.title, item.year, item.type, item.region, item.genre, item.category, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase();
          return hay.indexOf(query) !== -1;
        }).slice(0, 80);
        resultTitle.textContent = query ? "搜索结果" : "热门内容";
        resultBox.innerHTML = results.map(cardTemplate).join("");
      }

      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        runSearch(input ? input.value : "");
      });

      runSearch(initial);
    }
  });
})();
