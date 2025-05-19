import"./modulepreload-polyfill-B5Qt9EMX.js";import{s as d}from"./db_conn-C7Nb5uSA.js";const Z="data:text/javascript;base64,Y29uc3Qgc2lkZWJhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzaWRlYmFyJyk7DQpjb25zdCBtZW51VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21lbnUtdG9nZ2xlJyk7DQoNCm1lbnVUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7DQogICAgc2lkZWJhci5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTsgLy8gVG9nZ2xlIHNpZGViYXINCn0pOw0KDQovLyBIaWRlIHNpZGViYXIgaWYgdXNlciBjbGlja3Mgb3V0c2lkZQ0KZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHsNCiAgICBpZiAoIXNpZGViYXIuY29udGFpbnMoZXZlbnQudGFyZ2V0KSAmJiAhbWVudVRvZ2dsZS5jb250YWlucyhldmVudC50YXJnZXQpKSB7DQogICAgICAgIHNpZGViYXIuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7IC8vIENsb3NlIHNpZGViYXINCiAgICB9DQp9KTs=";fetch("navbar.html").then(e=>e.text()).then(e=>{document.getElementById("navbar").innerHTML=e;const t=document.createElement("script");t.type="module",t.src=Z,document.body.appendChild(t)}).catch(e=>console.error("Error loading navbar:",e));let T,I=null,o={type:null,category:null,subcategory:null,supplier:null,variant:null};const G=new Map([[.25,"1/4 lusin"],[.5,"1/2 lusin"],[1,"1 lusin"]]);function F(){var e,t;document.querySelectorAll('input[name="filterGroup"]').forEach(a=>{a.addEventListener("click",function(r){if(this.checked&&o.type===this.value){this.checked=!1,B();return}o.type=this.value,$()})}),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",H),(t=document.getElementById("resetFilter"))==null||t.addEventListener("click",B)}async function $(){var t,a;const e=document.getElementById("filterOptionsContainer");switch(e.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),o.type){case"kategori":e.innerHTML=`
                <div class="mb-3">
                    <label class="form-label">Kategori</label>
                    <select class="form-select" id="filterCategory">
                        <option value="">Pilih Kategori</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Subkategori</label>
                    <select class="form-select" id="filterSubcategory" disabled>
                        <option value="">Pilih Subkategori</option>
                    </select>
                </div>
                <div class="card-footer bg-light">
                    <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
                    <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
                </div>`,await A();break;case"supplier":e.innerHTML=`
                <div class="mb-3">
                    <label class="form-label">Supplier</label>
                    <select class="form-select" id="dropdownSupplier">
                        <option value="">Memuat supplier...</option>
                    </select>
                </div>
                <div class="card-footer bg-light">
                    <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
                    <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
                </div>`,await z();break;case"varian":e.innerHTML=`
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="variantOption" id="variantAll" value="" checked>
                    <label class="form-check-label" for="variantAll">Semua Produk</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="variantOption" id="variantHas" value="has">
                    <label class="form-check-label" for="variantHas">Dengan Varian</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="variantOption" id="variantNone" value="none">
                    <label class="form-check-label" for="variantNone">Tanpa Varian</label>
                </div>
                <div class="card-footer bg-light">
                    <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
                    <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
                </div>`;break}(t=document.getElementById("applyFilter"))==null||t.addEventListener("click",H),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",B)}async function A(){try{const{data:e,error:t}=await d.from("kategori").select("id, kategori").order("kategori",{ascending:!0});if(t)throw t;const a=document.getElementById("filterCategory");a.innerHTML='<option value="">Pilih Kategori</option>',e.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.kategori,a.appendChild(n)}),a.addEventListener("change",function(){const r=document.getElementById("filterSubcategory");r.disabled=!this.value,this.value?N(this.value):r.innerHTML='<option value="">Pilih Subkategori</option>'})}catch(e){console.error("Error loading categories:",e),g("Gagal memuat daftar kategori","error")}}async function C(){const e=document.getElementById("productTableBody");try{e.innerHTML=`
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`;let t=d.from("produk").select(`
                id, 
                nama, 
                qty_minimum, 
                id_supplier,
                id_subkategori,
                subkategori!inner(
                  id,
                  subkategori,
                  kategori!inner(
                    id,
                    kategori
                  )
                ),
                supplier:supplier (perusahaan, cp)
              `).order("id",{ascending:!0});switch(o.type){case"kategori":o.category&&(o.subcategory?t=t.eq("id_subkategori",o.subcategory):t=t.eq("subkategori.kategori.id",o.category));break;case"supplier":o.supplier&&(t=t.eq("id_supplier",o.supplier));break}const{data:a,error:r}=await t;if(r)throw r;const{data:n,error:s}=await d.from("produk_varian").select("*");if(s)throw s;const u=n.reduce((p,i)=>(p[i.id_produk]||(p[i.id_produk]=[]),p[i.id_produk].push(i),p),{});let h=a;o.type==="varian"&&o.variant&&(h=a.filter(p=>{const i=u[p.id]||[],b=i.length>1||i.length===1&&i[0].varian.toLowerCase()!=="standar";return o.variant==="has"?b:o.variant==="none"?!b:!0})),x(h,u)}catch(t){console.error("Error filtering products:",t),g("Gagal memfilter produk","error"),e.innerHTML=`
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Gagal memuat data produk
                </td>
            </tr>`}}async function N(e){try{const{data:t,error:a}=await d.from("subkategori").select("id, subkategori").eq("id_kategori",e).order("subkategori",{ascending:!0});if(a)throw a;const r=document.getElementById("filterSubcategory");r.innerHTML='<option value="">Pilih Subkategori</option>',t.forEach(n=>{const s=document.createElement("option");s.value=n.id,s.textContent=n.subkategori,r.appendChild(s)})}catch(t){console.error("Error loading subcategories:",t),g("Gagal memuat daftar subkategori","error")}}function H(){switch(o.category=null,o.subcategory=null,o.supplier=null,o.variant=null,o.type){case"kategori":o.category=document.getElementById("filterCategory").value,o.subcategory=document.getElementById("filterSubcategory").value;break;case"supplier":o.supplier=document.getElementById("dropdownSupplier").value;break;case"varian":const e=document.querySelector('input[name="variantOption"]:checked');o.variant=(e==null?void 0:e.value)||null;break}C()}function B(){document.querySelectorAll('input[name="filterGroup"]').forEach(e=>{e.checked=!1}),o={type:null,category:null,subcategory:null,supplier:null,variant:null},document.getElementById("filterCard").classList.add("d-none"),_()}async function w(){const e=document.getElementById("searchInput").value.trim().toLowerCase();try{const t=document.getElementById("productTableBody");t.innerHTML=`
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`;const{data:a,error:r}=await d.from("produk").select(`
                id, 
                nama, 
                qty_minimum, 
                id_supplier,
                id_subkategori,
                subkategori!inner(id, subkategori, kategori!inner(id, kategori)),
                supplier:supplier (perusahaan, cp)
            `).ilike("nama",`%${e}%`).order("id",{ascending:!0}),{data:n,error:s}=await d.from("produk").select(`
                id, 
                nama, 
                qty_minimum, 
                id_supplier,
                id_subkategori,
                subkategori!inner(id, subkategori, kategori!inner(id, kategori)),
                supplier:supplier (perusahaan, cp)
            `).not("id_supplier","is",null).order("id",{ascending:!0}),u=(n==null?void 0:n.filter(l=>{var c,m,k,f;return((m=(c=l.supplier)==null?void 0:c.perusahaan)==null?void 0:m.toLowerCase().includes(e))||((f=(k=l.supplier)==null?void 0:k.cp)==null?void 0:f.toLowerCase().includes(e))}))||[],{data:h,error:p}=await d.from("produk").select(`
                id, 
                nama, 
                qty_minimum, 
                id_supplier,
                id_subkategori,
                subkategori!inner(id, subkategori, kategori!inner(id, kategori)),
                supplier:supplier (perusahaan, cp)
            `).not("id_subkategori","is",null).order("id",{ascending:!0}),i=(h==null?void 0:h.filter(l=>{var c,m,k,f,q;return((m=(c=l.subkategori)==null?void 0:c.subkategori)==null?void 0:m.toLowerCase().includes(e))||((q=(f=(k=l.subkategori)==null?void 0:k.kategori)==null?void 0:f.kategori)==null?void 0:q.toLowerCase().includes(e))}))||[];let v=[...a||[],...u,...i].reduce((l,c)=>(l.some(m=>m.id===c.id)||l.push(c),l),[]);if(o.type)switch(o.type){case"kategori":o.category&&(v=v.filter(l=>{var c,m;return o.subcategory?l.id_subkategori===o.subcategory:((m=(c=l.subkategori)==null?void 0:c.kategori)==null?void 0:m.id)===o.category}));break;case"supplier":o.supplier&&(v=v.filter(l=>l.id_supplier===o.supplier));break;case"varian":break}const{data:V,error:M}=await d.from("produk_varian").select("*");if(M)throw M;const S=V.reduce((l,c)=>(l[c.id_produk]||(l[c.id_produk]=[]),l[c.id_produk].push(c),l),{});o.type==="varian"&&o.variant&&(v=v.filter(l=>{const c=S[l.id]||[],m=c.length>1||c.length===1&&c[0].varian.toLowerCase()!=="standar";return o.variant==="has"?m:!m})),x(v,S)}catch(t){console.error("Error searching products:",t),g("Gagal melakukan pencarian","error"),document.getElementById("productTableBody").innerHTML=`
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Gagal memuat data produk
                </td>
            </tr>`}}function x(e,t){const a=document.getElementById("productTableBody");if(a.innerHTML="",!e||e.length===0){a.innerHTML=`
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Tidak ada produk yang cocok dengan pencarian
                </td>
            </tr>`;return}e.forEach(r=>{var u,h,p,i,b;const n=t[r.id]||[],s=document.createElement("tr");s.innerHTML=`
            <td>${r.id}</td>
            <td>${r.nama}</td>
            <td>${((h=(u=r.subkategori)==null?void 0:u.kategori)==null?void 0:h.kategori)||"-"} (${((p=r.subkategori)==null?void 0:p.subkategori)||"-"})</td>
            <td>
                ${n.length>0?`<a href="#" class="variant-toggle">Klik untuk melihat varian ▼</a>
                       <div class="nested-table mt-2" style="display: none;">
                           <table class="table table-bordered">
                               <thead>
                                   <tr>
                                       <th>Varian</th>
                                       <th>Harga</th>
                                       <th>Jumlah stok</th>
                                       <th>Stok reservasi</th>
                                       <th>Aksi</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   ${n.map(y=>`
                                       <tr>
                                           <td>${y.varian}</td>
                                           <td>Rp ${y.harga_standar.toLocaleString("id-ID")}</td>
                                           <td>${y.jumlah_stok}</td>
                                           <td>${y.stok_reservasi}</td>
                                           <td><button class="btn btn-info btn-sm" onclick="viewVariantHistory(${y.id})">Detail Varian</button></td>
                                       </tr>
                                   `).join("")}
                               </tbody>
                           </table>
                       </div>`:"Tidak ada varian"}
            </td>
            <td>${((i=r.supplier)==null?void 0:i.perusahaan)||"-"} (${((b=r.supplier)==null?void 0:b.cp)||"-"})</td>
            <td>${G.get(r.qty_minimum)||r.qty_minimum}</td>
            <td>
                <button class="btn btn-primary btn-sm me-1" onclick="editProduct(${r.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${r.id})">Hapus</button>
            </td>
        `,a.appendChild(s)}),document.querySelectorAll(".variant-toggle").forEach(r=>{r.addEventListener("click",function(n){n.preventDefault();const s=this.nextElementSibling,u=s.style.display==="none";s.style.display=u?"block":"none",this.textContent=u?"Klik untuk melihat varian ▲":"Klik untuk melihat varian ▼"})})}function L(){const e=document.getElementById("searchInput"),t=document.getElementById("searchIcon");e.value.trim()?t.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        `:t.innerHTML=`
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
        `}function R(){document.getElementById("searchInput").value="",L(),C()}async function P(e="add",t=null){I=t,document.getElementById("productModal"),document.getElementById("productForm").reset(),document.getElementById("variantsTableBody").innerHTML="",document.getElementById("productModalLabel").textContent=e==="add"?"Tambah Produk":"Edit Produk",document.getElementById("saveProductBtn").textContent=e==="add"?"Simpan":"Update",e==="edit"&&t?await W(t):E(),T.show()}async function W(e){try{const{data:t,error:a}=await d.from("produk").select(`
                id, 
                nama, 
                id_subkategori, 
                id_supplier,
                qty_minimum
            `).eq("id",e).single();if(a)throw a;const{data:r,error:n}=await d.from("produk_varian").select("*").eq("id_produk",e);if(n)throw n;document.getElementById("nama_produk").value=t.nama,document.getElementById("subkategori").value=t.id_subkategori,document.getElementById("supplier").value=t.id_supplier,document.getElementById("qty_minimum").value=t.qty_minimum;const s=document.getElementById("variantsTableBody");s.innerHTML="",r&&r.length>0?r.forEach(u=>{E({id_varian:u.id,varian:u.varian,harga_standar:u.harga_standar,jumlah_stok:u.jumlah_stok,stok_reservasi:u.stok_reservasi})}):E()}catch(t){console.error("Error loading product:",t),g("Gagal memuat data produk","error")}}async function E(e=null){const t=document.getElementById("variantsTableBody"),a=document.createElement("tr");e?a.innerHTML=`
            <td>
                <input type="text" class="form-control variant-name" value="${e.varian}" required>
            </td>
            <td><input type="number" class="form-control variant-price" value="${e.harga_standar||""}" step="0.01" required></td>
            <td><input type="number" class="form-control variant-stock" value="${e.jumlah_stok||""}" required></td>
            <td>
                <button type="button" class="btn btn-danger btn-sm remove-variant">×</button>
                ${e.id_varian?`<input type="hidden" class="variant-id" value="${e.id_varian}">`:""}
            </td>
        `:a.innerHTML=`
            <td>
               <input type="text" class="form-control variant-name" placeholder="Nama Varian" required>
            </td>
            <td><input type="number" class="form-control variant-price" placeholder="Harga" step="0.01" required></td>
            <td><input type="number" class="form-control variant-stock" placeholder="Stok" required></td>
            <td><button type="button" class="btn btn-danger btn-sm remove-variant">×</button></td>
        `,t.appendChild(a)}async function Y(){const e=j();try{I?await X(I,e):await K(e),T.hide(),await _()}catch(t){console.error("Error saving product:",t),g("Gagal menyimpan produk","error")}}function j(){const e=[];return document.querySelectorAll("#variantsTableBody tr").forEach(t=>{var a,r;e.push({id:((a=t.querySelector(".variant-id"))==null?void 0:a.value)||null,varian:t.querySelector(".variant-name").value,harga_standar:parseFloat(t.querySelector(".variant-price").value),jumlah_stok:parseInt(t.querySelector(".variant-stock").value),stok_reservasi:parseInt(((r=t.querySelector(".variant-reserved"))==null?void 0:r.value)||0)})}),{nama:document.getElementById("nama_produk").value,id_subkategori:document.getElementById("subkategori").value,id_supplier:document.getElementById("supplier").value,qty_minimum:parseFloat(document.getElementById("qty_minimum").value),variants:e}}async function K(e){try{const{data:t,error:a}=await d.from("produk").insert({nama:e.nama,id_subkategori:e.id_subkategori,id_supplier:e.id_supplier,qty_minimum:e.qty_minimum}).select().single();if(a)throw a;if(e.variants.length>0){const r=e.variants.map(s=>({id_produk:t.id,varian:s.varian,harga_standar:s.harga_standar,jumlah_stok:s.jumlah_stok,stok_reservasi:s.stok_reservasi||0})),{error:n}=await d.from("produk_varian").insert(r);if(n)throw n}return g("Produk berhasil ditambahkan"),!0}catch(t){throw console.error("Error creating product:",t),t}}async function X(e,t){try{const{error:a}=await d.from("produk").update({nama:t.nama,id_subkategori:t.id_subkategori,id_supplier:t.id_supplier,qty_minimum:t.qty_minimum}).eq("id",e);if(a)throw a;const r=t.variants,{data:n,error:s}=await d.from("produk_varian").select("id").eq("id_produk",e);if(s)throw s;const u=n.map(i=>i.varian),h=r.filter(i=>i.varian).map(i=>i.varian),p=u.filter(i=>!h.includes(i));if(p.length>0){const{error:i}=await d.from("produk_varian").delete().in("id_varian",p);if(i)throw i}for(const i of r)if(i.id_varian){const{error:b}=await d.from("produk_varian").update({varian:i.varian,harga_standar:i.harga_standar,jumlah_stok:i.jumlah_stok,stok_reservasi:i.stok_reservasi}).eq("id_varian",i.id_varian);if(b)throw b}else{const{error:b}=await d.from("produk_varian").insert({id_produk:e,varian:i.varian,harga_standar:i.harga_standar,jumlah_stok:i.jumlah_stok,stok_reservasi:i.stok_reservasi});if(b)throw b}g("Produk berhasil diperbarui")}catch(a){throw console.error("Error updating product:",a),a}}async function _(){const e=document.getElementById("productTableBody");try{e.innerHTML=`
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`,await C()}catch(t){console.error("Error fetching products:",t),g("Gagal memuat data produk","error")}}async function Q(){try{const{data:e,error:t}=await d.from("kategori").select("id, kategori").order("kategori",{ascending:!0});if(t)throw t;J=e;const a=document.getElementById("filterKategori");a.innerHTML='<option value="">Semua Kategori</option>',e.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.kategori,a.appendChild(n)})}catch(e){console.error("Error loading categories:",e)}}let J=[],O=[];async function U(){try{const{data:e,error:t}=await d.from("subkategori").select("id, subkategori, id_kategori").order("subkategori",{ascending:!0});if(t)throw t;O=e;const a=document.getElementById("subkategori");a.innerHTML='<option value="" disabled selected>Pilih subkategori</option>',e.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.subkategori,a.appendChild(n)})}catch(e){console.error("Error loading subcategories:",e),g("Gagal memuat daftar subkategori","error")}}async function z(){try{const e=document.getElementById("dropdownSupplier");if(!e){console.error("Supplier dropdown not found!");return}const{data:t,error:a}=await d.from("supplier").select("id, perusahaan, cp").order("perusahaan",{ascending:!0});if(a)throw a;e.innerHTML='<option value="">Pilih Supplier</option>',t.forEach(r=>{const n=new Option(`${r.perusahaan} (${r.cp})`,r.id);e.add(n)})}catch(e){console.error("Error loading suppliers:",e);const t=document.getElementById("dropdownSupplier");t&&(t.innerHTML='<option value="">Gagal memuat supplier</option>'),g("Gagal memuat daftar supplier","error")}}async function D(){try{const{data:e,error:t}=await d.from("supplier").select("id, perusahaan, cp").order("perusahaan",{ascending:!0});if(t)throw t;const a=document.getElementById("supplier");a.innerHTML='<option value="" disabled selected>Pilih supplier</option>',e.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.perusahaan+" (Contact Person: "+r.cp+")",a.appendChild(n)})}catch(e){console.error("Error loading suppliers:",e)}}async function ee(e){if(confirm("Apakah Anda yakin ingin menghapus produk ini?"))try{await d.from("produk_varian").delete().eq("id_produk",e),await d.from("produk").delete().eq("id",e),await _(),g("Produk berhasil dihapus")}catch(t){console.error("Error deleting product:",t),g("Gagal menghapus produk","error")}}function g(e,t="success"){const a=document.getElementById("toastContainer");if(!a){console.error("Toast container not found!");return}const r=document.createElement("div");r.className=`toast align-items-center text-white bg-${t==="success"?"success":"danger"} border-0`,r.setAttribute("role","alert"),r.setAttribute("aria-live","assertive"),r.setAttribute("aria-atomic","true"),r.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${e}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,a.appendChild(r),new bootstrap.Toast(r,{autohide:!0,delay:3e3}).show(),r.addEventListener("hidden.bs.toast",()=>{r.remove()})}function te(e){window.location.href=`history.html?variantId=${e}`}document.addEventListener("DOMContentLoaded",async()=>{T=new bootstrap.Modal(document.getElementById("productModal")),F(),document.getElementById("addProductBtn").addEventListener("click",()=>P("add")),document.getElementById("addVariantBtn").addEventListener("click",()=>E()),document.getElementById("saveProductBtn").addEventListener("click",Y);const e=document.getElementById("searchInput");document.getElementById("searchButton").addEventListener("click",()=>{e.value.trim()&&document.getElementById("searchIcon").innerHTML.includes("bi-x")?R():w()}),e.addEventListener("keyup",a=>{L(),a.key==="Enter"&&w()}),e.addEventListener("input",L),await Promise.all([Q(),U(),D(),_()]),document.getElementById("variantsTableBody").addEventListener("click",a=>{a.target.classList.contains("remove-variant")&&a.target.closest("tr").remove()})});window.editProduct=async function(e){await P("edit",e)};window.deleteProduct=ee;window.viewVariantHistory=te;
