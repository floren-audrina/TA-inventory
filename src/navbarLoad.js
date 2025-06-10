export async function loadNavbar() {
    try {
        // Load HTML
        const response = await fetch("navbar.html");
        const html = await response.text();
        document.getElementById("navbar").innerHTML = html;
        
        // Load and execute JS
        const { setupLogout } = await import('./navbar.js');
        if (setupLogout) {
            setupLogout();
        } else {
            console.error('setupLogout not found in navbar.js');
        }
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}