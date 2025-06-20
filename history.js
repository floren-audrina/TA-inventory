const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["navbar2.js","auth.js","db_conn.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill.js";import{_ as k,s as u}from"./db_conn.js";import{i as I,c as B}from"./auth.js";import{d as _,p as M}from"./import.js";fetch("navbar.html").then(e=>e.text()).then(async e=>{document.getElementById("navbar").innerHTML=e,(await k(()=>import("./navbar2.js"),__vite__mapDeps([0,1,2]))).setupLogout()}).catch(e=>console.error("Error loading navbar:",e));I();(async()=>await B())();function b(e){return e?new Date(e).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1,timeZone:"Asia/Jakarta"}):"-"}function d(e,a="success"){const t=document.getElementById("toastContainer"),n=document.createElement("div");n.classList.add("toast"),n.setAttribute("role","alert"),n.setAttribute("aria-live","assertive"),n.setAttribute("aria-atomic","true"),n.classList.add(a==="success"?"bg-success":"bg-danger"),n.classList.add("text-white");const r=document.createElement("div");r.classList.add("toast-body"),r.textContent=e,n.appendChild(r),t.appendChild(n),new bootstrap.Toast(n,{autohide:!0,delay:3e3}).show(),n.addEventListener("hidden.bs.toast",()=>{n.remove()})}function m(){return new URLSearchParams(window.location.search).get("variantId")}async function H(e){const{data:a,error:t}=await u.from("produk_varian").select(`
            *,
            produk:id_produk(*)
        `).eq("id",e).single();return t?(console.error("Error fetching variant details:",t),null):a}async function x(){const e=document.getElementById("tipe_riwayat");e.innerHTML='<option value="">Memuat tipe riwayat...</option>';try{const{data:a,error:t}=await u.rpc("get_enum_values",{enum_name:"tipe_riwayat"});if(t)throw t;e.innerHTML='<option value="" disabled selected>Pilih tipe riwayat</option>',a.filter(r=>r.value==="penyesuaian_masuk"||r.value==="penyesuaian_keluar").forEach(r=>{const o=document.createElement("option");o.value=r.value,o.text=r.value.charAt(0).toUpperCase()+r.value.slice(1).replace("_"," "),e.appendChild(o)})}catch(a){console.error("Error fetching tipe_riwayat enum:",a),e.innerHTML='<option value="">Error loading tipe riwayat</option>',d("Gagal memuat tipe riwayat","error")}}function $(e){return e?new Date(e).toISOString():null}async function C(e){var w,E;e.preventDefault();const a=e.target,t=a.querySelector('button[type="submit"]'),n=m(),r=$((w=document.getElementById("tanggal"))==null?void 0:w.value),o=(E=document.getElementById("tipe_riwayat"))==null?void 0:E.value,l=document.getElementById("qty"),i=l?parseInt(l.value,10):0,c=document.getElementById("harga"),L=c?parseFloat(c.value):0,h=document.getElementById("historyModal"),v=h?bootstrap.Modal.getInstance(h):null;if(!n||!o||!i){d("Harap isi semua field yang diperlukan.","error");return}try{let p="";t&&(p=t.innerHTML,t.disabled=!0,t.innerHTML='<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Memproses...');const g=await M({variantId:n,type:o,quantity:i,price:L,date:r});g!=null&&g.success?(d("Entri berhasil diproses","success"),v&&v.hide(),await f(n),a.reset()):d("Gagal memproses entri","error")}catch(p){console.error("Error processing entry:",p),d(`Gagal memproses entri: ${p.message}`,"error")}finally{t&&(t.disabled=!1,t.innerHTML=originalBtnText)}}async function f(e){const a=document.getElementById("historyTableBody");try{if(a.innerHTML=`
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat entri...
                </td>
            </tr>`,!e){a.innerHTML='<tr><td colspan="8" class="text-center text-danger">Tidak ditemukan ID varian dalam URL.</td></tr>';return}const t=await H(e);if(!t){a.innerHTML='<tr><td colspan="8" class="text-center text-danger">Varian tidak ditemukan.</td></tr>';return}const n=document.querySelector("h3");n&&(n.textContent=`Riwayat stok untuk "${t.produk.nama}" - ${t.varian}`);const r=document.getElementById("currentStock");r&&(r.textContent=`Stok saat ini: ${t.jumlah_stok}`);const{data:o,error:l}=await u.from("riwayat_stok").select("*").eq("id_varian",e).order("tanggal",{ascending:!1}).order("id",{ascending:!1});if(l)throw l;if(console.log("History data:",o),!o||o.length===0){a.innerHTML='<tr><td colspan="8" class="text-center">Tidak ada riwayat stok yang ditemukan untuk varian ini.</td></tr>';return}a.innerHTML="",o.forEach(i=>{const c=document.createElement("tr");c.innerHTML=`
                <td>${i.id}</td>
                <td>${b(i.tanggal)}</td>
                <td>${i.tipe_riwayat.charAt(0).toUpperCase()+i.tipe_riwayat.slice(1)}</td>
                <td>${i.qty}</td>
                <td>${i.saldo??"-"}</td>
                <td>${i.harga!==null?"Rp "+i.harga.toLocaleString("id-ID"):"-"}</td>
                <td>${i.hpp?"Rp "+i.hpp.toLocaleString("id-ID"):"-"}</td>
                <td>${i.stok_sisa??"-"}</td>
            `,a.appendChild(c)})}catch(t){console.error("Error:",t),a.innerHTML=`
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Gagal memuat riwayat stok: ${t.message}
                </td>
            </tr>`,d("Gagal memuat riwayat stok","error")}}const s={type:null,tipe:null};function D(){var a,t;const e=document.getElementById("filterTipe");e&&e.addEventListener("click",function(n){if(this.checked&&s.type==="tipe"){this.checked=!1,y();return}s.type="tipe",F()}),(a=document.getElementById("applyFilter"))==null||a.addEventListener("click",T),(t=document.getElementById("resetFilter"))==null||t.addEventListener("click",y)}async function F(){var a,t;const e=document.getElementById("filterOptionsContainer");e.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),e.innerHTML=`
        <div class="mb-3">
            <label class="form-label">Tipe</label>
            <select class="form-select" id="dropdownTipe">
                <option value="">Memuat tipe...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`,await R(),(a=document.getElementById("applyFilter"))==null||a.addEventListener("click",T),(t=document.getElementById("resetFilter"))==null||t.addEventListener("click",y)}async function R(){try{const{data:e,error:a}=await u.rpc("get_enum_values",{enum_name:"tipe_riwayat"}),t=document.getElementById("dropdownTipe");if(a)throw a;t.innerHTML='<option value="">Pilih Tipe Riwayat</option>',e.forEach(n=>{const r=document.createElement("option");r.value=n.value,r.textContent=n.value.charAt(0).toUpperCase()+n.value.slice(1),t.appendChild(r)}),s.tipe&&(t.value=s.tipe)}catch(e){console.error("Error loading type:",e),document.getElementById("dropdownTipe").innerHTML='<option value="">Error loading types</option>',d("Gagal memuat daftar tipe riwayat","error")}}function T(){s.tipe=null,s.type==="tipe"&&(s.tipe=document.getElementById("dropdownTipe").value),S()}function y(){const e=document.getElementById("filterTipe");e&&(e.checked=!1),s.type=null,s.tipe=null,document.getElementById("filterCard").classList.add("d-none");const a=m();f(a)}async function S(){const e=document.getElementById("historyTableBody"),a=m();e.innerHTML=`
        <tr>
            <td colspan="8" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat entri...
            </td>
        </tr>`;try{let t=u.from("riwayat_stok").select("*").eq("id_varian",a).order("tanggal",{ascending:!1});s.type==="tipe"&&s.tipe&&(t=t.eq("tipe_riwayat",s.tipe));const{data:n,error:r}=await t;if(r)throw r;q(n)}catch(t){console.error("Error filtering entries:",t),d("Gagal memfilter entri","error"),e.innerHTML=`
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Gagal memuat entri riwayat
                </td>
            </tr>`}}function q(e){const a=document.getElementById("historyTableBody");if(a.innerHTML="",!e||e.length===0){a.innerHTML=`
            <tr>
                <td colspan="8" class="text-center text-muted">  
                    Tidak ada entri yang cocok dengan pencarian
                </td>
            </tr>`;return}e.forEach(t=>{const n=document.createElement("tr");n.innerHTML=`
            <td>${t.id}</td>
            <td>${b(t.tanggal)}</td>
            <td>${t.tipe_riwayat.charAt(0).toUpperCase()+t.tipe_riwayat.slice(1)}</td>
            <td>${t.qty}</td>
            <td>${t.saldo??"-"}</td>
            <td>${t.harga?"Rp "+t.harga.toLocaleString("id-ID"):"-"}</td>
            <td>${t.hpp?"Rp "+t.hpp.toLocaleString("id-ID"):"-"}</td>
            <td>${t.stok_sisa??"-"}</td>
        `,a.appendChild(n)})}document.addEventListener("DOMContentLoaded",async()=>{await _();const e=m();if(!e){alert("ID varian tidak valid. Kembali ke halaman produk."),window.location.href="product.html";return}[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function(r){return new bootstrap.Tooltip(r)}),await x(),await f(e),D();const t=document.getElementById("historyForm");t&&t.addEventListener("submit",C);const n=document.getElementById("backButton");n&&n.addEventListener("click",()=>{window.location.href="product.html"})});
