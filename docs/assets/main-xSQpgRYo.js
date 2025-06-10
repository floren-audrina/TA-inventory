import{s as n}from"./db_conn-CuK1RHLN.js";document.getElementById("login-form").addEventListener("submit",async e=>{e.preventDefault();const s=document.getElementById("email").value,o=document.getElementById("password").value,{data:t,error:a}=await n.auth.signInWithPassword({email:s,password:o});a?d("Login failed: "+a.message,"error"):(console.log("User logged in:",t.user),window.location.href="/TA-inventory/product.html")});function d(e,s="success"){const o=document.getElementById("toastContainer"),t=document.createElement("div");t.className=`toast align-items-center text-white bg-${s==="success"?"success":"danger"} border-0`,t.setAttribute("role","alert"),t.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${e}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,o.appendChild(t),new bootstrap.Toast(t,{autohide:!0,delay:3e3}).show(),t.addEventListener("hidden.bs.toast",()=>t.remove())}
