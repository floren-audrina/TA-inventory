import"./modulepreload-polyfill-B5Qt9EMX.js";import{s as d}from"./db_conn-C7Nb5uSA.js";document.getElementById("login-form").addEventListener("submit",async e=>{e.preventDefault();const s=document.getElementById("email").value,o=document.getElementById("password").value,{data:t,error:a}=await d.auth.signInWithPassword({email:s,password:o});if(a)i("Login failed: "+a.message,"error");else{console.log("User logged in:",t.user);const n="../";window.location.href=`${n}product.html`}});function i(e,s="success"){const o=document.getElementById("toastContainer"),t=document.createElement("div");t.className=`toast align-items-center text-white bg-${s==="success"?"success":"danger"} border-0`,t.setAttribute("role","alert"),t.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${e}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,o.appendChild(t),new bootstrap.Toast(t,{autohide:!0,delay:3e3}).show(),t.addEventListener("hidden.bs.toast",()=>t.remove())}
