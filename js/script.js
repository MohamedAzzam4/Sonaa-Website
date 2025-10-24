/* Main JavaScript file for صناع الحياة المحلة الكبرى Website
  This file handles page loading, core UI interactions, statistics counter, 
  and logic for both the Donation and new Programs pages.
  Other animations are in animations.js

  ملف الجافاسكريبت الرئيسي لموقع صناع الحياة المحلة الكبرى
  هذا الملف مسؤول عن تحميل الصفحات، التفاعلات الأساسية، عداد الإحصائيات،
  والمنطق البرمجي لصفحتي التبرع والبرامج الجديدة.
  المؤثرات الحركية الأخرى موجودة في ملف animations.js
*/
document.addEventListener('DOMContentLoaded', function() {
    // --- 1. Element Selectors ---
    const mainContent = document.getElementById('main-content');
    const header = document.getElementById('header');
    const backToTop = document.getElementById('back-to-top');

    // --- 2. Page Loading and Navigation Logic ---
    async function loadPage(pageId) {
        if (!pageId) pageId = 'home';
        try {
            mainContent.innerHTML = '<p style="text-align:center; padding: 5rem 0;">...جاري التحميل</p>';
            const response = await fetch(`pages/${pageId}.html`);
            if (!response.ok) throw new Error(`Page not found: ${pageId}.html`);
            mainContent.innerHTML = await response.text();
            initializePageScripts(pageId);
        } catch (error) {
            console.error('Failed to load page:', error);
            mainContent.innerHTML = '<p style="text-align:center; padding: 5rem 0;">حدث خطأ أثناء تحميل الصفحة.</p>';
        } finally {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function updateActiveLink(pageId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });
    }

    function handleNavClick(e) {
        e.preventDefault();
        const pageId = e.currentTarget.dataset.page;
        if (pageId) {
            loadPage(pageId);
            updateActiveLink(pageId);
            const navMenu = document.getElementById('nav-menu');
            if (window.innerWidth <= 992) {
                navMenu.classList.remove('show');
            }
        }
    }

    function attachNavListeners() {
        document.querySelectorAll('.nav-link, .footer-links a[data-page], .program-cta a[data-page]').forEach(link => {
            link.addEventListener('click', handleNavClick);
        });
    }

    // --- 3. Core UI Interactions ---
    document.getElementById('mobile-menu-toggle').addEventListener('click', () => {
        document.getElementById('nav-menu').classList.toggle('show');
    });
    if (backToTop) {
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    window.addEventListener('scroll', () => {
        const isScrolled = window.scrollY > 100;
        header.classList.toggle('scrolled', isScrolled);
        if (backToTop) {
            backToTop.style.display = isScrolled ? 'flex' : 'none';
        }
    });

    // --- 4. Page-Specific Scripts Initialization ---
    function initializePageScripts(pageId) {
        if (pageId === 'home') setupHomePageScripts();
        if (pageId === 'donate') setupDonationPageScripts(); 
        
        // **NEW**: If the loaded page is 'programs', run the program page scripts
        if (pageId === 'programs') setupProgramPageScripts();

        // Re-attach nav listeners for newly loaded content (like CTAs)
        mainContent.querySelectorAll('a[data-page]').forEach(link => link.addEventListener('click', handleNavClick));
        document.querySelectorAll('form').forEach(setupFormSubmission);
        
        // Re-run counter for any stats sections loaded
        setupStatsCounters(mainContent);
    }
    
    // Generic function to find and animate any stats counters
    function setupStatsCounters(container) {
        const statsSections = container.querySelectorAll('.stats, .program-stats');
        if (!statsSections.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.stat-number[data-count]').forEach(stat => {
                        if (!stat.classList.contains('animated')) {
                            animateCounter(stat, parseInt(stat.dataset.count));
                            stat.classList.add('animated');
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        statsSections.forEach(section => observer.observe(section));
    }
    
    // Specific setup for homepage (if any)
    function setupHomePageScripts() {
        // Handled by setupStatsCounters
    }
    
    function animateCounter(element, target) {
        let current = 0;
        const increment = Math.max(1, target / 100); // Ensure increment is at least 1
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { clearInterval(timer); current = target; }
            element.textContent = Math.floor(current).toLocaleString('ar-EG');
        }, 20);
    }
    
    // Logic for the donation page tabs and cards
    function setupDonationPageScripts() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        const amountCards = document.querySelectorAll('.amount-card');
        const paymentMethods = document.querySelectorAll('.payment-method');
        const amountInput = document.getElementById('amount-input');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });

        amountCards.forEach(card => {
            card.addEventListener('click', () => {
                amountCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                const amount = card.getAttribute('data-amount');
                if (amount !== 'custom' && amountInput) {
                    amountInput.value = amount;
                } else if (amount === 'custom' && amountInput) {
                    amountInput.focus();
                }
            });
        });

        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                paymentMethods.forEach(m => m.classList.remove('selected'));
                method.classList.add('selected');
                const paymentSelect = document.querySelector('select[name="payment-method"]');
                if (paymentSelect) paymentSelect.value = method.dataset.method;
            });
        });
    }

    // **NEW**: Logic for the new program page filtering tabs
    function setupProgramPageScripts() {
        const tabBtns = document.querySelectorAll('.program-tabs .tab-btn');
        const cards = document.querySelectorAll('.program-grid .program-card');

        // Add staggered animation delay
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.05}s`;
        });

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                // Update active button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter cards
                cards.forEach(card => {
                    const category = card.dataset.category;
                    if (filter === 'all' || filter === category) {
                        card.style.display = 'block'; // Or 'grid' if it's a grid item
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- 5. Form and Modal Logic ---
    function setupFormSubmission(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;
            form.querySelectorAll('[required]').forEach(field => {
                if (!field.value.trim()) isValid = false;
            });
            if(isValid) {
                showModal('تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً.');
                form.reset();
                document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
            } else {
                showModal('يرجى ملء جميع الحقول المطلوبة.');
            }
        });
    }

    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const modalClose = document.getElementById('modal-close');
    function showModal(message) {
        if (!modal || !modalBody) return;
        modalBody.innerHTML = `<h3>رسالة</h3><p>${message}</p><button class="btn btn-primary" id="modal-ok-btn" style="padding: 0.5rem 1.5rem; border: none; border-radius: 5px; cursor: pointer; background: var(--primary-color); color: white;">حسناً</button>`;
        modal.classList.add('show');
        document.getElementById('modal-ok-btn').addEventListener('click', closeModal);
    }
    function closeModal() { if (modal) modal.classList.remove('show'); }
    if (modal) modal.addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
    if (modalClose) modalClose.addEventListener('click', closeModal);
    
    // --- 6. Initial Page Load ---
    loadPage('home');
    attachNavListeners();
});

