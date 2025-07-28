
// Add scroll-based animations
const observerOptions = {
threshold: 0.1,
rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
    entry.target.classList.add('fade-in');
}
});
}, observerOptions);

// Observe all animatable elements
const animateElements = document.querySelectorAll('.feature-card, .value-card, .mission-section, .team-section, .cta-section');
animateElements.forEach(el => observer.observe(el));

// Add dynamic particle generation
function createParticle() {
const particle = document.createElement('div');
particle.className = 'particle';
particle.style.left = Math.random() * 100 + '%';
particle.style.top = Math.random() * 100 + '%';
particle.style.animationDelay = Math.random() * 12 + 's';
document.querySelector('.background-elements').appendChild(particle);

// Remove particle after animation
setTimeout(() => {
particle.remove();
}, 12000);
}

// Generate particles periodically
setInterval(createParticle, 3000);

// Add hover effect to stat cards
const statCards = document.querySelectorAll('.stat-card');
statCards.forEach(card => {
card.addEventListener('mouseenter', () => {
const number = card.querySelector('.stat-number');
number.style.transform = 'scale(1.1)';
number.style.transition = 'transform 0.3s ease';
});

card.addEventListener('mouseleave', () => {
const number = card.querySelector('.stat-number');
number.style.transform = 'scale(1)';
});
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function (e) {
e.preventDefault();
const target = document.querySelector(this.getAttribute('href'));
if (target) {
    target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}
});
});

// Add typing effect to hero subtitle
const heroSubtitle = document.querySelector('.hero-subtitle');
const originalText = heroSubtitle.textContent;
heroSubtitle.textContent = '';

function typeText(element, text, speed = 100) {
let i = 0;
const timer = setInterval(() => {
element.textContent += text.charAt(i);
i++;
if (i >= text.length) {
    clearInterval(timer);
}
}, speed);
}

// Start typing effect after page load
window.addEventListener('load', () => {
setTimeout(() => {
typeText(heroSubtitle, originalText, 150);
}, 1000);
});

// Add parallax effect to floating shapes
window.addEventListener('scroll', () => {
const scrolled = window.pageYOffset;
const shapes = document.querySelectorAll('.floating-shape');

shapes.forEach((shape, index) => {
const speed = 0.1 + (index * 0.05);
shape.style.transform = `translateY(${scrolled * speed}px)`;
});
});

// Add click ripple effect to buttons
const buttons = document.querySelectorAll('.cta-button');
buttons.forEach(button => {
button.addEventListener('click', function(e) {
const ripple = document.createElement('span');
const rect = this.getBoundingClientRect();
const size = Math.max(rect.width, rect.height);
const x = e.clientX - rect.left - size / 2;
const y = e.clientY - rect.top - size / 2;

ripple.style.width = ripple.style.height = size + 'px';
ripple.style.left = x + 'px';
ripple.style.top = y + 'px';
ripple.classList.add('ripple');

this.appendChild(ripple);

setTimeout(() => {
    ripple.remove();
}, 600);
});
});

// Add CSS for ripple effect
const rippleCSS = `
.cta-button {
position: relative;
overflow: hidden;
}

.ripple {
position: absolute;
border-radius: 50%;
background: rgba(255, 255, 255, 0.3);
animation: ripple-animation 0.6s ease-out;
pointer-events: none;
}

@keyframes ripple-animation {
to {
    transform: scale(2);
    opacity: 0;
}
}
`;

const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);
