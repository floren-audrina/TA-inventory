import { logout } from './auth.js';

// Sidebar toggle functionality
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');

if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    });
}

export function setupLogout() {
    const logoutLink = document.getElementById('logout-link') || 
                       document.querySelector('[data-logout]') ||
                       document.querySelector('a[href*="logout"]');

    if (!logoutLink) {
        console.error('Logout link not found!');
        return;
    }

    logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Logout clicked');
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/index.html';
        }
    });
}