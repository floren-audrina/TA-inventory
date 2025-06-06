import supabase from './db_conn.js';
import { checkAuth } from './auth.js';
import { displayUnpaidNotice } from './import.js';

(async () => {
    // Auth check - will redirect if not logged in
    await checkAuth(); 
})();

let productModal;
let currentProductId = null;
// let categories = [];
// let subcategories = [];
// let suppliers = [];
let activeFilters = {
    type: null,
    category: null,
    subcategory: null,
    supplier: null,
    variant: null
};


// Define the unit mapping as a Map
const unitMapping = new Map([
    [0.25, "1/4 lusin"],
    [0.5, "1/2 lusin"],
    [1, "1 lusin"]
]);

// Initialize filter functionality
function initializeFilters() {
    // Handle filter type selection (with uncheck capability)
    document.querySelectorAll('input[name="filterGroup"]').forEach(radio => {
        radio.addEventListener('click', function(e) {
            if (this.checked && activeFilters.type === this.value) {
                // Clicking the already selected radio should uncheck it
                this.checked = false;
                resetFilters();
                return;
            }
            activeFilters.type = this.value;
            updateFilterUI();
        });
    });

    // Apply filter button
    document.getElementById('applyFilter')?.addEventListener('click', applyFilters);

    // Reset filter button
    document.getElementById('resetFilter')?.addEventListener('click', resetFilters);
}

