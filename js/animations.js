/* Animations JavaScript file
  This file contains the JavaScript logic required for some of the special effects.

  ملف جافاسكريبت للمؤثرات الحركية
  هذا الملف يحتوي على المنطق البرمجي المطلوب لبعض المؤثرات الخاصة.
*/

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Magic Bento Grid Effect ---
    // --- 1. تأثير شبكة بينتو السحرية ---
    
    /**
     * Initializes the Bento Grid effect for all containers with the .bento-grid class.
     * It adds mousemove and mouseleave event listeners to each grid.
     * * تقوم بتهيئة تأثير شبكة بينتو لجميع الحاويات التي تحمل الفئة .bento-grid.
     * تضيف مستمعي حدث mousemove و mouseleave لكل شبكة.
     */
    function initializeBentoGrids() {
        // Find all grid containers on the page.
        // ابحث عن جميع حاويات الشبكة في الصفحة.
        const grids = document.querySelectorAll('.bento-grid');
        if (!grids.length) return;

        grids.forEach(grid => {
            const cards = grid.querySelectorAll('.bento-card');
            
            // When the mouse moves over the grid container...
            // عندما تتحرك الفأرة فوق حاوية الشبكة...
            grid.addEventListener('mousemove', (e) => {
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty('--card-mouse-x', `${x}px`);
                    card.style.setProperty('--card-mouse-y', `${y}px`);
                    card.style.setProperty('--glow-intensity', '1');
                });
            });

            // When the mouse leaves the grid container...
            // عندما تغادر الفأرة حاوية الشبكة...
            grid.addEventListener('mouseleave', () => {
                 cards.forEach(card => {
                    card.style.setProperty('--glow-intensity', '0');
                 });
            });
        });
    }

    // --- 2. Click Spark Effect ---
    // --- 2. تأثير الشرار عند النقر ---

    const rootStyles = getComputedStyle(document.documentElement);
    const SPARK_COUNT = 8;
    const animationDurationString = rootStyles.getPropertyValue('--spark-duration').trim();
    const ANIMATION_DURATION = parseInt(animationDurationString, 10);
    
    function createSpark(x, y, angle) {
        const spark = document.createElement('div');
        spark.classList.add('click-spark');
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;
        spark.style.setProperty('--angle', `${angle}deg`);
        document.body.appendChild(spark);
        
        setTimeout(() => {
            spark.remove();
        }, ANIMATION_DURATION);
    }
    
    document.addEventListener('click', (e) => {
        const angleIncrement = 360 / SPARK_COUNT;
        for (let i = 0; i < SPARK_COUNT; i++) {
            createSpark(e.clientX, e.clientY, angleIncrement * i);
        }
    });

    // --- 3. Observer for Page Content Changes ---
    // --- 3. مراقب لتغييرات محتوى الصفحة ---
    const mainContent = document.getElementById('main-content');
    
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // When new content is loaded, re-run the bento grid initialization.
                // عند تحميل محتوى جديد، أعد تشغيل تهيئة شبكة بينتو.
                initializeBentoGrids();
            }
        }
    });

    observer.observe(mainContent, { childList: true, subtree: true });

});

