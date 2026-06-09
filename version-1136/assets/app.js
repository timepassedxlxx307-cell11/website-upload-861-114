(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");
  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterAreas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));
  filterAreas.forEach(function (area) {
    var searchInput = area.querySelector("[data-card-search]");
    var yearSelect = area.querySelector("[data-year-filter]");
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var applyFilter = function () {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      cards.forEach(function (card) {
        var text = card.getAttribute("data-haystack") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear));
      });
    };
    if (searchInput) {
      if (searchInput.hasAttribute("data-search-page")) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q) {
          searchInput.value = q;
        }
      }
      searchInput.addEventListener("input", applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
    applyFilter();
  });
})();

function initMoviePlayer(url, videoId, buttonId, coverId) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  var ready = false;
  var requested = false;
  var hlsInstance = null;

  if (!video) {
    return;
  }

  var hideLayer = function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
    if (button) {
      button.classList.add("is-hidden");
    }
  };

  var prepare = function () {
    if (ready) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        if (requested) {
          video.play().catch(function () {});
        }
      });
    } else {
      video.src = url;
    }
    ready = true;
  };

  var play = function () {
    requested = true;
    hideLayer();
    prepare();
    video.play().catch(function () {});
  };

  if (button) {
    button.addEventListener("click", play);
  }
  if (cover) {
    cover.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", hideLayer);
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
