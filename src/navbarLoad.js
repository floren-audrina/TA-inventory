import { setupLogout } from './navbar.js';

async function loadNavbar() {
    try {
        const response = await fetch("navbar.html");
        const html = await response.text();
        const navbarEl = document.getElementById("navbar");
        navbarEl.innerHTML = html;

        // Wait for dynamic elements to exist
        const observer = new MutationObserver(() => {
            if (document.getElementById("logout-link")) {
                setupLogout();
                observer.disconnect();
            }
        });
        observer.observe(navbarEl, { childList: true, subtree: true });
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

export {
    loadNavbar
}