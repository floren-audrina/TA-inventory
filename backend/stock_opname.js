import supabase from '../database/db_conn.js';
import { processEntry } from './import.js';

// Global variables
let stockOpnameModal;

// Utility functions
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

function getStatusBadgeClass(status) {
    switch (status) {
        case 'sesuai': return 'bg-success';
        case 'tidak_sesuai': return 'bg-warning';
        case 'disesuaikan': return 'bg-info';
        default: return 'bg-secondary';
    }
}

// Modal functions
async function prepareModal(mode = 'add', logData = null) {
    const modal = document.getElementById('stockOpnameModal');
    modal.dataset.mode = mode;
    
    // Reset form
    document.getElementById('tanggal').valueAsDate = new Date();
    document.querySelector('#productsTable tbody').innerHTML = '';
    
    // Set modal title and button text
    const modalTitle = modal.querySelector('.modal-title');
    const submitBtn = document.getElementById('submitLogButton');
    
    if (mode === 'edit') {
        modalTitle.textContent = 'Edit Stock Opname';
        submitBtn.textContent = 'Update';
        modal.dataset.logId = logData.id;
        // Add this line to store the log data
        modal.dataset.logData = JSON.stringify(logData);
        
        // Set the date
        document.getElementById('tanggal').valueAsDate = new Date(logData.tanggal);
        
        // Load products with existing items checked
        await loadProductsIntoModal(true, logData);
    } else {
        modalTitle.textContent = 'Buat Stock Opname Baru';
        submitBtn.textContent = 'Simpan';
        
        // Load all products
        await loadProductsIntoModal(false);
    }
}

