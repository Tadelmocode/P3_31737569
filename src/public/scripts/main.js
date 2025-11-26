// ============================================
// SMOOTH SCROLL Y NAVEGACIÓN
// ============================================

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

// ============================================
// NAVBAR STICKY EFFECT
// ============================================

const navbar = document.querySelector('.main-header');
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.boxShadow = 'var(--shadow-md)';
    }
    
    lastScrollTop = scrollTop;
});

// ============================================
// ANIMACIÓN DE CARDS AL SCROLL
// ============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar feature cards
document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(card);
});

// Observar endpoint groups
document.querySelectorAll('.endpoint-group').forEach(group => {
    group.style.opacity = '0';
    group.style.transform = 'translateY(20px)';
    group.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(group);
});

// Observar quick links
document.querySelectorAll('.quick-link-card').forEach(link => {
    link.style.opacity = '0';
    link.style.transform = 'translateY(20px)';
    link.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(link);
});

// ============================================
// EFECTO PARALLAX EN HERO
// ============================================

const heroVisual = document.querySelector('.hero-visual');

if (heroVisual) {
    window.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        heroVisual.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    window.addEventListener('mouseleave', () => {
        heroVisual.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
}

// ============================================
// EFECTO RIPPLE EN BOTONES
// ============================================

document.querySelectorAll('.btn, .quick-link-card').forEach(element => {
    element.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.pointerEvents = 'none';
        ripple.style.transform = 'translate(-50%, -50%)';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        const size = Math.max(rect.width, rect.height);
        const animation = ripple.animate([
            { width: '0px', height: '0px', opacity: 1 },
            { width: size + 'px', height: size + 'px', opacity: 0 }
        ], {
            duration: 600,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => ripple.remove();
    });
});

// ============================================
// CONTADOR DE ESTADÍSTICAS (OPCIONAL)
// ============================================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const counter = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(counter);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ============================================
// DETECCIÓN DE TEMA OSCURO DEL SISTEMA
// ============================================

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.style.colorScheme = 'dark';
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    document.documentElement.style.colorScheme = e.matches ? 'dark' : 'light';
});

// ============================================
// CARGA DINÁMICA DE INFORMACIÓN
// ============================================

async function loadAboutInfo() {
    try {
        const response = await fetch('/about');
        const data = await response.json();
        
        if (data.status === 'success') {
            console.log('Información del desarrollador:', data.data);
        }
    } catch (error) {
        console.error('Error al cargar información:', error);
    }
}

// Cargar información al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadAboutInfo();
    
    // Agregar clase active al link de navegación actual
    const currentLocation = location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });
});

// ============================================
// EFECTOS DE HOVER AVANZADOS
// ============================================

document.querySelectorAll('.endpoint-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.3)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.boxShadow = 'none';
    });
});

// ============================================
// NOTIFICACIONES Y FEEDBACK
// ============================================

function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInUp 0.3s ease-out;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInUp 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ============================================
// COPIA AL PORTAPAPELES
// ============================================

document.querySelectorAll('.endpoint-path').forEach(element => {
    element.style.cursor = 'pointer';
    element.addEventListener('click', function(e) {
        e.stopPropagation();
        const text = this.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showNotification(`Copiado: ${text}`, 'success', 2000);
        }).catch(() => {
            showNotification('Error al copiar', 'error', 2000);
        });
    });
});

// ============================================
// PERFORMANCE MONITORING
// ============================================

if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⏱️ Tiempo de carga de página: ${pageLoadTime}ms`);
    });
}

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================

window.addEventListener('error', (event) => {
    console.error('Error global:', event.error);
    showNotification('Ocurrió un error inesperado', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rechazada no manejada:', event.reason);
    showNotification('Error en la aplicación', 'error');
});
