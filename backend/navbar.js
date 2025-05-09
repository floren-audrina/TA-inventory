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