async function loadProductsIntoModal(isEditMode = false, logData = null, page = 1, pageSize = 10) {
    const modalProductTable = document.querySelector('#stockOpnameModal table tbody');
    const selectAllCheckbox = document.getElementById('selectAll');
    
    try {
        // Show loading state
        modalProductTable.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Memuat produk...
                </td>
            </tr>`;

        // Calculate offset for pagination
        const offset = (page - 1) * pageSize;
        
        // Fetch products with pagination
        const { data: productVariants, error, count } = await supabase
            .from('produk_varian')
            .select(`
                id,
                varian,
                jumlah_stok,
                produk:id_produk(
                    id,
                    nama,
                    subkategori:id_subkategori(
                        subkategori,
                        kategori:id_kategori(kategori)
                    )
                )`, { count: 'exact' })
            .order('id_produk', { ascending: true })
            .range(offset, offset + pageSize - 1);

        if (error) throw error;

        // Clear and populate the table
        modalProductTable.innerHTML = '';

        if (!productVariants || productVariants.length === 0) {
            modalProductTable.innerHTML = `
                <tr class="no-products">
                    <td colspan="3" class="text-center text-muted">
                        Tidak ada produk ditemukan
                    </td>
                </tr>`;
            return;
        }

        // Get existing variant IDs if in edit mode
        const existingVariantIds = isEditMode && logData ? 
            logData.items.map(item => item.produk_varian.id) : 
            [];

        productVariants.forEach(variant => {
            const isExisting = existingVariantIds.includes(variant.id);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="checkbox" 
                           class="form-check-input product-checkbox" 
                           data-product-id="${variant.produk.id}"
                           data-variant-id="${variant.id}"
                           ${isExisting ? 'checked' : ''}>
                </td>
                <td>${variant.produk.nama}</td>
                <td>
                    ${variant.varian} 
                    <span class="badge bg-light text-dark ms-2">
                        Stok: ${variant.jumlah_stok || 0}
                    </span>
                </td>
            `;
            modalProductTable.appendChild(row);
        });

        // Handle select all checkbox
        selectAllCheckbox.checked = false;
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.product-checkbox:not(:disabled)');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });

        // Remove existing pagination controls if they exist
        const existingPagination = document.querySelector('#stockOpnameModal .pagination-container');
        if (existingPagination) {
            existingPagination.remove();
        }

        // Add pagination controls if needed
        if (count > pageSize) {
            const totalPages = Math.ceil(count / pageSize);
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'pagination-container d-flex justify-content-between align-items-center mt-3';
            
            // Generate page numbers
            let startPage = Math.max(1, page - 2);
            let endPage = Math.min(totalPages, page + 2);
            
            if (endPage - startPage < 4) {
                if (page < 3) {
                    endPage = Math.min(5, totalPages);
                } else {
                    startPage = Math.max(1, totalPages - 4);
                }
            }
            
            // In your pagination creation code:
            paginationContainer.innerHTML = `
            <div class="text-muted small">
                Menampilkan ${offset + 1}-${Math.min(offset + pageSize, count)} dari ${count} produk
            </div>
            <nav>
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${page === 1 ? 'disabled' : ''}">
                        <button class="page-link" data-page="${page - 1}">
                            &laquo;
                        </button>
                    </li>
                    ${Array.from({length: endPage - startPage + 1}, (_, i) => {
                        const pageNum = startPage + i;
                        return `
                            <li class="page-item ${pageNum === page ? 'active' : ''}">
                                <button class="page-link" data-page="${pageNum}">
                                    ${pageNum}
                                </button>
                            </li>
                        `;
                    }).join('')}
                    <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                        <button class="page-link" data-page="${page + 1}">
                            &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
            <div class="ms-3">
                <select class="form-select form-select-sm page-size-selector">
                    <option value="10" ${pageSize === 10 ? 'selected' : ''}>10 per halaman</option>
                    <option value="25" ${pageSize === 25 ? 'selected' : ''}>25 per halaman</option>
                    <option value="50" ${pageSize === 50 ? 'selected' : ''}>50 per halaman</option>
                </select>
            </div>
            `;
            
            // Insert pagination after the table
            modalProductTable.closest('table').parentNode.appendChild(paginationContainer);
            
            // Add event listeners
            paginationContainer.querySelectorAll('.page-link').forEach(button => {
                button.addEventListener('click', (e) => {
                    const newPage = parseInt(e.target.dataset.page);
                    if (newPage >= 1 && newPage <= totalPages) {
                        loadProductsIntoModal(isEditMode, logData, newPage, pageSize);
                    }
                });
            });
            
            paginationContainer.querySelector('.page-size-selector').addEventListener('change', (e) => {
                const newPageSize = parseInt(e.target.value);
                loadProductsIntoModal(isEditMode, logData, 1, newPageSize);
            });
        }

    } catch (error) {
        console.error('Error loading products:', error);
        modalProductTable.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger">
                    Gagal memuat daftar produk. Silakan coba lagi.
                </td>
            </tr>`;
    }
}

// Helper function for page size change
function changePageSize(selectElement, isEditMode, logData, currentPage) {
    const newPageSize = parseInt(selectElement.value);
    loadProductsIntoModal(isEditMode, logData, 1, newPageSize); // Always reset to page 1 when changing page size
}

// CRUD Operations
async function submitStockOpname() {
    const modal = document.getElementById('stockOpnameModal');
    const mode = modal.dataset.mode;
    
    if (mode === 'edit') {
        await submitEditStockOpname();
    } else {
        await submitNewStockOpname();
    }
}

async function submitNewStockOpname() {
    const tanggalInput = document.getElementById('tanggal');
    const submitBtn = document.getElementById('submitLogButton');
    const checkedItems = document.querySelectorAll('#stockOpnameModal .product-checkbox:checked');

    // Validate inputs
    if (!tanggalInput.value) {
        showToast('Tanggal harus diisi', 'error');
        return;
    }

    if (checkedItems.length === 0) {
        showToast('Pilih minimal 1 produk', 'error');
        return;
    }

    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Menyimpan...';

        // 1. Insert to log_opname table
        const { data: logData, error: logError } = await supabase
            .from('log_opname')
            .insert({
                tanggal: tanggalInput.value,
                status_log: 'draft',
                waktu_dibuat: new Date().toISOString()
            })
            .select('id')
            .single();

        if (logError) throw logError;

        // 2. Prepare items for item_opname table
        const itemsToInsert = Array.from(checkedItems).map(checkbox => ({
            id_log: logData.id,
            id_varian: parseInt(checkbox.dataset.variantId),
            stok: null,
            status_item_log: 'pending'
        }));

        // 3. Insert to item_opname table
        const { error: itemsError } = await supabase
            .from('item_opname')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // Success - close modal and refresh
        showToast('Stock opname berhasil dibuat');
        stockOpnameModal.hide();
        await checkActiveLog();

    } catch (error) {
        console.error('Error submitting stock opname:', error);
        showToast('Gagal menyimpan stock opname: ' + error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Simpan';
        }
    }
}

async function submitEditStockOpname() {
    const modal = document.getElementById('stockOpnameModal');
    const tanggalInput = document.getElementById('tanggal');
    const submitBtn = document.getElementById('submitLogButton');
    const checkedItems = document.querySelectorAll('#stockOpnameModal .product-checkbox:checked');
    const logId = modal.dataset.logId;

    // Validate inputs
    if (!tanggalInput.value) {
        showToast('Tanggal harus diisi', 'error');
        return;
    }

    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Menyimpan...';

        // 1. Update the log_opname date
        const { error: logError } = await supabase
            .from('log_opname')
            .update({
                tanggal: tanggalInput.value
            })
            .eq('id', logId);

        if (logError) throw logError;

        // 2. Get current items in the log
        const { data: currentItems, error: itemsError } = await supabase
            .from('item_opname')
            .select('id_varian')
            .eq('id_log', logId);

        if (itemsError) throw itemsError;

        const currentVariantIds = currentItems.map(item => item.id_varian);
        const newVariantIds = Array.from(checkedItems)
            .map(checkbox => parseInt(checkbox.dataset.variantId))
            .filter(id => !currentVariantIds.includes(id));

        // 3. Add new items only (no removal)
        if (newVariantIds.length > 0) {
            const itemsToInsert = newVariantIds.map(variantId => ({
                id_log: logId,
                id_varian: variantId,
                stok: null,
                status_item_log: 'pending'
            }));

            const { error: insertError } = await supabase
                .from('item_opname')
                .insert(itemsToInsert);

            if (insertError) throw insertError;
        }

        // Success - close modal and refresh
        showToast('Perubahan stock opname berhasil disimpan');
        stockOpnameModal.hide();
        await checkActiveLog();

    } catch (error) {
        console.error('Error editing stock opname:', error);
        showToast('Gagal menyimpan perubahan: ' + error.message, 'error');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Update';
        }
    }
}

async function deleteActiveLog() {
    try {
        const { error } = await supabase
            .from('log_opname')
            .delete()
            .eq('status_log', 'draft');

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting stock opname:', error);
        showToast('Gagal menghapus log stock opname: ' + error.message, 'error');
    }
}

// Stock Opname Functions
async function checkActiveLog() {
    try {
        const hasActiveLog = await hasActiveDraftLog();
        updateAddButtonState(hasActiveLog);
        if (hasActiveLog) {
            await renderActiveLog();
        } else {
            renderEmptyState();
        }
    } catch (error) {
        console.error('Error in checkActiveLog:', error);
    }
}

async function hasActiveDraftLog() {
    try {
        const { data, error } = await supabase
            .from('log_opname')
            .select('id')
            .eq('status_log', 'draft')
            .maybeSingle();

        if (error) throw error;
        return Boolean(data);
    } catch (error) {
        console.error('Error checking active draft log:', error);
        return false;
    }
}

function renderEmptyState() {
    const logContainer = document.getElementById('active');
    logContainer.innerHTML = `
        <div class="alert alert-info">
            Tidak ada log aktif saat ini. Klik tombol "+ Buat log baru" untuk memulai stock opname.
        </div>`;
}

async function renderActiveLog() {
    const logContainer = document.getElementById('active');
    
    logContainer.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="text-center my-4">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Memuat log aktif...</p>
                </div>
            </div>
        </div>`;

    try {
        const { data: activeLog, error: logError } = await supabase
            .from('log_opname')
            .select(`
                id,
                tanggal,
                status_log,
                items:item_opname(
                    id,
                    stok,
                    waktu_penyesuaian,
                    status_item_log,
                    produk_varian:id_varian(
                        id,
                        varian,
                        jumlah_stok,
                        produk:id_produk(nama)
                    )
                )
            `)
            .eq('status_log', 'draft')
            .single();

        if (logError) throw logError;

        const hasPending = await hasPendingItems(activeLog.id);

        logContainer.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between mb-2">
                        <div>
                            <strong>Tanggal:</strong> ${new Date(activeLog.tanggal).toLocaleDateString()}
                            <strong class="ms-1 me-1">|</strong>
                            <strong>Status:</strong> ${activeLog.status_log}
                            <button id="editLogBtn" class="btn btn-sm btn-outline-primary ms-2">✏️ Edit</button>
                            <button id="deleteLogBtn" class="btn btn-sm btn-outline-danger">🗑️ Hapus</button>
                        </div>
                        <div>
                            <button id="finalizeBtn" class="btn btn-sm btn-success" 
                                    ${hasPending ? 'disabled title="Masih ada item yang belum disesuaikan"' : ''}>
                                Finalisasi
                            </button>
                        </div>
                    </div>
                    <table class="table table-bordered table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Produk</th>
                                <th>Varian</th>
                                <th>Stok Sistem</th>
                                <th>Stok Fisik</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="activeLogItems"></tbody>
                    </table>
                </div>
            </div>`;

        // Setup edit button
        document.getElementById('editLogBtn').addEventListener('click', () => {
            prepareModal('edit', activeLog);
            stockOpnameModal.show();
        });

        document.getElementById('deleteLogBtn').addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin menghapus log ini?')) {
                deleteActiveLog();
            }
            renderEmptyState();
        });

        // if (!activeLog || activeLog.length <= 0) {
        //     renderEmptyState();
        // }

        renderLogItems(activeLog.items, activeLog.id);
        setupFinalizeButton(activeLog.id, hasPending);

    } catch (error) {
        console.error('Error loading active log:', error);
        logContainer.innerHTML = `
            <div class="alert alert-danger">
                Gagal memuat log aktif. Silakan coba lagi.
            </div>`;
    }
}

function renderLogItems(items, logId) {
    const tbody = document.getElementById('activeLogItems');
    tbody.innerHTML = '';

    items.forEach(item => {
        const physicalStock = item.stok !== null ? item.stok : '';
        const systemStock = item.produk_varian.jumlah_stok || 0;
        const status = systemStock === physicalStock ? 'sesuai' : item.status_item_log;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.produk_varian.produk.nama}</td>
            <td data-variant-id="${item.produk_varian.id}">${item.produk_varian.varian}</td>
            <td>${systemStock}</td>
            <td>
                <input type="number" class="form-control form-control-sm physical-stock" 
                       data-item-id="${item.id}"
                       value="${physicalStock}"
                       style="width: 70px;">
                <span class="difference-preview small ms-2 ${systemStock === physicalStock ? 'text-success' : 'text-warning'}">
                    (${physicalStock - systemStock > 0 ? '+' : ''}${physicalStock - systemStock})
                </span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(status)}">
                    ${status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary btn-match me-1" 
                        data-item-id="${item.id}"
                        ${status === 'sesuai' || status === 'disesuaikan' ? 'disabled' : ''}>
                    Match
                </button>
                <button class="btn btn-sm btn-link text-danger btn-remove-item" 
                        data-item-id="${item.id}"
                        data-log-id="${logId}">
                    ✖
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Event Listeners
function setupStockInputListeners() {
    document.addEventListener('input', async function(e) {
        if (e.target.classList.contains('physical-stock')) {
            const input = e.target;
            const itemId = input.dataset.itemId;
            const row = input.closest('tr');
            const systemStock = parseInt(row.querySelector('td:nth-child(3)').textContent) || 0;
            const physicalStock = parseInt(input.value) || 0;
            const difference = physicalStock - systemStock;
            const statusBadge = row.querySelector('.badge');
            const matchButton = row.querySelector('.btn-match');
            const differencePreview = row.querySelector('.difference-preview');

            differencePreview.textContent = `(${difference > 0 ? '+' : ''}${difference})`;
            differencePreview.className = `difference-preview small ms-2 ${difference === 0 ? 'text-success' : 'text-warning'}`;

            if (difference === 0) {
                statusBadge.className = 'badge bg-success';
                statusBadge.textContent = 'sesuai';
                matchButton.disabled = true;
                await updateItemStatusAndStock(itemId, 'sesuai', physicalStock);
            } else {
                statusBadge.className = 'badge bg-warning';
                statusBadge.textContent = 'tidak_sesuai';
                matchButton.disabled = false;
                await updateItemStatusAndStock(itemId, 'tidak_sesuai', physicalStock);
            }
            
            await checkFinalizeButtonState();
        }
    });
}

// function setupMatchButtonListeners() {
//     document.addEventListener('click', async function(e) {
//         if (e.target.classList.contains('btn-match')) {
//             const button = e.target;
//             const itemId = button.dataset.itemId;
//             const row = button.closest('tr');
//             const input = row.querySelector('.physical-stock');
//             const variantId = row.querySelector('td:nth-child(2)').dataset.variantId;
//             const systemStock = parseInt(row.querySelector('td:nth-child(3)').textContent) || 0;
//             const physicalStock = parseInt(input.value) || 0;
//             const stockDifference = physicalStock - systemStock;
            
//             try {
//                 button.disabled = true;
//                 button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
                
//                 // Update variant stock
//                 const { error: updateError } = await supabase
//                     .from('produk_varian')
//                     .update({ jumlah_stok: physicalStock })
//                     .eq('id', variantId);
//                 if (updateError) throw updateError;
                
//                 // Create stock history entry
//                 const { error: historyError } = await supabase
//                     .from('riwayat_stok')
//                     .insert({
//                         id_varian: variantId,
//                         tanggal: new Date().toISOString(),
//                         tipe_riwayat: 'penyesuaian',
//                         qty: stockDifference,
//                         saldo: physicalStock,
//                         harga: 0,
//                         hpp: 0,
//                         id_referensi: itemId
//                     });
//                 if (historyError) throw historyError;
                
//                 // Update item_opname with adjustment time
//                 await updateItemStatusAndStock(
//                     itemId, 
//                     'disesuaikan', 
//                     physicalStock,
//                     new Date().toISOString()
//                 );
                
//                 // Update UI
//                 const statusBadge = row.querySelector('.badge');
//                 statusBadge.className = 'badge bg-info';
//                 statusBadge.textContent = 'disesuaikan';
//                 row.querySelector('td:nth-child(3)').textContent = physicalStock;
                
//                 showToast(`Stok berhasil disesuaikan (${stockDifference > 0 ? '+' : ''}${stockDifference})`);
//                 await checkFinalizeButtonState();
//             } catch (error) {
//                 showToast('Gagal menyamakan stok: ' + error.message, 'error');
//             } finally {
//                 button.disabled = false;
//                 button.textContent = 'Match';
//             }
//         }
//     });
// }

function setupMatchButtonListeners() {
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('btn-match')) {
            const button = e.target;
            const itemId = button.dataset.itemId;
            const row = button.closest('tr');
            const input = row.querySelector('.physical-stock');
            const variantId = row.querySelector('td:nth-child(2)').dataset.variantId;
            const systemStock = parseInt(row.querySelector('td:nth-child(3)').textContent) || 0;
            const physicalStock = parseInt(input.value) || 0;
            const stockDifference = physicalStock - systemStock;
            console.log("selisih: ",stockDifference)
            
            // Skip if no adjustment needed
            if (stockDifference === 0) {
                showToast('Tidak ada penyesuaian diperlukan');
                return;
            }
            
            try {
                button.disabled = true;
                button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
                
                // Determine adjustment type
                const adjustmentType = stockDifference > 0 
                    ? 'penyesuaian_masuk'  // Stock increase
                    : 'penyesuaian_keluar'; // Stock decrease
                
                // Use processEntry to handle the adjustment
                await processEntry({
                    variantId: variantId,
                    type: adjustmentType,
                    id: itemId,
                    quantity: Math.abs(stockDifference), // Use absolute value
                    price: 0, // Typically 0 for adjustments
                    date: new Date().toISOString()
                });
                
                // Update item_opname status
                await updateItemStatusAndStock(
                    itemId, 
                    'disesuaikan', 
                    physicalStock,
                    new Date().toISOString()
                );
                
                // Update UI
                const statusBadge = row.querySelector('.badge');
                statusBadge.className = 'badge bg-info';
                statusBadge.textContent = 'disesuaikan';
                row.querySelector('td:nth-child(3)').textContent = physicalStock;
                
                showToast(`Stok berhasil disesuaikan (${stockDifference > 0 ? '+' : ''}${stockDifference})`);
                await checkFinalizeButtonState();
            } catch (error) {
                showToast('Gagal menyamakan stok: ' + error.message, 'error');
            } finally {
                button.disabled = false;
                button.textContent = 'Match';
            }
        }
    });
}

function setupRemoveButtonListeners() {
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('btn-remove-item')) {
            const button = e.target;
            const itemId = button.dataset.itemId;
            const logId = button.dataset.logId;
            
            if (confirm('Apakah Anda yakin ingin menghapus item ini dari log?')) {
                try {
                    button.disabled = true;
                    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';
                    
                    const { error } = await supabase
                        .from('item_opname')
                        .delete()
                        .eq('id', itemId);
                    
                    if (error) throw error;
                    
                    showToast('Item berhasil dihapus');
                    await renderActiveLog();
                } catch (error) {
                    showToast('Gagal menghapus item: ' + error.message, 'error');
                    button.disabled = false;
                    button.innerHTML = '✖';
                }
            }
        }
    });
}

// Helper functions
async function updateItemStatusAndStock(itemId, status, stok, waktuPenyesuaian = null) {
    const updateData = { 
        status_item_log: status,
        stok: stok
    };
    
    if (waktuPenyesuaian) {
        updateData.waktu_penyesuaian = waktuPenyesuaian;
    }
    
    const { error } = await supabase
        .from('item_opname')
        .update(updateData)
        .eq('id', itemId);
    
    if (error) throw error;
}

async function hasPendingItems(logId) {
    const { data, error } = await supabase
        .from('item_opname')
        .select('status_item_log')
        .eq('id_log', logId)
        .in('status_item_log', ['pending', 'tidak_sesuai']);

    if (error) throw error;
    return data.length > 0;
}

async function checkFinalizeButtonState() {
    const finalizeBtn = document.getElementById('finalizeBtn');
    if (!finalizeBtn) return;
    
    const logId = finalizeBtn.dataset.logId;
    if (!logId) return;
    
    const hasPending = await hasPendingItems(logId);
    finalizeBtn.disabled = hasPending;
    finalizeBtn.title = hasPending ? "Masih ada item yang belum disesuaikan" : "";
}

function setupFinalizeButton(logId, isDisabled) {
    const finalizeBtn = document.getElementById('finalizeBtn');
    if (!finalizeBtn) return;

    finalizeBtn.dataset.logId = logId;
    finalizeBtn.disabled = isDisabled;
    finalizeBtn.title = isDisabled ? "Masih ada item yang belum disesuaikan" : "";

    if (!isDisabled) {
        finalizeBtn.addEventListener('click', async () => {
            if (confirm('Apakah Anda yakin ingin memfinalisasi stock opname ini?')) {
                await finalizeStockOpname(logId);
            }
        });
    }
}

async function finalizeStockOpname(logId) {
    try {
        const { error } = await supabase
            .from('log_opname')
            .update({ 
                status_log: 'final',
                waktu_penyelesaian: new Date().toISOString()
            })
            .eq('id', logId);
        
        if (error) throw error;
        
        showToast('Stock opname berhasil difinalisasi');
        await checkActiveLog();
    } catch (error) {
        showToast('Gagal memfinalisasi: ' + error.message, 'error');
    }
}

function updateAddButtonState(hasActiveLog) {
    const addButton = document.querySelector('[data-bs-target="#stockOpnameModal"]');
    if (!addButton) return;
    
    addButton.disabled = hasActiveLog;
    addButton.title = hasActiveLog ? "Selesaikan log aktif terlebih dahulu" : "";
}

//HISTORY TAB
async function loadRiwayatData() {
    const riwayatContainer = document.getElementById('history');
    
    // Show loading state
    riwayatContainer.innerHTML = `
        <div class="text-center my-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Memuat riwayat stock opname...</p>
        </div>`;

    try {
        // Fetch completed stock opname logs
        const { data: completedLogs, error } = await supabase
            .from('log_opname')
            .select(`
                id,
                tanggal,
                status_log,
                waktu_dibuat,
                waktu_penyelesaian,
                items:item_opname(
                    id,
                    stok,
                    status_item_log,
                    produk_varian:id_varian(
                        varian,
                        produk:id_produk(nama)
                    )
                )
            `)
            .eq('status_log', 'final')
            .order('tanggal', { ascending: false });

        if (error) throw error;

        // Check if there's any data
        if (!completedLogs || completedLogs.length === 0) {
            riwayatContainer.innerHTML = `
                <div class="alert alert-info">
                    Tidak ada riwayat log stock opname ditemukan.
                </div>`;
            return;
        }

        // Render the table
        riwayatContainer.innerHTML = `
            <div class="table-responsive">
                <table class="table table-bordered table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Tanggal</th>
                            <th>Status</th>
                            <th>Waktu Dibuat</th>
                            <th>Waktu Selesai</th>
                            <th>Jumlah Item</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="riwayatTableBody"></tbody>
                </table>
            </div>`;

        const tbody = document.getElementById('riwayatTableBody');
        
        completedLogs.forEach(log => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(log.tanggal).toLocaleDateString()}</td>
                <td><span class="badge bg-success">${log.status_log}</span></td>
                <td>${new Date(log.waktu_dibuat).toLocaleString()}</td>
                <td>${log.waktu_selesai ? new Date(log.waktu_selesai).toLocaleString() : '-'}</td>
                <td>${log.items.length} item</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-view-details" 
                            data-log-id="${log.id}">
                        Detail
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Setup detail button event listeners
        document.querySelectorAll('.btn-view-details').forEach(button => {
            button.addEventListener('click', function() {
                const logId = this.dataset.logId;
                const logData = completedLogs.find(log => log.id == logId);
                showRiwayatDetails(logData);
            });
        });

    } catch (error) {
        console.error('Error loading riwayat data:', error);
        riwayatContainer.innerHTML = `
            <div class="alert alert-danger">
                Gagal memuat riwayat stock opname: ${error.message}
            </div>`;
    }
}

// Function to show details of a historical log
function showRiwayatDetails(logData) {
    // Create modal if it doesn't exist
    let detailsModal = document.getElementById('riwayatDetailsModal');
    if (!detailsModal) {
        detailsModal = document.createElement('div');
        detailsModal.className = 'modal fade';
        detailsModal.id = 'riwayatDetailsModal';
        detailsModal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Detail Stock Opname</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <strong>Tanggal:</strong> ${new Date(logData.tanggal).toLocaleDateString()}<br>
                            <strong>Status:</strong> <span class="badge bg-success">${logData.status_log}</span><br>
                            <strong>Waktu Dibuat:</strong> ${new Date(logData.waktu_dibuat).toLocaleString()}<br>
                            <strong>Waktu Selesai:</strong> ${logData.waktu_selesai ? new Date(logData.waktu_selesai).toLocaleString() : '-'}
                        </div>
                        <table class="table table-bordered table-sm">
                            <thead class="table-light">
                                <tr>
                                    <th>Produk</th>
                                    <th>Varian</th>
                                    <th>Stok Sistem</th>
                                    <th>Stok Fisik</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="riwayatDetailsBody"></tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(detailsModal);
    }

    // Populate the details
    const tbody = document.getElementById('riwayatDetailsBody');
    tbody.innerHTML = '';

    logData.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.produk_varian.produk.nama}</td>
            <td>${item.produk_varian.varian}</td>
            <td>${item.produk_varian.jumlah_stok}</td>
            <td>${item.stok}</td>
            <td><span class="badge ${getStatusBadgeClass(item.status_item_log)}">${item.status_item_log}</span></td>
        `;
        tbody.appendChild(row);
    });

    // Show the modal
    const modal = new bootstrap.Modal(detailsModal);
    modal.show();
}