// Update filter UI based on selected type
async function updateFilterUI() {
    const container = document.getElementById('filterOptionsContainer');
    container.innerHTML = '';
    
    // Show filter card
    document.getElementById('filterCard').classList.remove('d-none');
    
    switch(activeFilters.type) {
        case 'kategori':
            container.innerHTML = `
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
                </div>`;
            await loadCategoriesForFilter();
            break;
            
        case 'supplier':
            container.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Supplier</label>
                    <select class="form-select" id="dropdownSupplier">
                        <option value="">Memuat supplier...</option>
                    </select>
                </div>
                <div class="card-footer bg-light">
                    <button class="btn btn-sm btn-primary me-2" id="applyFilter">Terapkan</button>
                    <button class="btn btn-sm btn-outline-secondary" id="resetFilter">Reset</button>
                </div>`;
            await loadSuppliersForFilter();
            break;
            
        case 'varian':
            container.innerHTML = `
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
                </div>`;
            break;
    }

    // Reattach event listeners for new buttons
    document.getElementById('applyFilter')?.addEventListener('click', applyFilters);
    document.getElementById('resetFilter')?.addEventListener('click', resetFilters);
}

// Load categories for filter
async function loadCategoriesForFilter() {
    try {
        const { data, error } = await supabase
            .from('kategori')
            .select('id, kategori')
            .order('kategori', { ascending: true });

        if (error) throw error;
        
        const select = document.getElementById('filterCategory');
        select.innerHTML = '<option value="">Pilih Kategori</option>';
        
        data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.kategori;
            select.appendChild(option);
        });

        // Enable subcategory when category is selected
        select.addEventListener('change', function() {
            const subSelect = document.getElementById('filterSubcategory');
            subSelect.disabled = !this.value;
            if (this.value) {
                updateSubcategoriesForFilter(this.value);
            } else {
                subSelect.innerHTML = '<option value="">Pilih Subkategori</option>';
            }
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        showToast('Gagal memuat daftar kategori', 'error');
    }
}

async function filterProducts() {
    const tbody = document.getElementById('productTableBody');
    
    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`;

            let query = supabase
            .from('produk')
            .select(`
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
              `)
            .order('id', { ascending: true });

        // Apply filters based on active filter type
        switch(activeFilters.type) {
            case 'kategori':
                if (activeFilters.category) {
                    if (activeFilters.subcategory) {
                        // Filter by specific subcategory
                        query = query.eq('id_subkategori', activeFilters.subcategory);
                    } else {
                        // Filter by category only (all subcategories under this category)
                        query = query.eq('subkategori.kategori.id', activeFilters.category);
                    }
                }
                break;
                
            case 'supplier':
                if (activeFilters.supplier) {
                    query = query.eq('id_supplier', activeFilters.supplier);
                }
                break;
        }

        const { data: products, error: productsError } = await query;
        if (productsError) throw productsError;

        // Fetch all variants
        const { data: variants, error: variantsError } = await supabase
            .from('produk_varian')
            .select('*');
        if (variantsError) throw variantsError;

        // Group variants by product ID
        const variantsByProduct = variants.reduce((acc, variant) => {
            if (!acc[variant.id_produk]) {
                acc[variant.id_produk] = [];
            }
            acc[variant.id_produk].push(variant);
            return acc;
        }, {});

        // Apply variant filter if active
        let filteredProducts = products;
        if (activeFilters.type === 'varian' && activeFilters.variant) {
            filteredProducts = products.filter(product => {
                const productVariants = variantsByProduct[product.id] || [];
                const hasRealVariants = productVariants.length > 1 || 
                                      (productVariants.length === 1 && 
                                       productVariants[0].varian.toLowerCase() !== "standar");

                if (activeFilters.variant === 'has') {
                    return hasRealVariants;
                } else if (activeFilters.variant === 'none') {
                    return !hasRealVariants;
                }
                return true;
            });
        }

        // Update the table
        updateTable(filteredProducts, variantsByProduct);

    } catch (error) {
        console.error('Error filtering products:', error);
        showToast('Gagal memfilter produk', 'error');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Gagal memuat data produk
                </td>
            </tr>`;
    }
}

async function updateSubcategoriesForFilter(categoryId) {
    try {
        const { data, error } = await supabase
            .from('subkategori')
            .select('id, subkategori')
            .eq('id_kategori', categoryId)
            .order('subkategori', { ascending: true });

        if (error) throw error;
        
        const select = document.getElementById('filterSubcategory');
        select.innerHTML = '<option value="">Pilih Subkategori</option>';
        
        data.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.subkategori;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading subcategories:', error);
        showToast('Gagal memuat daftar subkategori', 'error');
    }
}

// Apply selected filters
function applyFilters() {
    // Reset previous filter values
    activeFilters.category = null;
    activeFilters.subcategory = null;
    activeFilters.supplier = null;
    activeFilters.variant = null;

    // Get current filter values
    switch(activeFilters.type) {
        case 'kategori':
            activeFilters.category = document.getElementById('filterCategory').value;
            activeFilters.subcategory = document.getElementById('filterSubcategory').value;
            break;
            
        case 'supplier':
            activeFilters.supplier = document.getElementById('dropdownSupplier').value;
            break;
            
        case 'varian':
            const selectedVariant = document.querySelector('input[name="variantOption"]:checked');
            activeFilters.variant = selectedVariant?.value || null;
            break;
    }

    // Apply filters to the table
    filterProducts();
}

// Reset all filters
function resetFilters() {
    // Uncheck all radio buttons
    document.querySelectorAll('input[name="filterGroup"]').forEach(radio => {
        radio.checked = false;
    });

    // Reset active filters
    activeFilters = {
        type: null,
        category: null,
        subcategory: null,
        supplier: null,
        variant: null
    };

    // Hide filter card
    document.getElementById('filterCard').classList.add('d-none');

    // Refresh the product list
    fetchProducts();
}

async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    try {
        const tbody = document.getElementById('productTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`;

        // 1. Search products by name
        const { data: productsByName, error: nameError } = await supabase
            .from('produk')
            .select(`
                id, 
                nama, 
                qty_minimum, 
                id_supplier,
                id_subkategori,
                subkategori!inner(id, subkategori, kategori!inner(id, kategori)),
                supplier:supplier (perusahaan, cp)
            `)
            .ilike('nama', `%${searchTerm}%`)
            .order('id', { ascending: true });

        // 2. Search products by supplier name or CP
        const { data: productsBySupplier, error: supplierError } = await supabase
            .from('produk')
            .select(`
                id, 
                nama, 
                qty_minimum, 
                id_supplier,
                id_subkategori,
                subkategori!inner(id, subkategori, kategori!inner(id, kategori)),
                supplier:supplier (perusahaan, cp)
            `)
            .not('id_supplier', 'is', null)
            .order('id', { ascending: true });

        // Filter supplier-related matches in JavaScript (since Supabase can't do nested OR)
        const filteredBySupplier = productsBySupplier?.filter(product => 
            product.supplier?.perusahaan?.toLowerCase().includes(searchTerm) ||
            product.supplier?.cp?.toLowerCase().includes(searchTerm)
        ) || [];

        // 3. Search products by category/subcategory
        const { data: productsByCategory, error: categoryError } = await supabase
            .from('produk')
            .select(`
                id, 
                nama, 
                qty_minimum, 
                id_supplier,
                id_subkategori,
                subkategori!inner(id, subkategori, kategori!inner(id, kategori)),
                supplier:supplier (perusahaan, cp)
            `)
            .not('id_subkategori', 'is', null)
            .order('id', { ascending: true });

        // Filter category matches
        const filteredByCategory = productsByCategory?.filter(product => 
            product.subkategori?.subkategori?.toLowerCase().includes(searchTerm) ||
            product.subkategori?.kategori?.kategori?.toLowerCase().includes(searchTerm)
        ) || [];

        // Combine all results and remove duplicates
        const combinedResults = [
            ...(productsByName || []),
            ...filteredBySupplier,
            ...filteredByCategory
        ];

        const uniqueProducts = combinedResults.reduce((acc, product) => {
            if (!acc.some(p => p.id === product.id)) {
                acc.push(product);
            }
            return acc;
        }, []);

        // Apply active filters if they exist (your existing filter logic)
        let filteredProducts = uniqueProducts;
        if (activeFilters.type) {
            switch(activeFilters.type) {
                case 'kategori':
                    if (activeFilters.category) {
                        filteredProducts = filteredProducts.filter(product => 
                            activeFilters.subcategory 
                                ? product.id_subkategori === activeFilters.subcategory
                                : product.subkategori?.kategori?.id === activeFilters.category
                        );
                    }
                    break;
                case 'supplier':
                    if (activeFilters.supplier) {
                        filteredProducts = filteredProducts.filter(
                            product => product.id_supplier === activeFilters.supplier
                        );
                    }
                    break;
                case 'varian':
                    // (Your existing variant handling)
                    break;
            }
        }

        // Fetch variants and update table (your existing code)
        const { data: variants, error: variantsError } = await supabase
            .from('produk_varian')
            .select('*');
        
        if (variantsError) throw variantsError;

        const variantsByProduct = variants.reduce((acc, variant) => {
            if (!acc[variant.id_produk]) acc[variant.id_produk] = [];
            acc[variant.id_produk].push(variant);
            return acc;
        }, {});

        // Apply variant filter if active
        if (activeFilters.type === 'varian' && activeFilters.variant) {
            filteredProducts = filteredProducts.filter(product => {
                const productVariants = variantsByProduct[product.id] || [];
                const hasRealVariants = productVariants.length > 1 || 
                    (productVariants.length === 1 && 
                     productVariants[0].varian.toLowerCase() !== "standar");
                return activeFilters.variant === 'has' ? hasRealVariants : !hasRealVariants;
            });
        }

        updateTable(filteredProducts, variantsByProduct);

    } catch (error) {
        console.error('Error searching products:', error);
        showToast('Gagal melakukan pencarian', 'error');
        document.getElementById('productTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Gagal memuat data produk
                </td>
            </tr>`;
    }
}

function updateTable(products, variantsByProduct) {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';

    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    Tidak ada produk yang cocok dengan pencarian
                </td>
            </tr>`;
        return;
    }

    products.forEach(product => {
        const productVariants = variantsByProduct[product.id] || [];
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.nama}</td>
            <td>${product.subkategori?.kategori?.kategori || '-'} (${product.subkategori?.subkategori || '-'})</td>
            <td>
                ${productVariants.length > 0 
                    ? `<a href="#" class="variant-toggle">Klik untuk melihat varian ▼</a>
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
                                   ${productVariants.map(variant => `
                                       <tr>
                                           <td>${variant.varian}</td>
                                           <td>Rp ${variant.harga_standar.toLocaleString('id-ID')}</td>
                                           <td>${variant.jumlah_stok}</td>
                                           <td>${variant.stok_reservasi}</td>
                                           <td>
                                               <button class="btn btn-info btn-sm me-1" onclick="viewVariantHistory(${variant.id})">Detail</button>
                                               <button class="btn btn-danger btn-sm" onclick="deleteVariant(${variant.id})">Hapus</button>
                                           </td>
                                       </tr>
                                   `).join('')}
                               </tbody>
                           </table>
                       </div>`
                    : 'Tidak ada varian'}
            </td>
            <td>${product.supplier?.perusahaan || '-'} (${product.supplier?.cp || '-'})</td>
            <td>${unitMapping.get(product.qty_minimum) || product.qty_minimum}</td>
            <td>
                <button class="btn btn-primary btn-sm me-1" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Re-add event listeners for variant toggles
    document.querySelectorAll('.variant-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const container = this.nextElementSibling;
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'block' : 'none';
            this.textContent = isHidden 
                ? 'Klik untuk melihat varian ▲' 
                : 'Klik untuk melihat varian ▼';
        });
    });
}

