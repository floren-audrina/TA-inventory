const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["navbar2.js","auth.js","db_conn.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill.js";import{_ as I,s as l}from"./db_conn.js";import{i as L,c as T}from"./auth.js";import{d as M}from"./import.js";fetch("navbar.html").then(t=>t.text()).then(async t=>{document.getElementById("navbar").innerHTML=t,(await I(()=>import("./navbar2.js"),__vite__mapDeps([0,1,2]))).setupLogout()}).catch(t=>console.error("Error loading navbar:",t));L();(async()=>await T())();function _(){const t=document.getElementById("bakulForm");t&&(t.reset(),t.dataset.bakulId="",document.getElementById("bakulModalLabel").textContent="Tambah Bakul",document.getElementById("submitButton").textContent="Tambah")}function i(t,e="success"){const a=document.getElementById("toastContainer");if(!a){console.error("Toast container not found!");return}const n=document.createElement("div");n.className=`toast align-items-center text-white bg-${e==="success"?"success":"danger"} border-0`,n.setAttribute("role","alert"),n.setAttribute("aria-live","assertive"),n.setAttribute("aria-atomic","true"),n.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${t}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,a.appendChild(n),new bootstrap.Toast(n,{autohide:!0,delay:3e3}).show(),n.addEventListener("hidden.bs.toast",()=>{n.remove()})}async function x(){const t=document.getElementById("kota");if(!t){console.warn("Kota dropdown not found in the DOM.");return}try{const{data:e,error:a}=await l.from("kota").select("id, kota");if(a)throw a;t.innerHTML='<option value="" disabled selected>Pilih Kota</option>',e.forEach(n=>{const o=document.createElement("option");o.value=n.id,o.text=n.kota,t.appendChild(o)})}catch(e){console.error("Error fetching cities:",e.message),i("Failed to load cities. Please try again.","error")}}async function F(){const t=document.getElementById("nama").value,e=document.getElementById("no_hp").value,a=document.getElementById("kota").value,n=document.getElementById("bakulForm").dataset.bakulId;try{if(n){const{data:s,error:d}=await l.from("bakul").update({nama:t,no_hp:e,id_kota:a}).eq("id",n);if(d)throw d;i("Data bakul berhasil diperbarui!","success")}else{const{data:s,error:d}=await l.from("bakul").insert([{nama:t,no_hp:e,id_kota:a}]);if(d)throw d;i("Data bakul berhasil ditambahkan!","success")}bootstrap.Modal.getInstance(document.getElementById("bakulModal")).hide(),await b()}catch(o){console.error("Error saving bakul:",o.message),i("Gagal menyimpan data bakul, silahkan coba lagi.","error")}}async function H(t){try{const{data:e,error:a}=await l.from("bakul").select("*").eq("id",t).single();if(a)throw a;document.getElementById("nama").value=e.nama,document.getElementById("no_hp").value=e.no_hp,document.getElementById("kota").value=e.id_kota,document.getElementById("bakulModalLabel").textContent="Edit Bakul",document.getElementById("submitButton").textContent="Edit",document.getElementById("bakulForm").dataset.bakulId=t,new bootstrap.Modal(document.getElementById("bakulModal")).show()}catch(e){console.error("Error fetching supplier:",e.message),i("Gagal mengambil data bakul, silahkan coba lagi.","error")}}async function C(t){if(confirm("Apakah Anda yakin ingin menghapus data bakul ini?"))try{const{data:e,error:a}=await l.from("bakul").delete().eq("id",t);if(a)throw a;await b(),i("Data bakul berhasil dihapus!","success")}catch(e){console.error("Error deleting supplier:",e.message),i("Gagal menghapus data bakul, silahkan coba lagi.","error")}}async function b(){const t=document.getElementById("bakulTableBody");if(t)try{t.innerHTML=`
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat bakul...
                </td>
            </tr>`;const{data:e,error:a}=await l.from("bakul").select(`
                id,
                nama,
                no_hp,
                kota: id_kota (kota)
            `).order("id",{ascending:!0});if(a)throw a;if(t.innerHTML="",!e||e.length===0){modalProductTable.innerHTML=`
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        Tidak ada bakul ditemukan
                    </td>
                </tr>`;return}e.forEach(n=>{var s;const o=document.createElement("tr");o.innerHTML=`
                <td>${n.id}</td>
                <td>${n.nama}</td>
                <td>${n.no_hp?n.no_hp:"-"}</td>
                <td>${(s=n.kota)!=null&&s.kota?n.kota.kota:"-"}
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editBakul(${n.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBakul(${n.id})">Delete</button>
                </td>
            `,t.appendChild(o)})}catch(e){console.error("Error fetching bakul:",e.message),i("Gagal menampilkan data bakul, silahkan coba lagi.","error")}}const r={type:null,kota:null};function $(){var e,a;const t=document.getElementById("filterKota");t&&t.addEventListener("click",function(n){if(this.checked&&r.type==="kota"){this.checked=!1,g();return}r.type="kota",D()}),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",f),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",g)}async function D(){var e,a;const t=document.getElementById("filterOptionsContainer");t.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),t.innerHTML=`
        <div class="mb-3">
            <label class="form-label">Kota</label>
            <select class="form-select" id="dropdownKota">
                <option value="">Memuat kota...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`,await K(),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",f),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",g)}async function K(){try{const{data:t,error:e}=await l.from("bakul").select("id_kota").not("id_kota","is",null).order("id_kota",{ascending:!0});if(e)throw e;const a=[...new Set(t.map(d=>d.id_kota))],{data:n,error:o}=await l.from("kota").select("id, kota").in("id",a).order("kota",{ascending:!0});if(o)throw o;const s=document.getElementById("dropdownKota");s.innerHTML='<option value="">Pilih Kota</option>',n.forEach(d=>{const c=document.createElement("option");c.value=d.id,c.textContent=d.kota,s.appendChild(c)})}catch(t){console.error("Error loading kota:",t),i("Gagal memuat daftar kota","error")}}function f(){r.kota=null,r.type==="kota"&&(r.kota=document.getElementById("dropdownKota").value),E()}function g(){const t=document.getElementById("filterKota");t&&(t.checked=!1),r.type=null,r.kota=null,document.getElementById("filterCard").classList.add("d-none"),b()}async function E(){const t=document.getElementById("bakulTableBody");try{t.innerHTML=`
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat bakul...
                </td>
            </tr>`;let e=l.from("bakul").select(`
                id, 
                nama,
                no_hp,
                kota:id_kota(kota)
            `).order("id",{ascending:!0});r.type==="kota"&&r.kota&&(e=e.eq("id_kota",r.kota));const{data:a,error:n}=await e;if(n)throw n;B(a)}catch(e){console.error("Error filtering bakuls:",e),i("Gagal memfilter bakul","error"),t.innerHTML=`
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Gagal memuat data bakul
                </td>
            </tr>`}}async function h(){const t=document.getElementById("searchInput").value.trim().toLowerCase();try{const e=document.getElementById("bakulTableBody");e.innerHTML=`
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat bakul...
                </td>
            </tr>`;let a=l.from("bakul").select(`
                id, 
                nama,
                no_hp,
                kota:id_kota(kota)
            `).order("id",{ascending:!0});r.type==="kota"&&r.kota&&(a=a.eq("id_kota",r.kota));const n=a;t&&n.or(`nama.ilike.%${t}%,no_hp.ilike.%${t}%`);const{data:o,error:s}=await n;let d=[];if(t&&!(r.type==="kota"&&r.kota)){const{data:u,error:m}=await l.from("kota").select("id, kota").ilike("kota",`%${t}%`);if(!m&&(u==null?void 0:u.length)>0){const k=u.map(w=>w.id),{data:p,error:v}=await a.in("id_kota",k);v||(d=p||[])}}let c;t?c=[...o||[],...d].reduce((m,k)=>(m.some(p=>p.id===k.id)||m.push(k),m),[]):c=o||[],B(c)}catch(e){console.error("Error searching bakuls:",e),i("Gagal melakukan pencarian bakul","error"),document.getElementById("bakulTableBody").innerHTML=`
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Gagal memuat data bakul
                </td>
            </tr>`}}function B(t){const e=document.getElementById("bakulTableBody");if(e.innerHTML="",!t||t.length===0){e.innerHTML=`
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Tidak ada bakul yang cocok dengan pencarian
                </td>
            </tr>`;return}t.forEach(a=>{var o;const n=document.createElement("tr");n.innerHTML=`
            <td>${a.id}</td>
            <td>${a.nama||"-"}</td>
            <td>${a.no_hp||"-"}</td>
            <td>${((o=a.kota)==null?void 0:o.kota)||"-"}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editBakul(${a.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteBakul(${a.id})">Delete</button>
            </td>
        `,e.appendChild(n)})}function y(){const t=document.getElementById("searchInput"),e=document.getElementById("searchIcon");t.value.trim()?e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`:e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`}function G(){document.getElementById("searchInput").value="",y(),E()}document.addEventListener("DOMContentLoaded",async()=>{await M(),await x(),await b(),$();const t=document.getElementById("bakulForm");t&&t.addEventListener("submit",async o=>{o.preventDefault(),await F()});const e=document.getElementById("bakulModal");e&&e.addEventListener("hidden.bs.modal",()=>{_()});const a=document.getElementById("searchInput"),n=document.getElementById("searchButton");n&&a&&(n.addEventListener("click",()=>{a.value.trim()&&document.getElementById("searchIcon").innerHTML.includes("bi-x")?G():h()}),a.addEventListener("keyup",o=>{y(),o.key==="Enter"&&h()}),a.addEventListener("input",y))});window.editBakul=H;window.deleteBakul=C;
