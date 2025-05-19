import"./modulepreload-polyfill-B5Qt9EMX.js";import{s}from"./db_conn-C7Nb5uSA.js";import{p as f}from"./import-Cn2uwdsk.js";function l(e,a="success"){const t=document.getElementById("toastContainer"),n=document.createElement("div");n.classList.add("toast"),n.setAttribute("role","alert"),n.setAttribute("aria-live","assertive"),n.setAttribute("aria-atomic","true"),n.classList.add(a==="success"?"bg-success":"bg-danger"),n.classList.add("text-white");const r=document.createElement("div");r.classList.add("toast-body"),r.textContent=e,n.appendChild(r),t.appendChild(n),new bootstrap.Toast(n,{autohide:!0,delay:3e3}).show(),n.addEventListener("hidden.bs.toast",()=>{n.remove()})}function c(){return new URLSearchParams(window.location.search).get("variantId")}async function v(e){const{data:a,error:t}=await s.from("produk_varian").select(`
            *,
            produk:id_produk(*)
        `).eq("id",e).single();return t?(console.error("Error fetching variant details:",t),null):a}async function w(){const e=document.getElementById("tipe_riwayat");e.innerHTML='<option value="">Memuat tipe riwayat...</option>';try{const{data:a,error:t}=await s.rpc("get_enum_values",{enum_name:"tipe_riwayat"});if(t)throw t;e.innerHTML='<option value="" disabled selected>Pilih tipe riwayat</option>',a.filter(r=>r.value==="penyesuaian_masuk"||r.value==="penyesuaian_keluar").forEach(r=>{const d=document.createElement("option");d.value=r.value,d.text=r.value.charAt(0).toUpperCase()+r.value.slice(1).replace("_"," "),e.appendChild(d)})}catch(a){console.error("Error fetching tipe_riwayat enum:",a),e.innerHTML='<option value="">Error loading tipe riwayat</option>',l("Gagal memuat tipe riwayat","error")}}async function h(e){e.preventDefault();const a=c();document.getElementById("tanggal").value;const t=document.getElementById("tipe_riwayat").value,n=parseInt(document.getElementById("qty").value,10);if(document.getElementById("harga")&&parseFloat(document.getElementById("harga").value),!a||!t||!n){alert("Harap isi semua field yang diperlukan.");return}await f({variantId:a,quantity:n})}async function y(e){const a=document.getElementById("historyTableBody");try{if(a.innerHTML=`
            <tr>
                <td colspan="8" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat entri...
                </td>
            </tr>`,!e){a.innerHTML='<tr><td colspan="8" class="text-center text-danger">Tidak ditemukan ID varian dalam URL.</td></tr>';return}const t=await v(e);if(!t){a.innerHTML='<tr><td colspan="8" class="text-center text-danger">Varian tidak ditemukan.</td></tr>';return}const n=document.querySelector("h3");n&&(n.textContent=`Riwayat stok untuk "${t.produk.nama}" - ${t.varian}`);const r=document.getElementById("currentStock");r&&(r.textContent=`Stok saat ini: ${t.jumlah_stok}`);const{data:d,error:u}=await s.from("riwayat_stok").select("*").eq("id_varian",e).order("tanggal",{ascending:!1});if(u)throw u;if(console.log("History data:",d),!d||d.length===0){a.innerHTML='<tr><td colspan="8" class="text-center">Tidak ada riwayat stok yang ditemukan untuk varian ini.</td></tr>';return}a.innerHTML="",d.forEach(o=>{const m=document.createElement("tr");m.innerHTML=`
                <td>${o.id}</td>
                <td>${new Date(o.tanggal).toLocaleString("id-ID")}</td>
                <td>${o.tipe_riwayat.charAt(0).toUpperCase()+o.tipe_riwayat.slice(1)}</td>
                <td>${o.qty}</td>
                <td>${o.saldo??"-"}</td>
                <td>${o.harga!==null?"Rp "+o.harga.toLocaleString("id-ID"):"-"}</td>
                <td>${o.hpp?"Rp "+o.hpp.toLocaleString("id-ID"):"-"}</td>
                <td>${o.stok_sisa??"-"}</td>
            `,a.appendChild(m)})}catch(t){console.error("Error:",t),a.innerHTML=`
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Gagal memuat riwayat stok: ${t.message}
                </td>
            </tr>`,l("Gagal memuat riwayat stok","error")}}const i={type:null,tipe:null};function E(){var a,t;const e=document.getElementById("filterTipe");e&&e.addEventListener("click",function(n){if(this.checked&&i.type==="tipe"){this.checked=!1,p();return}i.type="tipe",T()}),(a=document.getElementById("applyFilter"))==null||a.addEventListener("click",g),(t=document.getElementById("resetFilter"))==null||t.addEventListener("click",p)}async function T(){var a,t;const e=document.getElementById("filterOptionsContainer");e.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),e.innerHTML=`
        <div class="mb-3">
            <label class="form-label">Tipe</label>
            <select class="form-select" id="dropdownTipe">
                <option value="">Memuat tipe...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`,await L(),(a=document.getElementById("applyFilter"))==null||a.addEventListener("click",g),(t=document.getElementById("resetFilter"))==null||t.addEventListener("click",p)}async function L(){try{const{data:e,error:a}=await s.rpc("get_enum_values",{enum_name:"tipe_riwayat"}),t=document.getElementById("dropdownTipe");if(a)throw a;t.innerHTML='<option value="">Pilih Tipe Riwayat</option>',e.forEach(n=>{const r=document.createElement("option");r.value=n.value,r.textContent=n.value.charAt(0).toUpperCase()+n.value.slice(1),t.appendChild(r)}),i.tipe&&(t.value=i.tipe)}catch(e){console.error("Error loading type:",e),document.getElementById("dropdownTipe").innerHTML='<option value="">Error loading types</option>',l("Gagal memuat daftar tipe riwayat","error")}}function g(){i.tipe=null,i.type==="tipe"&&(i.tipe=document.getElementById("dropdownTipe").value),b()}function p(){const e=document.getElementById("filterTipe");e&&(e.checked=!1),i.type=null,i.tipe=null,document.getElementById("filterCard").classList.add("d-none");const a=c();y(a)}async function b(){const e=document.getElementById("historyTableBody"),a=c();e.innerHTML=`
        <tr>
            <td colspan="8" class="text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat entri...
            </td>
        </tr>`;try{let t=s.from("riwayat_stok").select("*").eq("id_varian",a).order("tanggal",{ascending:!1});i.type==="tipe"&&i.tipe&&(t=t.eq("tipe_riwayat",i.tipe));const{data:n,error:r}=await t;if(r)throw r;k(n)}catch(t){console.error("Error filtering entries:",t),l("Gagal memfilter entri","error"),e.innerHTML=`
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Gagal memuat entri riwayat
                </td>
            </tr>`}}function k(e){const a=document.getElementById("historyTableBody");if(a.innerHTML="",!e||e.length===0){a.innerHTML=`
            <tr>
                <td colspan="8" class="text-center text-muted">  
                    Tidak ada entri yang cocok dengan pencarian
                </td>
            </tr>`;return}e.forEach(t=>{const n=document.createElement("tr");n.innerHTML=`
            <td>${t.id}</td>
            <td>${new Date(t.tanggal).toLocaleString("id-ID")}</td>
            <td>${t.tipe_riwayat.charAt(0).toUpperCase()+t.tipe_riwayat.slice(1)}</td>
            <td>${t.qty}</td>
            <td>${t.saldo??"-"}</td>
            <td>${t.harga?"Rp "+t.harga.toLocaleString("id-ID"):"-"}</td>
            <td>${t.hpp?"Rp "+t.hpp.toLocaleString("id-ID"):"-"}</td>
            <td>${t.stok_sisa??"-"}</td>
        `,a.appendChild(n)})}document.addEventListener("DOMContentLoaded",async()=>{const e=c();if(!e){alert("ID varian tidak valid. Kembali ke halaman produk."),window.location.href="product.html";return}[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function(r){return new bootstrap.Tooltip(r)}),await w(),await y(e),E();const t=document.getElementById("historyForm");t&&t.addEventListener("submit",h);const n=document.getElementById("backButton");n&&n.addEventListener("click",()=>{window.location.href="product.html"})});
