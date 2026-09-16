(() => {
    const root = document.documentElement;
    const current = root.dataset.theme || 'light';

    document.querySelectorAll('.theme-controller').forEach((input) => {
        input.checked = input.value === current;
        input.addEventListener('change', () => {
            if (!input.checked) return;
            root.dataset.theme = input.value;
            try {
                localStorage.setItem('theme', input.value);
            } catch { }
        });
    });

    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    let toastTimeout;

    const showToast = (msg) => {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = msg;
        toast.classList.remove('hidden');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.add('hidden'), 2200);
    };

    document.querySelectorAll('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const text = btn.getAttribute('data-copy') || btn.innerText;
            try {
                await navigator.clipboard.writeText(text.trim());
                showToast(`Copied: ${text.trim()}`);
                const icon = btn.querySelector('.copy-icon');
                const check = btn.querySelector('.check-icon');
                if (icon && check) {
                    icon.classList.add('hidden');
                    check.classList.remove('hidden');
                    setTimeout(() => {
                        icon.classList.remove('hidden');
                        check.classList.add('hidden');
                    }, 1500);
                }
            } catch { }
        });
    });

    const searchInput = document.getElementById('command-search');
    const categoryTabs = document.querySelectorAll('[data-cmd-tab]');
    const commandCards = document.querySelectorAll('[data-cmd]');

    let activeCategory = 'all';

    const filterCommands = () => {
        const query = (searchInput?.value || '').toLowerCase().trim();
        commandCards.forEach((card) => {
            const cmdName = card.getAttribute('data-cmd') || '';
            const cmdDesc = card.getAttribute('data-desc') || '';
            const cmdCat = card.getAttribute('data-category') || '';
            const matchCategory = activeCategory === 'all' || cmdCat === activeCategory;
            const matchQuery = !query || cmdName.includes(query) || cmdDesc.toLowerCase().includes(query);
            if (matchCategory && matchQuery) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    };

    searchInput?.addEventListener('input', filterCommands);

    categoryTabs.forEach((tab) => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            categoryTabs.forEach((t) => t.classList.remove('tab-active'));
            tab.classList.add('tab-active');
            activeCategory = tab.getAttribute('data-cmd-tab') || 'all';
            filterCommands();
        });
    });
})();