// search functions
async function performProductSearch() {
    const modal = document.getElementById('stockOpnameModal');
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const modalProductTable = document.querySelector('#stockOpnameModal table tbody');
    const isEditMode = document.getElementById('stockOpnameModal').dataset.mode === 'edit';
    const logData = isEditMode && modal.dataset.logData ? 
        JSON.parse(modal.dataset.logData) : 
        null;

    try {
        // Show loading state
        modalProductTable.innerHTML = `
            <tr>
                <td colspan="3" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    Mencari produk...
                </td>
            </tr>`;

        // Base query - we'll first search in produk_varian table
        let query = supabase
            .from('produk_varian')
            .select(`
                id,
                varian,
                jumlah_stok,
                produk:id_produk(
                    id,
                    nama,
                    subkategori:id_subkategori(
                        subkategori,
                        kategori:id_kategori(kategori)
                    )
                )`, { count: 'exact' })
            .order('id_produk', { ascending: true });

        // Add search conditions if search term exists
        if (searchTerm) {
            // First search in produk_varian.varian
            query = query.ilike('varian', `%${searchTerm}%`);
            
            // Then we need a separate query to search in produk.nama
            const { data: productsByName, error: productsError } = await supabase
                .from('produk')
                .select(`
                    id,
                    nama,
                    varian:produk_varian(
                        id,
                        varian,
                        jumlah_stok
                    )
                `)
                .ilike('nama', `%${searchTerm}%`);

            if (productsError) throw productsError;

            // Combine results from both queries
            const { data: variantsByVarian, error: variantsError } = await query;
            if (variantsError) throw variantsError;

            let combinedResults = variantsByVarian || [];
            
            // Add products found by name and their variants
            if (productsByName && productsByName.length > 0) {
                productsByName.forEach(product => {
                    if (product.varian && product.varian.length > 0) {
                        product.varian.forEach(variant => {
                            combinedResults.push({
                                id: variant.id,
                                varian: variant.varian,
                                jumlah_stok: variant.jumlah_stok,
                                produk: {
                                    id: product.id,
                                    nama: product.nama,
                                    subkategori: null // You might need to fetch this if needed
                                }
                            });
                        });
                    }
                });
            }

            // Remove duplicates
            const uniqueResults = combinedResults.reduce((acc, current) => {
                if (!acc.some(item => item.id === current.id)) {
                    acc.push(current);
                }
                return acc;
            }, []);

            // Clear and populate the table
            modalProductTable.innerHTML = '';

            if (uniqueResults.length === 0) {
                modalProductTable.innerHTML = `
                    <tr class="no-products">
                        <td colspan="3" class="text-center text-muted">
                            Tidak ada produk ditemukan
                        </td>
                    </tr>`;
                return;
            }

            // Get existing variant IDs if in edit mode
            const existingVariantIds = isEditMode && logData ? 
                logData.items.map(item => item.produk_varian.id) : 
                [];

            uniqueResults.forEach(variant => {
                const isExisting = existingVariantIds.includes(variant.id);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <input type="checkbox" 
                               class="form-check-input product-checkbox" 
                               data-product-id="${variant.produk.id}"
                               data-variant-id="${variant.id}"
                               ${isExisting ? 'checked' : ''}>
                    </td>
                    <td>${variant.produk.nama}</td>
                    <td>
                        ${variant.varian} 
                        <span class="badge bg-light text-dark ms-2">
                            Stok: ${variant.jumlah_stok || 0}
                        </span>
                    </td>
                `;
                modalProductTable.appendChild(row);
            });

            // Handle select all checkbox
            const selectAllCheckbox = document.getElementById('selectAll');
            selectAllCheckbox.checked = false;
            selectAllCheckbox.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.product-checkbox:not(:disabled)');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
            });

            return; // We've already handled the results
        }

        // If no search term, proceed with normal loading
        const { data: productVariants, error, count } = await query;

        if (error) throw error;

        // Clear and populate the table
        modalProductTable.innerHTML = '';

        if (!productVariants || productVariants.length === 0) {
            modalProductTable.innerHTML = `
                <tr class="no-products">
                    <td colspan="3" class="text-center text-muted">
                        Tidak ada produk ditemukan
                    </td>
                </tr>`;
            return;
        }

        // Get existing variant IDs if in edit mode
        const existingVariantIds = isEditMode && logData ? 
            logData.items.map(item => item.produk_varian.id) : 
            [];

        productVariants.forEach(variant => {
            const isExisting = existingVariantIds.includes(variant.id);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <input type="checkbox" 
                           class="form-check-input product-checkbox" 
                           data-product-id="${variant.produk.id}"
                           data-variant-id="${variant.id}"
                           ${isExisting ? 'checked' : ''}>
                </td>
                <td>${variant.produk.nama}</td>
                <td>
                    ${variant.varian} 
                    <span class="badge bg-light text-dark ms-2">
                        Stok: ${variant.jumlah_stok || 0}
                    </span>
                </td>
            `;
            modalProductTable.appendChild(row);
        });

        // Handle select all checkbox
        const selectAllCheckbox = document.getElementById('selectAll');
        selectAllCheckbox.checked = false;
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.product-checkbox:not(:disabled)');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });

    } catch (error) {
        console.error('Error searching products:', error);
        modalProductTable.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger">
                    Gagal mencari produk. Silakan coba lagi.
                </td>
            </tr>`;
    }
}

function updateProductSearchIcon() {
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');
    
    if (searchInput.value.trim()) {
        searchIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>`;
        searchIcon.onclick = clearProductSearch;
    } else {
        searchIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>`;
        searchIcon.onclick = null;
    }
}

function clearProductSearch() {
    document.getElementById('searchInput').value = '';
    updateProductSearchIcon();
    
    const modal = document.getElementById('stockOpnameModal');
    const isEditMode = modal.dataset.mode === 'edit';
    const logData = isEditMode && modal.dataset.logData ? 
        JSON.parse(modal.dataset.logData) : 
        null;
    
    // Get the current page size from the selector (default to 10 if not found)
    const pageSizeSelector = document.querySelector('#stockOpnameModal .page-size-selector');
    const pageSize = pageSizeSelector ? parseInt(pageSizeSelector.value) : 10;
    
    // Reset to page 1 with the current page size when clearing search
    loadProductsIntoModal(isEditMode, logData, 1, pageSize);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Add this to handle tab switching
    const tabEls = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabEls.forEach(tabEl => {
        tabEl.addEventListener('shown.bs.tab', function(event) {
            if (event.target.id === 'riwayat-tab') {
                loadRiwayatData();
            }
        });
    });
    
    // Handle tab switching
    const historyTab = document.getElementById('history-tab');
    if (historyTab) {
        historyTab.addEventListener('shown.bs.tab', function() {
            loadRiwayatData();
        });
    }

    // Initialize modal
    stockOpnameModal = new bootstrap.Modal(document.getElementById('stockOpnameModal'));

    document.getElementById('createLogButton').addEventListener('click', () => {
        prepareModal('add');
        stockOpnameModal.show();
    });

    // Search functionality (updated to match product.js behavior)
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            if (searchInput.value.trim()) {
                if (document.getElementById('searchIcon').innerHTML.includes('bi-x')) {
                    clearProductSearch();
                } else {
                    performProductSearch();
                }
            } else {
                performProductSearch();
            }
        });
        
        searchInput.addEventListener('keyup', (e) => {
            updateProductSearchIcon();
            if (e.key === 'Enter') {
                performProductSearch();
            }
        });
        
        searchInput.addEventListener('input', updateProductSearchIcon);
    }
    
    // Initialize event listeners
    document.getElementById('selectAll').addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.product-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });
    
    document.getElementById('submitLogButton').addEventListener('click', submitStockOpname);
    
    // Initialize stock opname functionality
    checkActiveLog()
    setupStockInputListeners();
    setupMatchButtonListeners();
    setupRemoveButtonListeners();
});

window.loadProductsIntoModal = loadProductsIntoModal;
// // Expose functions to window
// window.submitStockOpname = submitStockOpname;