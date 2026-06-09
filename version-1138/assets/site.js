(function() {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function() {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                showSlide(current + 1);
            }, 5000);
        }

        if (previous) {
            previous.addEventListener('click', function() {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');

    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

        filterInput.addEventListener('input', function() {
            var query = filterInput.value.trim().toLowerCase();

            cards.forEach(function(card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();

                card.style.display = !query || haystack.indexOf(query) !== -1 ? '' : 'none';
            });
        });
    }

    var searchResults = document.querySelector('[data-search-results]');

    if (searchResults && window.MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = (params.get('q') || '').trim();
        var searchInput = document.querySelector('[data-search-page-input]');

        if (searchInput) {
            searchInput.value = queryValue;
        }

        function normalize(value) {
            return String(value || '').toLowerCase();
        }

        function renderResults(items) {
            if (!items.length) {
                searchResults.innerHTML = '<div class="no-results">没有找到匹配的影视作品，可以换一个关键词继续搜索。</div>';
                return;
            }

            searchResults.innerHTML = items.slice(0, 120).map(function(movie) {
                var tags = (movie.tags || []).slice(0, 3).map(function(tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');

                return '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '">' +
                    '<a href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">' +
                        '<div class="movie-thumb" style="background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.02), rgba(15, 23, 42, 0.88)), url(\'' + movie.cover + '\');">' +
                            '<span class="movie-badge">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</span>' +
                            '<span class="movie-year">' + escapeHtml(movie.year) + '</span>' +
                        '</div>' +
                        '<div class="movie-info">' +
                            '<h3>' + escapeHtml(movie.title) + '</h3>' +
                            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                            '<div class="tag-row">' + tags + '</div>' +
                        '</div>' +
                    '</a>' +
                '</article>';
            }).join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        var sourceItems = window.MOVIES;

        if (queryValue) {
            var q = normalize(queryValue);
            sourceItems = window.MOVIES.filter(function(movie) {
                return normalize(movie.title).indexOf(q) !== -1 ||
                    normalize(movie.region).indexOf(q) !== -1 ||
                    normalize(movie.type).indexOf(q) !== -1 ||
                    normalize(movie.year).indexOf(q) !== -1 ||
                    normalize(movie.genre).indexOf(q) !== -1 ||
                    normalize((movie.tags || []).join(' ')).indexOf(q) !== -1 ||
                    normalize(movie.oneLine).indexOf(q) !== -1;
            });
        } else {
            sourceItems = window.MOVIES.slice(0, 40);
        }

        renderResults(sourceItems);
    }
})();
