(function () {
    const toggle = document.querySelector('[data-menu-toggle]');
    const panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            const input = form.querySelector('input[name="q"]');
            const keyword = input ? input.value.trim() : '';
            if (!keyword) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

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

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    const localInput = document.querySelector('[data-local-filter]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const typeSelect = document.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));

    function applyLocalFilter() {
        const keyword = localInput ? localInput.value.trim().toLowerCase() : '';
        const year = yearSelect ? yearSelect.value : '';
        const type = typeSelect ? typeSelect.value : '';
        cards.forEach(function (card) {
            const text = (card.getAttribute('data-tags') || '').toLowerCase();
            const cardYear = card.getAttribute('data-year') || '';
            const cardType = card.getAttribute('data-type') || '';
            const visibleByKeyword = !keyword || text.indexOf(keyword) !== -1;
            const visibleByYear = !year || cardYear === year;
            const visibleByType = !type || cardType.indexOf(type) !== -1;
            card.classList.toggle('is-filtered-out', !(visibleByKeyword && visibleByYear && visibleByType));
        });
    }

    if (localInput || yearSelect || typeSelect) {
        [localInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyLocalFilter);
                control.addEventListener('change', applyLocalFilter);
            }
        });
    }

    const searchResults = document.querySelector('[data-search-results]');
    if (searchResults && window.SEARCH_DATA) {
        const params = new URLSearchParams(window.location.search);
        const query = (params.get('q') || '').trim();
        const input = document.querySelector('[data-main-search]');
        const title = document.querySelector('[data-search-title]');
        const sort = document.querySelector('[data-search-sort]');

        if (input) {
            input.value = query;
        }

        function resultTemplate(item) {
            const tags = item.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<article class="movie-card" data-card>' +
                '<a class="poster-link" href="./' + escapeHtml(item.url) + '">' +
                '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
                '<span class="poster-play">▶</span>' +
                '</a>' +
                '<div class="card-body">' +
                '<a class="card-title" href="./' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' +
                '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                '<div class="card-tags">' + tags + '</div>' +
                '</div>' +
                '</article>';
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[char];
            });
        }

        function buildResults() {
            const activeQuery = input ? input.value.trim() : query;
            const lowered = activeQuery.toLowerCase();
            let results = window.SEARCH_DATA.filter(function (item) {
                if (!lowered) {
                    return true;
                }
                return item.search.indexOf(lowered) !== -1;
            });

            const sortValue = sort ? sort.value : 'match';
            if (sortValue === 'year') {
                results = results.slice().sort(function (a, b) {
                    return String(b.year).localeCompare(String(a.year));
                });
            }
            if (sortValue === 'title') {
                results = results.slice().sort(function (a, b) {
                    return a.title.localeCompare(b.title, 'zh-CN');
                });
            }

            const display = results.slice(0, 96);
            if (title) {
                title.textContent = activeQuery ? '搜索：' + activeQuery : '热门检索';
            }
            if (!display.length) {
                searchResults.innerHTML = '<div class="empty-state"><h2>未找到相关内容</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>';
                return;
            }
            searchResults.innerHTML = display.map(resultTemplate).join('');
        }

        if (input) {
            input.addEventListener('input', buildResults);
        }
        if (sort) {
            sort.addEventListener('change', buildResults);
        }
        buildResults();
    }
}());
