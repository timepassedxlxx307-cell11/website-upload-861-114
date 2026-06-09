(function() {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function() {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function(slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        let active = 0;
        let timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function() {
                show(active + 1);
            }, 5600);
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                show(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', function() {
            window.clearInterval(timer);
        });
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-root]').forEach(function(root) {
        const form = root.querySelector('[data-filter-form]');
        const input = root.querySelector('[data-filter-input]');
        const typeSelect = root.querySelector('[data-filter-type]');
        const categorySelect = root.querySelector('[data-filter-category]');
        const cards = Array.from(root.querySelectorAll('[data-filter-card]'));
        const empty = root.querySelector('[data-empty-state]');
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            const query = normalize(input ? input.value : '');
            const selectedType = normalize(typeSelect ? typeSelect.value : '');
            const selectedCategory = normalize(categorySelect ? categorySelect.value : '');
            let visible = 0;

            cards.forEach(function(card) {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.genre,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.category,
                    card.textContent
                ].join(' '));
                const cardType = normalize(card.dataset.type);
                const cardCategory = normalize(card.dataset.category);
                const matchedQuery = !query || haystack.indexOf(query) !== -1;
                const matchedType = !selectedType || cardType === selectedType;
                const matchedCategory = !selectedCategory || cardCategory === selectedCategory;
                const matched = matchedQuery && matchedType && matchedCategory;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                applyFilter();
            });
        }
        [input, typeSelect, categorySelect].forEach(function(element) {
            if (element) {
                element.addEventListener('input', applyFilter);
                element.addEventListener('change', applyFilter);
            }
        });
        applyFilter();
    });
})();
