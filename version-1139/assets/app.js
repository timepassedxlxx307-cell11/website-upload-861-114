(function () {
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $all(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function initMenu() {
        const button = $(".menu-toggle");
        const panel = $(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            const open = panel.classList.toggle("is-open");
            button.setAttribute("aria-expanded", String(open));
            button.textContent = open ? "×" : "☰";
        });
    }

    function initHero() {
        const hero = $(".hero");
        if (!hero) {
            return;
        }
        const slides = $all(".hero-slide", hero);
        const dots = $all(".hero-dot", hero);
        const prev = $(".hero-prev", hero);
        const next = $(".hero-next", hero);
        if (!slides.length) {
            return;
        }
        let index = slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        });
        if (index < 0) {
            index = 0;
        }

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function initFilter() {
        const panel = $(".filter-panel");
        const cards = $all(".movie-card");
        if (!panel || !cards.length) {
            return;
        }
        const searchInput = $(".js-card-search", panel);
        const yearSelect = $(".js-filter-year", panel);
        const regionSelect = $(".js-filter-region", panel);
        const genreSelect = $(".js-filter-genre", panel);
        const empty = $(".empty-state");
        const params = new URLSearchParams(window.location.search);
        const q = params.get("q") || "";
        if (searchInput && q) {
            searchInput.value = q;
        }

        function normalize(value) {
            return (value || "").toString().trim().toLowerCase();
        }

        function filterCards() {
            const query = normalize(searchInput ? searchInput.value : "");
            const year = normalize(yearSelect ? yearSelect.value : "");
            const region = normalize(regionSelect ? regionSelect.value : "");
            const genre = normalize(genreSelect ? genreSelect.value : "");
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-keywords"),
                    card.textContent
                ].join(" "));
                const cardYear = normalize(card.getAttribute("data-year"));
                const cardRegion = normalize(card.getAttribute("data-region"));
                const cardGenre = normalize(card.getAttribute("data-genre") + " " + card.getAttribute("data-keywords") + " " + card.textContent);
                const matched = (!query || haystack.indexOf(query) !== -1) &&
                    (!year || cardYear === year) &&
                    (!region || cardRegion === region) &&
                    (!genre || cardGenre.indexOf(genre) !== -1);
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [searchInput, yearSelect, regionSelect, genreSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filterCards);
                control.addEventListener("change", filterCards);
            }
        });
        filterCards();
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilter();
    });
}());
