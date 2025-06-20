// import supabase from './db_conn.js';

// const BASE_PATH = '/TA-inventory';

// function getBaseUrl() {
//   return window.location.origin + BASE_PATH;
// }

// async function checkAuth() {
//   if (window.location.pathname.includes(`${BASE_PATH}/index.html`)) return true;

//   const { data: { session }, error } = await supabase.auth.getSession();

//   if (!session) {
//     redirectToLogin();
//     return false;
//   }

//   return true;
// }

// function redirectToLogin() {
//   localStorage.removeItem('sb_auth_token');
//   sessionStorage.removeItem('sb_auth_token');
//   window.location.href = `${getBaseUrl()}/index.html`;
// }

// async function logout() {
//   try {
//     console.log('Attempting logout...');

//     localStorage.removeItem('sb_auth_token');
//     sessionStorage.removeItem('sb_auth_token');

//     const { error } = await supabase.auth.signOut();
//     if (error) throw error;

//     console.log('Logout successful, redirecting...');
//     window.location.href = `${getBaseUrl()}/index.html`;
//   } catch (error) {
//     console.error('Logout failed:', error);
//     window.location.href = `${getBaseUrl()}/index.html`;
//   }
// }

// // Move this into a function that you call explicitly
// function initAuthStateListener() {
//   supabase.auth.onAuthStateChange((event) => {
//     console.log('Auth state changed:', event);
//     if (event === 'SIGNED_OUT') {
//       redirectToLogin();
//     }
//   });
// }

// export {
//   checkAuth,
//   redirectToLogin,
//   logout,
//   initAuthStateListener
// }

// auth.js
import supabase from './db_conn.js';

// let authInitialized = false;

// export async function checkAuth() {
//     if (authInitialized) return;
    
//     // Skip check for login page
//     if (window.location.pathname.includes('index.html')) {
//         authInitialized = true;
//         return;
//     }

//     // Immediate visual blocking
//     document.body.innerHTML = `
//         <div style="
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background: white;
//             z-index: 9999;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//         ">
//             <div>Verifying authentication...</div>
//         </div>
//     `;

//     try {
//         const { data: { session }, error } = await supabase.auth.getSession();
        
//         if (!session) {
//             redirectToLogin();
//             return;
//         }
        
//         authInitialized = true;
//         document.body.innerHTML = ''; // Clear blocking overlay
//     } catch (error) {
//         redirectToLogin();
//     }
// }

// export function redirectToLogin() {
//     // Clear all auth-related data
//     localStorage.removeItem('sb_auth_token');
//     sessionStorage.removeItem('sb_auth_token');
    
//     // Immediate redirect with history replacement
//     window.history.replaceState(null, null, '/index.html');
//     window.location.href = `${window.location.origin}/index.html`;
// }

export async function checkAuth() {
    // Skip check for login page
    if (window.location.pathname.includes('index.html')) return true;

    // local session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!session) {
        redirectToLogin();
        return false;
    }

    return true;
}

export function redirectToLogin() {
    // Clear all auth-related data
    localStorage.removeItem('sb_auth_token');
    sessionStorage.removeItem('sb_auth_token');
    
    // Use absolute path
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/index.html`; 
}

export async function logout() {
    try {
        console.log('Attempting logout...'); 
        
        // Clear all auth-related data
        localStorage.removeItem('sb_auth_token');
        sessionStorage.removeItem('sb_auth_token');
        
        // sign out
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        console.log('Logout successful, redirecting...'); 
        
        // Force redirect to home page
        window.location.href = '/index.html';
        // window.location.href = '/TA-inventory/index.html';
    } catch (error) {
        console.error('Logout failed:', error);
        // logout failed --> redirect
        window.location.href = '/index.html';
        // window.location.href = '/TA-inventory/index.html';
    }
}

export function initAuthStateListener() {
  supabase.auth.onAuthStateChange((event) => {
    console.log('Auth state changed:', event);
    if (event === 'SIGNED_OUT') {
      redirectToLogin();
    }
  });
}