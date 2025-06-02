import{s as d}from"./db_conn-Cc8gtU8M.js";import{n as $}from"./navbar-CPlLmwh8.js";import{c as V}from"./auth-B2Y95iNI.js";fetch("navbar.html").then(e=>e.text()).then(e=>{document.getElementById("navbar").innerHTML=e;const t=document.createElement("script");t.type="module",t.src=$,document.body.appendChild(t)}).catch(e=>console.error("Error loading navbar:",e));(async()=>await V())();let T,B=null,o={type:null,category:null,subcategory:null,supplier:null,variant:null};const G=new Map([[.25,"1/4 lusin"],[.5,"1/2 lusin"],[1,"1 lusin"]]);function A(){var e,t;document.querySelectorAll('input[name="filterGroup"]').forEach(a=>{a.addEventListener("click",function(r){if(this.checked&&o.type===this.value){this.checked=!1,I();return}o.type=this.value,j()})}),(e=document.getElementById("applyFilter"))==null||e.addEventListener("click",H),(t=document.getElementById("resetFilter"))==null||t.addEventListener("click",I)}async function j(){var t,a;const e=document.getElementById("filterOptionsContainer");switch(e.innerHTML="",document.getElementById("filterCard").classList.remove("d-none"),o.type){case"kategori":e.innerHTML=`
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
                </div>`,await R();break;case"supplier":e.innerHTML=`
                <div class="mb-3">
                    <label class="form-label">Supplier</label>
                    <select class="form-select" id="dropdownSupplier">
                        <option value="">Memuat supplier...</option>
                    </select>
                </div>
                <div class="card-footer bg-light">
                    <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
                    <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
                </div>`,await D();break;case"varian":e.innerHTML=`
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
                </div>`;break}(t=document.getElementById("applyFilter"))==null||t.addEventListener("click",H),(a=document.getElementById("resetFilter"))==null||a.addEventListener("click",I)}async function R(){try{const{data:e,error:t}=await d.from("kategori").select("id, kategori").order("kategori",{ascending:!0});if(t)throw t;const a=document.getElementById("filterCategory");a.innerHTML='<option value="">Pilih Kategori</option>',e.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.kategori,a.appendChild(n)}),a.addEventListener("change",function(){const r=document.getElementById("filterSubcategory");r.disabled=!this.value,this.value?K(this.value):r.innerHTML='<option value="">Pilih Subkategori</option>'})}catch(e){console.error("Error loading categories:",e),m("Gagal memuat daftar kategori","error")}}async function q(){const e=document.getElementById("productTableBody");try{e.innerHTML=`
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
              `).order("id",{ascending:!0});switch(o.type){case"kategori":o.category&&(o.subcategory?t=t.eq("id_subkategori",o.subcategory):t=t.eq("subkategori.kategori.id",o.category));break;case"supplier":o.supplier&&(t=t.eq("id_supplier",o.supplier));break}const{data:a,error:r}=await t;if(r)throw r;const{data:n,error:s}=await d.from("produk_varian").select("*");if(s)throw s;const u=n.reduce((h,p)=>(h[p.id_produk]||(h[p.id_produk]=[]),h[p.id_produk].push(p),h),{});let k=a;o.type==="varian"&&o.variant&&(k=a.filter(h=>{const p=u[h.id]||[],i=p.length>1||p.length===1&&p[0].varian.toLowerCase()!=="standar";return o.variant==="has"?i:o.variant==="none"?!i:!0})),P(k,u)}catch(t){console.error("Error filtering products:",t),m("Gagal memfilter produk","error"),e.innerHTML=`
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Gagal memuat data produk
                </td>
            </tr>`}}async function K(e){try{const{data:t,error:a}=await d.from("subkategori").select("id, subkategori").eq("id_kategori",e).order("subkategori",{ascending:!0});if(a)throw a;const r=document.getElementById("filterSubcategory");r.innerHTML='<option value="">Pilih Subkategori</option>',t.forEach(n=>{const s=document.createElement("option");s.value=n.id,s.textContent=n.subkategori,r.appendChild(s)})}catch(t){console.error("Error loading subcategories:",t),m("Gagal memuat daftar subkategori","error")}}function H(){switch(o.category=null,o.subcategory=null,o.supplier=null,o.variant=null,o.type){case"kategori":o.category=document.getElementById("filterCategory").value,o.subcategory=document.getElementById("filterSubcategory").value;break;case"supplier":o.supplier=document.getElementById("dropdownSupplier").value;break;case"varian":const e=document.querySelector('input[name="variantOption"]:checked');o.variant=(e==null?void 0:e.value)||null;break}q()}function I(){document.querySelectorAll('input[name="filterGroup"]').forEach(e=>{e.checked=!1}),o={type:null,category:null,subcategory:null,supplier:null,variant:null},document.getElementById("filterCard").classList.add("d-none"),E()}async function _(){const e=document.getElementById("searchInput").value.trim().toLowerCase();try{const t=document.getElementById("productTableBody");t.innerHTML=`
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
            `).not("id_supplier","is",null).order("id",{ascending:!0}),u=(n==null?void 0:n.filter(l=>{var c,b,v,f;return((b=(c=l.supplier)==null?void 0:c.perusahaan)==null?void 0:b.toLowerCase().includes(e))||((f=(v=l.supplier)==null?void 0:v.cp)==null?void 0:f.toLowerCase().includes(e))}))||[],{data:k,error:h}=await d.from("produk").select(`
                id, 
                nama, 
                qty_minimum, 
                id_supplier,
                id_subkategori,
                subkategori!inner(id, subkategori, kategori!inner(id, kategori)),
                supplier:supplier (perusahaan, cp)
            `).not("id_subkategori","is",null).order("id",{ascending:!0}),p=(k==null?void 0:k.filter(l=>{var c,b,v,f,C;return((b=(c=l.subkategori)==null?void 0:c.subkategori)==null?void 0:b.toLowerCase().includes(e))||((C=(f=(v=l.subkategori)==null?void 0:v.kategori)==null?void 0:f.kategori)==null?void 0:C.toLowerCase().includes(e))}))||[];let y=[...a||[],...u,...p].reduce((l,c)=>(l.some(b=>b.id===c.id)||l.push(c),l),[]);if(o.type)switch(o.type){case"kategori":o.category&&(y=y.filter(l=>{var c,b;return o.subcategory?l.id_subkategori===o.subcategory:((b=(c=l.subkategori)==null?void 0:c.kategori)==null?void 0:b.id)===o.category}));break;case"supplier":o.supplier&&(y=y.filter(l=>l.id_supplier===o.supplier));break;case"varian":break}const{data:F,error:M}=await d.from("produk_varian").select("*");if(M)throw M;const S=F.reduce((l,c)=>(l[c.id_produk]||(l[c.id_produk]=[]),l[c.id_produk].push(c),l),{});o.type==="varian"&&o.variant&&(y=y.filter(l=>{const c=S[l.id]||[],b=c.length>1||c.length===1&&c[0].varian.toLowerCase()!=="standar";return o.variant==="has"?b:!b})),P(y,S)}catch(t){console.error("Error searching products:",t),m("Gagal melakukan pencarian","error"),document.getElementById("productTableBody").innerHTML=`
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Gagal memuat data produk
                </td>
            </tr>`}}function P(e,t){const a=document.getElementById("productTableBody");if(a.innerHTML="",!e||e.length===0){a.innerHTML=`
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Tidak ada produk yang cocok dengan pencarian
                </td>
            </tr>`;return}e.forEach(r=>{var u,k,h,p,i;const n=t[r.id]||[],s=document.createElement("tr");s.innerHTML=`
            <td>${r.id}</td>
            <td>${r.nama}</td>
            <td>${((k=(u=r.subkategori)==null?void 0:u.kategori)==null?void 0:k.kategori)||"-"} (${((h=r.subkategori)==null?void 0:h.subkategori)||"-"})</td>
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
                                   ${n.map(g=>`
                                       <tr>
                                           <td>${g.varian}</td>
                                           <td>Rp ${g.harga_standar.toLocaleString("id-ID")}</td>
                                           <td>${g.jumlah_stok}</td>
                                           <td>${g.stok_reservasi}</td>
                                           <td>
                                               <button class="btn btn-info btn-sm me-1" onclick="viewVariantHistory(${g.id})">Detail</button>
                                               <button class="btn btn-danger btn-sm" onclick="deleteVariant(${g.id})">Hapus</button>
                                           </td>
                                       </tr>
                                   `).join("")}
                               </tbody>
                           </table>
                       </div>`:"Tidak ada varian"}
            </td>
            <td>${((p=r.supplier)==null?void 0:p.perusahaan)||"-"} (${((i=r.supplier)==null?void 0:i.cp)||"-"})</td>
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
        `}function O(){document.getElementById("searchInput").value="",L(),q()}async function x(e="add",t=null){B=t,document.getElementById("productModal"),document.getElementById("productForm").reset(),document.getElementById("variantsTableBody").innerHTML="",document.getElementById("productModalLabel").textContent=e==="add"?"Tambah Produk":"Edit Produk",document.getElementById("saveProductBtn").textContent=e==="add"?"Simpan":"Update",e==="edit"&&t?await N(t):w(),T.show()}async function N(e){try{const{data:t,error:a}=await d.from("produk").select(`
                id, 
                nama, 
                id_subkategori, 
                id_supplier,
                qty_minimum
            `).eq("id",e).single();if(a)throw a;const{data:r,error:n}=await d.from("produk_varian").select("*").eq("id_produk",e);if(n)throw n;document.getElementById("nama_produk").value=t.nama,document.getElementById("subkategori").value=t.id_subkategori,document.getElementById("supplier").value=t.id_supplier,document.getElementById("qty_minimum").value=t.qty_minimum;const s=document.getElementById("variantsTableBody");s.innerHTML="",r&&r.length>0?r.forEach(u=>{w({id_varian:u.id,varian:u.varian,harga_standar:u.harga_standar,jumlah_stok:u.jumlah_stok,stok_reservasi:u.stok_reservasi})}):w()}catch(t){console.error("Error loading product:",t),m("Gagal memuat data produk","error")}}async function w(e=null){const t=document.getElementById("variantsTableBody"),a=document.createElement("tr");e?a.innerHTML=`
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
        `,t.appendChild(a)}async function z(){const e=U();try{B?await Q(B,e):await J(e),T.hide(),await E()}catch(t){console.error("Error saving product:",t),m("Gagal menyimpan produk","error")}}function U(){const e=[];return document.querySelectorAll("#variantsTableBody tr").forEach(t=>{var a,r;e.push({id:((a=t.querySelector(".variant-id"))==null?void 0:a.value)||null,varian:t.querySelector(".variant-name").value,harga_standar:parseFloat(t.querySelector(".variant-price").value),jumlah_stok:parseInt(t.querySelector(".variant-stock").value),stok_reservasi:parseInt(((r=t.querySelector(".variant-reserved"))==null?void 0:r.value)||0)})}),{nama:document.getElementById("nama_produk").value,id_subkategori:document.getElementById("subkategori").value,id_supplier:document.getElementById("supplier").value,qty_minimum:parseFloat(document.getElementById("qty_minimum").value),variants:e}}async function J(e){try{const{data:t,error:a}=await d.from("produk").insert({nama:e.nama,id_subkategori:e.id_subkategori,id_supplier:e.id_supplier,qty_minimum:e.qty_minimum}).select().single();if(a)throw a;if(e.variants.length>0){const r=e.variants.map(s=>({id_produk:t.id,varian:s.varian,harga_standar:s.harga_standar,jumlah_stok:s.jumlah_stok,stok_reservasi:s.stok_reservasi||0})),{error:n}=await d.from("produk_varian").insert(r);if(n)throw n}return m("Produk berhasil ditambahkan"),!0}catch(t){throw console.error("Error creating product:",t),t}}async function Q(e,t){try{const{error:a}=await d.from("produk").update({nama:t.nama,id_subkategori:parseInt(t.id_subkategori),id_supplier:parseInt(t.id_supplier),qty_minimum:parseFloat(t.qty_minimum)}).eq("id",e);if(a)throw a;const{data:r,error:n}=await d.from("produk_varian").select("id, varian").eq("id_produk",e);if(n)throw n;const s=t.variants.filter(i=>i.id!==null),u=t.variants.filter(i=>i.id===null),k=r.map(i=>i.id),h=s.map(i=>parseInt(i.id)),p=k.filter(i=>!h.includes(i));if(p.length>0){const{error:i}=await d.from("produk_varian").delete().in("id",p);if(i)throw i}for(const i of s){const{error:g}=await d.from("produk_varian").update({varian:i.varian,harga_standar:parseFloat(i.harga_standar),jumlah_stok:parseInt(i.jumlah_stok),stok_reservasi:parseInt(i.stok_reservasi||0)}).eq("id",i.id);if(g)throw g}if(u.length>0){const i=u.map(y=>({id_produk:e,varian:y.varian,harga_standar:parseFloat(y.harga_standar),jumlah_stok:parseInt(y.jumlah_stok),stok_reservasi:parseInt(y.stok_reservasi||0)})),{error:g}=await d.from("produk_varian").insert(i);if(g)throw g}m("Produk berhasil diperbarui")}catch(a){throw console.error("Error updating product:",a),m(`Gagal memperbarui produk: ${a.message}`,"error"),a}}async function E(){const e=document.getElementById("productTableBody");try{e.innerHTML=`
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`,await q()}catch(t){console.error("Error fetching products:",t),m("Gagal memuat data produk","error")}}async function W(){try{const{data:e,error:t}=await d.from("kategori").select("id, kategori").order("kategori",{ascending:!0});if(t)throw t;X=e;const a=document.getElementById("filterKategori");a.innerHTML='<option value="">Semua Kategori</option>',e.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.kategori,a.appendChild(n)})}catch(e){console.error("Error loading categories:",e)}}let X=[],Y=[];async function Z(){try{const{data:e,error:t}=await d.from("subkategori").select("id, subkategori, id_kategori").order("subkategori",{ascending:!0});if(t)throw t;Y=e;const a=document.getElementById("subkategori");a.innerHTML='<option value="" disabled selected>Pilih subkategori</option>',e.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.subkategori,a.appendChild(n)})}catch(e){console.error("Error loading subcategories:",e),m("Gagal memuat daftar subkategori","error")}}async function D(){try{const e=document.getElementById("dropdownSupplier");if(!e){console.error("Supplier dropdown not found!");return}const{data:t,error:a}=await d.from("supplier").select("id, perusahaan, cp").order("perusahaan",{ascending:!0});if(a)throw a;e.innerHTML='<option value="">Pilih Supplier</option>',t.forEach(r=>{const n=new Option(`${r.perusahaan} (${r.cp})`,r.id);e.add(n)})}catch(e){console.error("Error loading suppliers:",e);const t=document.getElementById("dropdownSupplier");t&&(t.innerHTML='<option value="">Gagal memuat supplier</option>'),m("Gagal memuat daftar supplier","error")}}async function ee(){try{const{data:e,error:t}=await d.from("supplier").select("id, perusahaan, cp").order("perusahaan",{ascending:!0});if(t)throw t;const a=document.getElementById("supplier");a.innerHTML='<option value="" disabled selected>Pilih supplier</option>',e.forEach(r=>{const n=document.createElement("option");n.value=r.id,n.textContent=r.perusahaan+" (Contact Person: "+r.cp+")",a.appendChild(n)})}catch(e){console.error("Error loading suppliers:",e)}}async function te(e){if(confirm("Apakah Anda yakin ingin menghapus varian ini?"))try{const{error:t}=await d.from("produk_varian").delete().eq("id",e);if(t)throw t;await E(),m("Varian berhasil dihapus")}catch(t){console.error("Error deleting variant:",t),m("Gagal menghapus varian","error")}}async function re(e){if(confirm("Apakah Anda yakin ingin menghapus produk ini?"))try{const{error:t}=await d.from("produk").delete().eq("id",e);if(t)throw t;await E(),m("Produk berhasil dihapus")}catch(t){console.error("Error deleting product:",t),m("Gagal menghapus produk","error")}}function m(e,t="success"){const a=document.getElementById("toastContainer");if(!a){console.error("Toast container not found!");return}const r=document.createElement("div");r.className=`toast align-items-center text-white bg-${t==="success"?"success":"danger"} border-0`,r.setAttribute("role","alert"),r.setAttribute("aria-live","assertive"),r.setAttribute("aria-atomic","true"),r.innerHTML=`
        <div class="d-flex">
            <div class="toast-body">${e}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `,a.appendChild(r),new bootstrap.Toast(r,{autohide:!0,delay:3e3}).show(),r.addEventListener("hidden.bs.toast",()=>{r.remove()})}function ae(e){window.location.href=`history.html?variantId=${e}`}document.addEventListener("DOMContentLoaded",async()=>{T=new bootstrap.Modal(document.getElementById("productModal")),A(),document.getElementById("addProductBtn").addEventListener("click",()=>x("add")),document.getElementById("addVariantBtn").addEventListener("click",()=>w()),document.getElementById("saveProductBtn").addEventListener("click",z);const e=document.getElementById("searchInput");document.getElementById("searchButton").addEventListener("click",()=>{e.value.trim()&&document.getElementById("searchIcon").innerHTML.includes("bi-x")?O():_()}),e.addEventListener("keyup",a=>{L(),a.key==="Enter"&&_()}),e.addEventListener("input",L),await Promise.all([W(),Z(),ee(),E()]),document.getElementById("variantsTableBody").addEventListener("click",a=>{a.target.classList.contains("remove-variant")&&a.target.closest("tr").remove()})});window.editProduct=async function(e){await x("edit",e)};window.deleteProduct=re;window.viewVariantHistory=ae;window.deleteVariant=te;
