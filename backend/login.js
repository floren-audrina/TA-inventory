import supabase from '../database/db_conn.js'; // Import the Supabase client

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
        window.location.href = './product.html'; // Replace with your dashboard URL
    }
});