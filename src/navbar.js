const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');

menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active'); // Toggle sidebar
});

// Hide sidebar if user clicks outside
document.addEventListener('click', (event) => {
    if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
        sidebar.classList.remove('active'); // Close sidebar
    }
});

const logoutLink = document.querySelector('#sidebar a[href="login.html"]');
if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
            // Optional: Show error to user
            window.location.href = 'login.html'; // Force redirect anyway
        }
    });
}