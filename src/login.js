import supabase from './db_conn.js';

// Handle form submission
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get email and password from the form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Log in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        // Display error message
        showToast('Login gagal: ' + error.message, 'error');
    } else {
        // Redirect to dashboard on successful login
        console.log('User logged in:', data.user);
        const baseUrl = '../';
        window.location.href = `${baseUrl}product.html`;
        // window.location.href = '/TA-inventory/product.html';
    }
});

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}