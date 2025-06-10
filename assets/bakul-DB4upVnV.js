import{s as i}from"./db_conn-CuK1RHLN.js";import{i as I,c as L,l as T,d as M}from"./navbarLoad-Bx0DZV6w.js";I();(async()=>(await L(),await T()))();function x(){const t=document.getElementById("bakulForm");t&&(t.reset(),t.dataset.bakulId="",document.getElementById("bakulModalLabel").textContent="Tambah Bakul",document.getElementById("submitButton").textContent="Tambah")}function d(t,e="success"){const a=document.getElementById("toastContainer"),n=document.createElement("div");n.classList.add("toast"),n.setAttribute("role","alert"),n.setAttribute("aria-live","assertive"),n.setAttribute("aria-atomic","true"),n.classList.add(e==="success"?"bg-success":"bg-danger"),n.classList.add("text-white");const o=document.createElement("div");o.classList.add("toast-body"),o.textContent=t,n.appendChild(o),a.appendChild(n),new bootstrap.Toast(n,{autohide:!0,delay:3e3}).show(),n.addEventListener("hidden.bs.toast",()=>{n.remove()})}async function _(){const t=document.getElementById("kota");if(!t){console.warn("Kota dropdown not found in the DOM.");return}try{const{data:e,error:a}=await i.from("kota").select("id, kota");if(a)throw a;t.innerHTML='<option value="" disabled selected>Pilih Kota</option>',e.forEach(n=>{const o=document.createElement("option");o.value=n.id,o.text=n.kota,t.appendChild(o)})}catch(e){console.error("Error fetching cities:",e.message),d("Failed to load cities. Please try again.","error")}}async function F(){const t=document.getElementById("nama").value,e=document.getElementById("no_hp").value,a=document.getElementById("kota").value,n=document.getElementById("bakulForm").dataset.bakulId;try{if(n){const{data:s,error:l}=await i.from("bakul").update({nama:t,no_hp:e,id_kota:a}).eq("id",n);if(l)throw l;d("Data bakul berhasil diperbarui!","success")}else{const{data:s,error:l}=await i.from("bakul").insert([{nama:t,no_hp:e,id_kota:a}]);if(l)throw l;d("Data bakul berhasil ditambahkan!","success")}bootstrap.Modal.getInstance(document.getElementById("bakulModal")).hide(),await y()}catch(o){console.error("Error saving supplier:",o.message),d("Gagal menyimpan data bakul, silahkan coba lagi.","error")}}async function C(t){try{const{data:e,error:a}=await i.from("bakul").select("*").eq("id",t).single();if(a)throw a;document.getElementById("nama").value=e.nama,document.getElementById("no_hp").value=e.no_hp,document.getElementById("kota").value=e.id_kota,document.getElementById("bakulModalLabel").textContent="Edit Bakul",document.getElementById("submitButton").textContent="Edit",document.getElementById("bakulForm").dataset.bakulId=t,new bootstrap.Modal(document.getElementById("bakulModal")).show()}catch(e){console.error("Error fetching supplier:",e.message),d("Gagal mengambil data bakul, silahkan coba lagi.","error")}}async function H(t){if(confirm("Apakah Anda yakin ingin menghapus data bakul ini?"))try{const{data:e,error:a}=await i.from("bakul").delete().eq("id",t);if(a)throw a;await y(),d("Data bakul berhasil dihapus!","success")}catch(e){console.error("Error deleting supplier:",e.message),d("Gagal menghapus data bakul, silahkan coba lagi.","error")}}async function y(){const t=document.getElementById("bakulTableBody");if(t)try{t.innerHTML=`
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat bakul...
                </td>
            </tr>`;const{data:e,error:a}=await i.from("bakul").select(`
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
                <td>${n.no_hp?n.no_hp:"-"}</td> <!-- Handle null for no_hp -->
                <td>${(s=n.kota)!=null&&s.kota?n.kota.kota:"-"}</td> <!-- Handle null for kota -->
                <td>
                    <button class="btn btn-primary btn-sm" onclick="editBakul(${n.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBakul(${n.id})">Delete</button>
                </td>
            `,t.appendChild(o)})}catch(e){console.error("Error fetching bakul:",e.message),d("Gagal menampilkan data bakul, silahkan coba lagi.","error")}}const r={type:null,kota:null};function $(){var e,a;const t=document.getElementById("filterKota");t&&t.addEventListener("click",function(n){if(this.checked&&r.type==="kota"){this.checked=!1,h();return}r.type="kota",D()}),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",f),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",h)}async function D(){var e,a;const t=document.getElementById("filterOptionsContainer");t.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),t.innerHTML=`
        <div class="mb-3">
            <label class="form-label">Kota</label>
            <select class="form-select" id="dropdownKota">
                <option value="">Memuat kota...</option>
            </select>
        </div>
        <div class="card-footer bg-light">
            <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
            <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
        </div>`,await K(),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",f),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",h)}async function K(){try{const{data:t,error:e}=await i.from("kota").select("id, kota").order("kota",{ascending:!0});if(e)throw e;const a=document.getElementById("dropdownKota");a.innerHTML='<option value="">Pilih Kota</option>',t.forEach(n=>{const o=document.createElement("option");o.value=n.id,o.textContent=n.kota,a.appendChild(o)})}catch(t){console.error("Error loading kota:",t),d("Gagal memuat daftar kota","error")}}function f(){r.kota=null,r.type==="kota"&&(r.kota=document.getElementById("dropdownKota").value),E()}function h(){const t=document.getElementById("filterKota");t&&(t.checked=!1),r.type=null,r.kota=null,document.getElementById("filterCard").classList.add("d-none"),fetchSuppliers()}async function E(){const t=document.getElementById("bakulTableBody");try{t.innerHTML=`
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat bakul...
                </td>
            </tr>`;let e=i.from("bakul").select(`
                id, 
                nama,
                no_hp,
                kota:id_kota(kota)
            `).order("id",{ascending:!0});r.type==="kota"&&r.kota&&(e=e.eq("id_kota",r.kota));const{data:a,error:n}=await e;if(n)throw n;B(a)}catch(e){console.error("Error filtering bakuls:",e),d("Gagal memfilter bakul","error"),t.innerHTML=`
            <tr>
                <td colspan="5" class="text-center text-danger">
                    Gagal memuat data bakul
                </td>
            </tr>`}}async function b(){const t=document.getElementById("searchInput").value.trim().toLowerCase();try{const e=document.getElementById("bakulTableBody");e.innerHTML=`
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat bakul...
                </td>
            </tr>`;let a=i.from("bakul").select(`
                id, 
                nama,
                no_hp,
                kota:id_kota(kota)
            `).order("id",{ascending:!0});r.type==="kota"&&r.kota&&(a=a.eq("id_kota",r.kota));const n=a;t&&n.or(`nama.ilike.%${t}%,no_hp.ilike.%${t}%`);const{data:o,error:s}=await n;let l=[];if(t&&!(r.type==="kota"&&r.kota)){const{data:c,error:u}=await i.from("kota").select("id, kota").ilike("kota",`%${t}%`);if(!u&&(c==null?void 0:c.length)>0){const m=c.map(v=>v.id),{data:p,error:w}=await a.in("id_kota",m);w||(l=p||[])}}let k;t?k=[...o||[],...l].reduce((u,m)=>(u.some(p=>p.id===m.id)||u.push(m),u),[]):k=o||[],B(k)}catch(e){console.error("Error searching bakuls:",e),d("Gagal melakukan pencarian bakul","error"),document.getElementById("bakulTableBody").innerHTML=`
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
        `,e.appendChild(n)})}function g(){const t=document.getElementById("searchInput"),e=document.getElementById("searchIcon");t.value.trim()?e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`:e.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`}function G(){document.getElementById("searchInput").value="",g(),E()}document.addEventListener("DOMContentLoaded",async()=>{await M(),await _(),await y(),$();const t=document.getElementById("bakulForm");t&&t.addEventListener("submit",async o=>{o.preventDefault(),await F()});const e=document.getElementById("bakulModal");e&&e.addEventListener("hidden.bs.modal",()=>{x()});const a=document.getElementById("searchInput"),n=document.getElementById("searchButton");n&&a&&(n.addEventListener("click",()=>{a.value.trim()&&document.getElementById("searchIcon").innerHTML.includes("bi-x")?G():b()}),a.addEventListener("keyup",o=>{g(),o.key==="Enter"&&b()}),a.addEventListener("input",g))});window.editBakul=C;window.deleteBakul=H;
