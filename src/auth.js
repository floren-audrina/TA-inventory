// auth.js
import supabase from './db_conn.js';

export async function checkAuth() {
    // Skip check for login page
    if (window.location.pathname.includes('login.html')) return true;

    // 1. Check local session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!session) {
        redirectToLogin();
        return false;
    }

    return true;
}

export function redirectToLogin() {
    localStorage.removeItem('sb_auth_token');
    window.location.href = 'login.html';
}

export async function logout() {
    await supabase.auth.signOut();
    redirectToLogin();
}

// Auth state listener
supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
        redirectToLogin();
    }
});