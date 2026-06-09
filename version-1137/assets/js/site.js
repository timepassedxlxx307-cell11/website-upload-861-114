(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
            }
        });
    });

    function text(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var panel = document.querySelector('[data-filter-panel]');
        var grid = document.querySelector('[data-card-grid]');
        if (!panel || !grid) {
            return;
        }

        var input = panel.querySelector('[data-filter-input]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');

        function apply() {
            var q = text(input && input.value);
            var y = text(year && year.value);
            var r = text(region && region.value);
            var t = text(type && type.value);
            var shown = 0;

            cards.forEach(function (card) {
                var matches = true;
                var haystack = text(card.getAttribute('data-search'));
                if (q && haystack.indexOf(q) === -1) {
                    matches = false;
                }
                if (y && text(card.getAttribute('data-year')) !== y) {
                    matches = false;
                }
                if (r && text(card.getAttribute('data-region')) !== r) {
                    matches = false;
                }
                if (t && text(card.getAttribute('data-type')) !== t) {
                    matches = false;
                }
                card.hidden = !matches;
                if (matches) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        [input, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    function loadPlayer(shell) {
        if (!shell || shell.getAttribute('data-ready') === '1') {
            return;
        }
        var video = shell.querySelector('video');
        var src = shell.getAttribute('data-stream');
        var message = shell.querySelector('[data-player-message]');
        if (!video || !src) {
            if (message) {
                message.textContent = '播放暂时不可用，请稍后重试';
            }
            return;
        }

        shell.setAttribute('data-ready', '1');

        function start() {
            var play = video.play();
            shell.classList.add('is-playing');
            if (play && typeof play.catch === 'function') {
                play.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', start, { once: true });
            video.load();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, start);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && message) {
                    message.textContent = '播放暂时不可用，请稍后重试';
                }
            });
            return;
        }

        video.src = src;
        video.load();
        start();
    }

    function initPlayers() {
        document.querySelectorAll('[data-player]').forEach(function (shell) {
            var button = shell.querySelector('[data-play-button]');
            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    loadPlayer(shell);
                });
            }
            shell.addEventListener('click', function () {
                loadPlayer(shell);
            });
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card">',
            '<a href="./' + escapeHtml(movie.file) + '" class="card-cover" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="card-duration">' + escapeHtml(movie.duration) + '</span>',
            '<span class="card-play">▶</span>',
            '</a>',
            '<div class="card-body">',
            '<a class="card-title" href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a>',
            '<p class="card-desc">' + escapeHtml(movie.description) + '</p>',
            '<div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<div class="card-tags">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var title = document.querySelector('[data-search-title]');
        var input = document.querySelector('[data-search-page-input]');
        if (!results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = text(params.get('q'));
        if (input && query) {
            input.value = params.get('q');
        }
        if (!query) {
            return;
        }
        var matched = window.SEARCH_MOVIES.filter(function (movie) {
            return text(movie.title + ' ' + movie.description + ' ' + movie.category + ' ' + movie.region + ' ' + movie.type + ' ' + movie.genre + ' ' + (movie.tags || []).join(' ')).indexOf(query) !== -1;
        }).slice(0, 120);
        if (title) {
            title.textContent = '相关影片';
        }
        if (matched.length) {
            results.innerHTML = matched.map(movieCard).join('');
        } else {
            results.innerHTML = '<p class="empty-state">没有匹配的影片，请更换关键词。</p>';
        }
    }

    initFilters();
    initPlayers();
    initSearchPage();
})();
