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
        document.getElementById('error-message').textContent = error.message;
    } else {
        // Redirect to dashboard on successful login
        console.log('User logged in:', data.user);
        window.location.href = '../product.html';
    }
});