import supabase from './db_conn.js';

const BASE_PATH = '/TA-inventory';

function getBaseUrl() {
  return window.location.origin + BASE_PATH;
}

async function checkAuth() {
  if (window.location.pathname.includes(`${BASE_PATH}/index.html`)) return true;

  const { data: { session }, error } = await supabase.auth.getSession();

  if (!session) {
    redirectToLogin();
    return false;
  }

  return true;
}

function redirectToLogin() {
  localStorage.removeItem('sb_auth_token');
  sessionStorage.removeItem('sb_auth_token');
  window.location.href = `${getBaseUrl()}/index.html`;
}

async function logout() {
  try {
    console.log('Attempting logout...');

    localStorage.removeItem('sb_auth_token');
    sessionStorage.removeItem('sb_auth_token');

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    console.log('Logout successful, redirecting...');
    window.location.href = `${getBaseUrl()}/index.html`;
  } catch (error) {
    console.error('Logout failed:', error);
    window.location.href = `${getBaseUrl()}/index.html`;
  }
}

// Move this into a function that you call explicitly
function initAuthStateListener() {
  supabase.auth.onAuthStateChange((event) => {
    console.log('Auth state changed:', event);
    if (event === 'SIGNED_OUT') {
      redirectToLogin();
    }
  });
}

export {
  checkAuth,
  redirectToLogin,
  logout,
  initAuthStateListener
}

// // auth.js
// import supabase from './db_conn.js';

// export async function checkAuth() {
//     // Skip check for login page
//     if (window.location.pathname.includes('index.html')) return true;

//     // 1. Check local session
//     const { data: { session }, error } = await supabase.auth.getSession();
    
//     if (!session) {
//         redirectToLogin();
//         return false;
//     }

//     return true;
// }

// export function redirectToLogin() {
//     // Clear all auth-related data
//     localStorage.removeItem('sb_auth_token');
//     sessionStorage.removeItem('sb_auth_token');
    
//     // Use absolute path
//     const baseUrl = window.location.origin;
//     window.location.href = `${baseUrl}/index.html`; // or your login page
// }

// export async function logout() {
//     try {
//         console.log('Attempting logout...'); // Debug log
        
//         // Clear all auth-related data first
//         localStorage.removeItem('sb_auth_token');
//         sessionStorage.removeItem('sb_auth_token');
        
//         // Then sign out from Supabase
//         const { error } = await supabase.auth.signOut();
//         if (error) throw error;
        
//         console.log('Logout successful, redirecting...'); // Debug log
        
//         // Force redirect to home page
//         window.location.href = '/index.html';
//         // window.location.href = '/TA-inventory/index.html';
//     } catch (error) {
//         console.error('Logout failed:', error);
//         // Still redirect even if logout failed
//         window.location.href = '/index.html';
//         // window.location.href = '/TA-inventory/index.html';
//     }
// }

// supabase.auth.onAuthStateChange((event) => {
//     console.log('Auth state changed:', event); 
//     if (event === 'SIGNED_OUT') {
//         redirectToLogin();
//     }
// });