// Add these new functions outside DOMContentLoaded
function updateSearchIcon() {
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');
    
    if (searchInput.value.trim()) {
        // Show X icon when there's text
        searchIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        `;
    } else {
        // Show search icon when empty
        searchIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
        `;
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    updateSearchIcon();
    filterProducts(); // Use filterProducts instead of fetchProducts to maintain filters
}

// async function loadVariantEnum() {
//     try {
//         const { data, error } = await supabase.rpc('get_enum_values', { 
//             enum_name: 'varian' 
//         });

//         if (error) throw error;
//         return data.map(item => item.value);
//     } catch (error) {
//         console.error('Error loading variant enum:', error);
//         return []; // Return empty array if there's an error
//     }
// }

async function openProductModal(mode = 'add', productId = null) {
    currentProductId = productId;
    const modal = document.getElementById('productModal');
    
    // Reset form
    document.getElementById('productForm').reset();
    document.getElementById('variantsTableBody').innerHTML = '';
    
    // Set modal title and button text
    document.getElementById('productModalLabel').textContent = 
        mode === 'add' ? 'Tambah Produk' : 'Edit Produk';
    document.getElementById('saveProductBtn').textContent = 
        mode === 'add' ? 'Simpan' : 'Update';
    
    if (mode === 'edit' && productId) {
        await populateProductForm(productId);
    } else {
        // Add one empty variant row by default
        addVariantRow();
    }
    
    productModal.show();
}

async function populateProductForm(productId) {
    try {
        // Fetch product data
        const { data: product, error: productError } = await supabase
            .from('produk')
            .select(`
                id, 
                nama, 
                id_subkategori, 
                id_supplier,
                qty_minimum
            `)
            .eq('id', productId)
            .single();

        if (productError) throw productError;

        // Fetch variants separately
        const { data: variants, error: variantsError } = await supabase
            .from('produk_varian')
            .select('*')
            .eq('id_produk', productId);

        if (variantsError) throw variantsError;

        // Populate basic fields
        document.getElementById('nama_produk').value = product.nama;
        document.getElementById('subkategori').value = product.id_subkategori;
        document.getElementById('supplier').value = product.id_supplier;
        document.getElementById('qty_minimum').value = product.qty_minimum;

        // Populate variants
        const variantsBody = document.getElementById('variantsTableBody');
        variantsBody.innerHTML = '';
        
        if (variants && variants.length > 0) {
            variants.forEach(variant => {
                addVariantRow({
                    id_varian: variant.id,
                    varian: variant.varian,
                    harga_standar: variant.harga_standar,
                    jumlah_stok: variant.jumlah_stok,
                    stok_reservasi: variant.stok_reservasi
                });
            });
        } else {
            addVariantRow(); // Add empty row if no variants
        }

    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Gagal memuat data produk', 'error');
    }
}

async function addVariantRow(variantData = null) {
    const variantsBody = document.getElementById('variantsTableBody');
    const row = document.createElement('tr');
    
    // // Load enum values
    // const enumValues = await loadVariantEnum();
    
    // // Create dropdown options HTML
    // const dropdownOptions = enumValues.map(value => 
    //     `<option value="${value}" ${variantData?.varian === value ? 'selected' : ''}>
    //         ${value.charAt(0).toUpperCase() + value.slice(1)}
    //     </option>`
    // ).join('');
    
    if (variantData) {
        // Edit mode with existing variant data
        row.innerHTML = `
            <td>
                <input type="text" class="form-control variant-name" value="${variantData.varian}" required>
            </td>
            <td><input type="number" class="form-control variant-price" value="${variantData.harga_standar || ''}" step="0.01" required></td>
            <td><input type="number" class="form-control variant-stock" value="${variantData.jumlah_stok || ''}" required></td>
            <td>
                <button type="button" class="btn btn-danger btn-sm remove-variant">×</button>
                ${variantData.id_varian ? `<input type="hidden" class="variant-id" value="${variantData.id_varian}">` : ''}
            </td>
        `;
    } else {
        // Add mode - empty row
        row.innerHTML = `
            <td>
               <input type="text" class="form-control variant-name" placeholder="Nama Varian" required>
            </td>
            <td><input type="number" class="form-control variant-price" placeholder="Harga" step="0.01" required></td>
            <td><input type="number" class="form-control variant-stock" placeholder="Stok" required></td>
            <td><button type="button" class="btn btn-danger btn-sm remove-variant">×</button></td>
        `;
    }
    
    variantsBody.appendChild(row);
}

async function saveProduct() {
    const formData = collectProductFormData();
    
    try {
        if (currentProductId) {
            await updateProduct(currentProductId, formData);
        } else {
            await createProduct(formData);
        }
        
        productModal.hide();
        await fetchProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Gagal menyimpan produk', 'error');
    }
}

function collectProductFormData() {
    const variants = [];
    document.querySelectorAll('#variantsTableBody tr').forEach(row => {
        variants.push({
            id: row.querySelector('.variant-id')?.value || null,
            varian: row.querySelector('.variant-name').value,
            harga_standar: parseFloat(row.querySelector('.variant-price').value),
            jumlah_stok: parseInt(row.querySelector('.variant-stock').value),
            stok_reservasi: parseInt(row.querySelector('.variant-reserved')?.value || 0)
        });
    });

    return {
        nama: document.getElementById('nama_produk').value,
        id_subkategori: document.getElementById('subkategori').value,
        id_supplier: document.getElementById('supplier').value,
        qty_minimum: parseFloat(document.getElementById('qty_minimum').value),
        variants
    };
}

async function createProduct(productData) {
    try {
        // First create the product
        const { data: product, error: productError } = await supabase
            .from('produk')
            .insert({
                nama: productData.nama,
                id_subkategori: productData.id_subkategori,
                id_supplier: productData.id_supplier,
                qty_minimum: productData.qty_minimum
            })
            .select()
            .single();

        if (productError) throw productError;

        // Then create variants if any
        if (productData.variants.length > 0) {
            const variantsToInsert = productData.variants.map(variant => ({
                id_produk: product.id,  // Make sure this is the correct product ID
                varian: variant.varian,
                harga_standar: variant.harga_standar,  // Note: Fixed typo from earlier (standar vs standar)
                jumlah_stok: variant.jumlah_stok,
                stok_reservasi: variant.stok_reservasi || 0  // Default to 0 if not provided
            }));

            const { error: variantError } = await supabase
                .from('produk_varian')
                .insert(variantsToInsert);

            if (variantError) throw variantError;
        }

        showToast('Produk berhasil ditambahkan');
        return true;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

async function updateProduct(productId, productData) {
    try {
        // 1. First update the product basic info
        const { error: productError } = await supabase
            .from('produk')
            .update({
                nama: productData.nama,
                id_subkategori: parseInt(productData.id_subkategori),
                id_supplier: parseInt(productData.id_supplier),
                qty_minimum: parseFloat(productData.qty_minimum)
            })
            .eq('id', productId);

        if (productError) throw productError;

        // 2. Handle variants
        // Get current variants from database
        const { data: dbVariants, error: variantsError } = await supabase
            .from('produk_varian')
            .select('id, varian')
            .eq('id_produk', productId);

        if (variantsError) throw variantsError;

        // Separate variants from form into updates and creates
        const variantsToUpdate = productData.variants.filter(v => v.id !== null);
        const variantsToCreate = productData.variants.filter(v => v.id === null);
        
        // Determine variants to delete (exist in DB but not in form)
        const dbVariantIds = dbVariants.map(v => v.id);
        const formVariantIds = variantsToUpdate.map(v => parseInt(v.id));
        const variantsToDelete = dbVariantIds.filter(id => !formVariantIds.includes(id));

        // Process deletions first
        if (variantsToDelete.length > 0) {
            const { error: deleteError } = await supabase
                .from('produk_varian')
                .delete()
                .in('id', variantsToDelete);
            
            if (deleteError) throw deleteError;
        }

        // Process updates
        for (const variant of variantsToUpdate) {
            const { error: updateError } = await supabase
                .from('produk_varian')
                .update({
                    varian: variant.varian,
                    harga_standar: parseFloat(variant.harga_standar),
                    jumlah_stok: parseInt(variant.jumlah_stok),
                    stok_reservasi: parseInt(variant.stok_reservasi || 0)
                })
                .eq('id', variant.id);
            
            if (updateError) throw updateError;
        }

        // Process creations
        if (variantsToCreate.length > 0) {
            const newVariants = variantsToCreate.map(variant => ({
                id_produk: productId,
                varian: variant.varian,
                harga_standar: parseFloat(variant.harga_standar),
                jumlah_stok: parseInt(variant.jumlah_stok),
                stok_reservasi: parseInt(variant.stok_reservasi || 0)
            }));

            const { error: createError } = await supabase
                .from('produk_varian')
                .insert(newVariants);
            
            if (createError) throw createError;
        }

        showToast('Produk berhasil diperbarui');
    } catch (error) {
        console.error('Error updating product:', error);
        showToast(`Gagal memperbarui produk: ${error.message}`, 'error');
        throw error;
    }
}

async function fetchProducts() {
    const tbody = document.getElementById('productTableBody');

    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`;
        
        // Use filterProducts which will handle all the filtering logic
        await filterProducts();

    } catch (error) {
        console.error('Error fetching products:', error);
        showToast('Gagal memuat data produk', 'error');
    }
}

// Update the loadCategories function
async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('kategori')
            .select('id, kategori')
            .order('kategori', { ascending: true });

        if (error) throw error;
        
        categories = data;
        const select = document.getElementById('filterKategori');
        select.innerHTML = '<option value="">Semua Kategori</option>';
        
        data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.kategori;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Update the loadSubCategories function to properly populate both dropdowns
// At the top of your file with other declarations
let categories = [];
let subcategories = [];
let suppliers = [];

// Update the loadSubCategories function
async function loadSubCategories() {
    try {
        const { data, error } = await supabase
            .from('subkategori')
            .select('id, subkategori, id_kategori')
            .order('subkategori', { ascending: true });

        if (error) throw error;

        subcategories = data; // Store in the global variable
        
        // For product form
        const formSelect = document.getElementById('subkategori');
        formSelect.innerHTML = '<option value="" disabled selected>Pilih subkategori</option>';
        
        data.forEach(sub => {
            const option = document.createElement('option');
            option.value = sub.id;
            option.textContent = sub.subkategori;
            formSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading subcategories:', error);
        showToast('Gagal memuat daftar subkategori', 'error');
    }
}

async function loadSuppliersForFilter() {
    try {
        const select = document.getElementById('dropdownSupplier'); // Updated ID
        if (!select) {
            console.error('Supplier dropdown not found!');
            return;
        }

        const { data, error } = await supabase
            .from('supplier')
            .select('id, perusahaan, cp')
            .order('perusahaan', { ascending: true });

        if (error) throw error;

        // Clear and populate options
        select.innerHTML = '<option value="">Pilih Supplier</option>';
        
        data.forEach(supplier => {
            const option = new Option(
                `${supplier.perusahaan} (${supplier.cp})`, 
                supplier.id
            );
            select.add(option);
        });

    } catch (error) {
        console.error('Error loading suppliers:', error);
        const select = document.getElementById('dropdownSupplier');
        if (select) {
            select.innerHTML = '<option value="">Gagal memuat supplier</option>';
        }
        showToast('Gagal memuat daftar supplier', 'error');
    }
}

async function loadSuppliers() {
    try {
        const { data, error } = await supabase
            .from('supplier')
            .select('id, perusahaan, cp')
            .order('perusahaan', { ascending: true });

        if (error) throw error;

        // suppliers = data;
        
        // For product form
        const select = document.getElementById('supplier');
        select.innerHTML = '<option value="" disabled selected>Pilih supplier</option>';
        
        data.forEach(supplier => {
            // For product form
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = supplier.perusahaan + " (Contact Person: " + supplier.cp + ")";
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

async function deleteVariant(variantId) {
    if (!confirm('Apakah Anda yakin ingin menghapus varian ini?')) return;
    
    try {
        // Delete the variant
        const { error } = await supabase
            .from('produk_varian')
            .delete()
            .eq('id', variantId);

        if (error) throw error;

        await fetchProducts(); // Refresh the product list
        showToast('Varian berhasil dihapus');
    } catch (error) {
        console.error('Error deleting variant:', error);
        showToast('Gagal menghapus varian', 'error');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    
    try {
        const { error } = await supabase
            .from('produk')
            .delete()
            .eq('id', productId);

        if (error) {
            throw error;
        }

        await fetchProducts();
        showToast('Produk berhasil dihapus');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Gagal menghapus produk', 'error');
    }
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error('Toast container not found!');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 3000
    });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function viewVariantHistory(variantId) {
    window.location.href = `history.html?variantId=${variantId}`;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    
    // Initialize filters
    initializeFilters();

    await displayUnpaidNotice();
    
    // Setup other event listeners
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal('add'));
    document.getElementById('addVariantBtn').addEventListener('click', () => addVariantRow());
    document.getElementById('saveProductBtn').addEventListener('click', saveProduct);

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    searchButton.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            if (document.getElementById('searchIcon').innerHTML.includes('bi-x')) {
                clearSearch();
            } else {
                performSearch();
            }
        } else {
            performSearch();
        }
    });
    
    searchInput.addEventListener('keyup', (e) => {
        updateSearchIcon();
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    searchInput.addEventListener('input', updateSearchIcon);
    
    await Promise.all([
        loadCategories(),      // Load for filters
        loadSubCategories(),   // Load for form and filters
        loadSuppliers(),       // Load for form and filters
        // loadSuppliersForFilter(),
        fetchProducts()        // Initial product load
    ]);
    
    // Variant table event delegation
    document.getElementById('variantsTableBody').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-variant')) {
            e.target.closest('tr').remove();
        }
    });
});

// Global functions
window.editProduct = async function(productId) {
    await openProductModal('edit', productId);
};

window.deleteProduct = deleteProduct;
window.viewVariantHistory = viewVariantHistory;
window.deleteVariant = deleteVariant;