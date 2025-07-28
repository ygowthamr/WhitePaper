function initializeTheme() {
    try {
        const savedTheme = localStorage.getItem('darkMode');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'true' || (savedTheme === null && systemPrefersDark);
        
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Support both .theme-toggle (index.html) and #themeToggle (main.html)
        const themeIcon = document.querySelector('.theme-toggle i') || document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        }
    } catch (e) {
        console.error('Error initializing theme:', e);
    }
}

function toggleTheme() {
    try {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('darkMode', newTheme === 'dark' ? 'true' : 'false');
        
        // Support both .theme-toggle (index.html) and #themeToggle (main.html)
        const themeIcon = document.querySelector('.theme-toggle i') || document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    } catch (e) {
        console.error('Error toggling theme:', e);
    }
}

// Scroll-to-top functionality
function handleScrollToTop() {
    const scrollButton = document.getElementById('scrollButton');
    const outerCircle = document.querySelector('.outer-circle');
    if (!scrollButton || !outerCircle) {
        console.warn('Scroll button or outer circle not found');
        return;
    }

    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 360 : 0;

    // Show button after scrolling ~100px
    if (scrollTop > 100) {
        scrollButton.classList.add('visible');
        scrollButton.classList.remove('hidden');
    } else {
        scrollButton.classList.remove('visible');
        scrollButton.classList.add('hidden');
    }

    // Update circular progress
    outerCircle.style.setProperty('--scroll-progress', `${scrollProgress}deg`);
}

// Initialize scroll-to-top click event
function initializeScrollToTop() {
    const scrollButton = document.getElementById('scrollButton');
    if (scrollButton) {
        scrollButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.warn('Scroll button not found for click event');
    }
}

// Attach event listeners on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeScrollToTop();
    window.addEventListener('scroll', handleScrollToTop);

    // Support theme toggle for both index.html and main.html
    const themeToggleBtn = document.querySelector('.theme-toggle') || document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    } else {
        console.warn('Theme toggle button not found');
    }
});