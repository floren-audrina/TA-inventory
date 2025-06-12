import"./modulepreload-polyfill.js";import{n as h,d as v,p as w}from"./import.js";import{s}from"./db_conn.js";import{i as E,c as b}from"./auth.js";fetch("navbar.html").then(t=>t.text()).then(t=>{document.getElementById("navbar").innerHTML=t;const a=document.createElement("script");a.type="module",a.src=h,document.body.appendChild(a)}).catch(t=>console.error("Error loading navbar:",t));E();(async()=>await b())();function y(t){return t?new Date(t).toLocaleDateString("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:!1,timeZone:"Asia/Jakarta"}):"-"}function l(t,a="success"){const e=document.getElementById("toastContainer"),n=document.createElement("div");n.classList.add("toast"),n.setAttribute("role","alert"),n.setAttribute("aria-live","assertive"),n.setAttribute("aria-atomic","true"),n.classList.add(a==="success"?"bg-success":"bg-danger"),n.classList.add("text-white");const r=document.createElement("div");r.classList.add("toast-body"),r.textContent=t,n.appendChild(r),e.appendChild(n),new bootstrap.Toast(n,{autohide:!0,delay:3e3}).show(),n.addEventListener("hidden.bs.toast",()=>{n.remove()})}function c(){return new URLSearchParams(window.location.search).get("variantId")}async function T(t){const{data:a,error:e}=await s.from("produk_varian").select(`
            *,
            produk:id_produk(*)
        `).eq("id",t).single();return e?(console.error("Error fetching variant details:",e),null):a}async function L(){const t=document.getElementById("tipe_riwayat");t.innerHTML='<option value="">Memuat tipe riwayat...</option>';try{const{data:a,error:e}=await s.rpc("get_enum_values",{enum_name:"tipe_riwayat"});if(e)throw e;t.innerHTML='<option value="" disabled selected>Pilih tipe riwayat</option>',a.filter(r=>r.value==="penyesuaian_masuk"||r.value==="penyesuaian_keluar").forEach(r=>{const d=document.createElement("option");d.value=r.value,d.text=r.value.charAt(0).toUpperCase()+r.value.slice(1).replace("_"," "),t.appendChild(d)})}catch(a){console.error("Error fetching tipe_riwayat enum:",a),t.innerHTML='<option value="">Error loading tipe riwayat</option>',l("Gagal memuat tipe riwayat","error")}}async function k(t){t.preventDefault();const a=c();document.getElementById("tanggal").value;const e=document.getElementById("tipe_riwayat").value,n=parseInt(document.getElementById("qty").value,10);if(document.getElementById("harga")&&parseFloat(document.getElementById("harga").value),!a||!e||!n){alert("Harap isi semua field yang diperlukan.");return}await w({variantId:a,quantity:n})}async function g(t){const a=document.getElementById("historyTableBody");try{if(a.innerHTML=`
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat entri...
                </td>
            </tr>`,!t){a.innerHTML='<tr><td colspan="8" class="text-center text-danger">Tidak ditemukan ID varian dalam URL.</td></tr>';return}const e=await T(t);if(!e){a.innerHTML='<tr><td colspan="8" class="text-center text-danger">Varian tidak ditemukan.</td></tr>';return}const n=document.querySelector("h3");n&&(n.textContent=`Riwayat stok untuk "${e.produk.nama}" - ${e.varian}`);const r=document.getElementById("currentStock");r&&(r.textContent=`Stok saat ini: ${e.jumlah_stok}`);const{data:d,error:p}=await s.from("riwayat_stok").select("*").eq("id_varian",t).order("tanggal",{ascending:!1});if(p)throw p;if(console.log("History data:",d),!d||d.length===0){a.innerHTML='<tr><td colspan="8" class="text-center">Tidak ada riwayat stok yang ditemukan untuk varian ini.</td></tr>';return}a.innerHTML="",d.forEach(o=>{const m=document.createElement("tr");m.innerHTML=`
                <td>${o.id}</td>
                <td>${y(o.tanggal)}</td>
                <td>${o.tipe_riwayat.charAt(0).toUpperCase()+o.tipe_riwayat.slice(1)}</td>
                <td>${o.qty}</td>
                <td>${o.saldo??"-"}</td>
                <td>${o.harga!==null?"Rp "+o.harga.toLocaleString("id-ID"):"-"}</td>
                <td>${o.hpp?"Rp "+o.hpp.toLocaleString("id-ID"):"-"}</td>
                <td>${o.stok_sisa??"-"}</td>
            `,a.appendChild(m)})}catch(e){console.error("Error:",e),a.innerHTML=`
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Gagal memuat riwayat stok: ${e.message}
                </td>
            </tr>`,l("Gagal memuat riwayat stok","error")}}const i={type:null,tipe:null};function I(){var a,e;const t=document.getElementById("filterTipe");t&&t.addEventListener("click",function(n){if(this.checked&&i.type==="tipe"){this.checked=!1,u();return}i.type="tipe",B()}),(a=document.getElementById("applyFilter"))==null||a.addEventListener("click",f),(e=document.getElementById("resetFilter"))==null||e.addEventListener("click",u)}async function B(){var a,e;const t=document.getElementById("filterOptionsContainer");t.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),t.innerHTML=`
        <div class="mb-3">
            <label class="form-label">Tipe</label>
            <select class="form-select" id="dropdownTipe">
                <option value="">Memuat tipe...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`,await _(),(a=document.getElementById("applyFilter"))==null||a.addEventListener("click",f),(e=document.getElementById("resetFilter"))==null||e.addEventListener("click",u)}async function _(){try{const{data:t,error:a}=await s.rpc("get_enum_values",{enum_name:"tipe_riwayat"}),e=document.getElementById("dropdownTipe");if(a)throw a;e.innerHTML='<option value="">Pilih Tipe Riwayat</option>',t.forEach(n=>{const r=document.createElement("option");r.value=n.value,r.textContent=n.value.charAt(0).toUpperCase()+n.value.slice(1),e.appendChild(r)}),i.tipe&&(e.value=i.tipe)}catch(t){console.error("Error loading type:",t),document.getElementById("dropdownTipe").innerHTML='<option value="">Error loading types</option>',l("Gagal memuat daftar tipe riwayat","error")}}function f(){i.tipe=null,i.type==="tipe"&&(i.tipe=document.getElementById("dropdownTipe").value),M()}function u(){const t=document.getElementById("filterTipe");t&&(t.checked=!1),i.type=null,i.tipe=null,document.getElementById("filterCard").classList.add("d-none");const a=c();g(a)}async function M(){const t=document.getElementById("historyTableBody"),a=c();t.innerHTML=`
        <tr>
            <td colspan="8" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat entri...
            </td>
        </tr>`;try{let e=s.from("riwayat_stok").select("*").eq("id_varian",a).order("tanggal",{ascending:!1});i.type==="tipe"&&i.tipe&&(e=e.eq("tipe_riwayat",i.tipe));const{data:n,error:r}=await e;if(r)throw r;H(n)}catch(e){console.error("Error filtering entries:",e),l("Gagal memfilter entri","error"),t.innerHTML=`
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Gagal memuat entri riwayat
                </td>
            </tr>`}}function H(t){const a=document.getElementById("historyTableBody");if(a.innerHTML="",!t||t.length===0){a.innerHTML=`
            <tr>
                <td colspan="8" class="text-center text-muted">  
                    Tidak ada entri yang cocok dengan pencarian
                </td>
            </tr>`;return}t.forEach(e=>{const n=document.createElement("tr");n.innerHTML=`
            <td>${e.id}</td>
            <td>${y(history.tanggal)}</td>
            <td>${e.tipe_riwayat.charAt(0).toUpperCase()+e.tipe_riwayat.slice(1)}</td>
            <td>${e.qty}</td>
            <td>${e.saldo??"-"}</td>
            <td>${e.harga?"Rp "+e.harga.toLocaleString("id-ID"):"-"}</td>
            <td>${e.hpp?"Rp "+e.hpp.toLocaleString("id-ID"):"-"}</td>
            <td>${e.stok_sisa??"-"}</td>
        `,a.appendChild(n)})}document.addEventListener("DOMContentLoaded",async()=>{await v();const t=c();if(!t){alert("ID varian tidak valid. Kembali ke halaman produk."),window.location.href="product.html";return}[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function(r){return new bootstrap.Tooltip(r)}),await L(),await g(t),I();const e=document.getElementById("historyForm");e&&e.addEventListener("submit",k);const n=document.getElementById("backButton");n&&n.addEventListener("click",()=>{window.location.href="product.html"})});
