import supabase from '../database/db_conn.js';
import { processEntry, updateVariantStock } from './import.js';

// ========== Global Variables ==========
let orderModal;
let currentStatus = 'draft';

// ========== Non-Async Utility Functions ==========
function getStatusColor(status) {
    const colorMap = {
        'dipesan': 'secondary',
        'diterima': 'success',
        'dibayar': 'primary'
        // 'selesai': 'dark'
    };
    return colorMap[status] || 'secondary';
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

async function saveOrder() {
    const mode = document.getElementById('orderModal').dataset.mode;
    
    try {
        if (mode === 'edit') {
            await updateOrder();
        } else {
            await createOrder();
        }
      
        orderModal.hide();
        await renderOngoingOrders();
    } catch (error) {
      console.error('Save failed:', error);
      showToast('Gagal menyimpan pesanan', 'error');
    }
}

function setupModalEvents() {
    document.getElementById('addProduct').addEventListener('click', addProductRow);
    document.getElementById('saveOrder').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent form submission if needed
        try {
            await saveOrder(); // Now errors will be catchable
        } catch (err) {
            console.error("Save failed:", err);
            showToast("Gagal menyimpan: " + err.message, "error");
        }
    });

    // Add supplier change listener
    document.getElementById('supplier').addEventListener('change', async function() {
        // Clear existing product rows
        document.querySelector('#productsTable tbody').innerHTML = '';
        
        // If we're in edit mode, don't auto-add products
        const mode = document.getElementById('orderModal').dataset.mode;
        if (mode === 'edit') return;
        
        // Add a new empty product row for the new supplier
        // await addProductRow();
    });

    // Add event delegation for remove buttons
    document.querySelector('#productsTable tbody').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-item') || e.target.classList.contains('remove-product')) {
            e.target.closest('tr').remove();
        }
    });
    
    document.getElementById('orderModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('orderForm').reset();
        document.querySelector('#productsTable tbody').innerHTML = '';
        document.getElementById('statusFieldsContainer').innerHTML = '';
        
        // Reset table header structure
        const tableHeader = document.querySelector('#productsTable thead tr');
        tableHeader.innerHTML = `
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. dipesan</th>
            <th></th>
        `;
    });
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

function collectFormData() {
    const mode = document.getElementById('orderModal').dataset.mode;
    const currentStatus = document.getElementById('orderStatusBadge')?.textContent || 'dipesan';
    
    const data = {
        orderDate: document.getElementById('orderDate').value,
        supplierId: document.getElementById('supplier').value,
        status: currentStatus,
        items: Array.from(document.querySelectorAll('#productsTable tbody tr')).map(row => {
            const itemData = {
                variantId: row.querySelector('.variant-select').value,
                quantity: parseInt(row.querySelector('.quantity').value) || 0,
                rowId: row.dataset.itemId || null
            };

            // Only include these fields if in edit mode and status is diterima or beyond
            if (mode === 'edit' && currentStatus !== 'dipesan') {
                itemData.receivedQty = parseInt(row.querySelector('.received-qty')?.value) || 0;
                itemData.brokenQty = parseInt(row.querySelector('.broken-qty')?.value) || 0;
                itemData.purchasePrice = parseFloat(row.querySelector('.purchase-price')?.value) || 0;
            }

            return itemData;
        })
    };

    // Add status-specific fields
    if (mode === 'edit') {
        if (currentStatus === 'diterima') {
            data.receivedDate = document.getElementById('tanggalDiterima')?.value;
            data.receivingLocation = document.getElementById('lokasiPenerimaan')?.value;
            data.deliveryNoteNumber = document.getElementById('noSuratJalan')?.value;
        }
        else if (currentStatus === 'dibayar') {
            data.paymentDate = document.getElementById('tanggalPembayaran')?.value;
            data.paymentAmount = parseFloat(document.getElementById('totalDibayarkan')?.value) || 0;
            data.paymentMethod = document.getElementById('alatPembayaran')?.value;
        }
    }

    return data;
}

async function addProductRow(productId = null, variantId = null) {
    const tbody = document.querySelector('#productsTable tbody');
    const supplierId = document.getElementById('supplier').value;
    
    if (!supplierId) {
        showToast('Pilih supplier terlebih dahulu', 'warning');
        return;
    }

    try {
        // Fetch products for this supplier
        const { data: products, error } = await supabase
            .from('produk')
            .select('id, nama')
            .eq('id_supplier', supplierId)
            .order('nama', { ascending: true });

        if (error) throw error;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <select class="form-select product-select">
                    <option value="" selected disabled>Pilih Produk</option>
                    ${products.map(p => 
                        `<option value="${p.id}" ${productId === p.id ? 'selected' : ''}>
                            ${p.nama}
                        </option>`
                    ).join('')}
                </select>
            </td>
            <td>
                <select class="form-select variant-select" ${productId ? '' : 'disabled'}>
                    ${productId 
                        ? '<option value="" selected disabled>Memuat varian...</option>'
                        : '<option value="" selected disabled>Pilih Produk Dulu</option>'
                    }
                </select>
            </td>
            <td>
                <input type="number" class="form-control quantity" min="1" value="">
            </td>
            <td>
                <button class="btn btn-danger btn-sm remove-product">×</button>
            </td>
        `;

        tbody.appendChild(row);

        // Set up product and variant handling
        const productSelect = row.querySelector('.product-select');
        const variantSelect = row.querySelector('.variant-select');
        
        productSelect.addEventListener('change', async function() {
            if (!this.value) {
                variantSelect.innerHTML = '<option value="" selected disabled>Pilih Produk Dulu</option>';
                variantSelect.disabled = true;
                return;
            }
            
            await loadVariants(productSelect, variantSelect, row, variantId);
        });

        // If product is pre-selected, trigger the change event to load variants
        if (productId) {
            productSelect.dispatchEvent(new Event('change'));
        }

    } catch (error) {
        console.error('Error adding product row:', error);
        showToast('Gagal menambahkan produk', 'error');
    }
}

async function loadVariants(productSelect, variantSelect, row, preSelectedVariantId = null) {
    const selectedProductId = productSelect.value;
    
    // Set initial loading state
    variantSelect.disabled = true;
    variantSelect.innerHTML = '<option value="" selected disabled>Memuat varian...</option>';
    
    if (!selectedProductId) {
        variantSelect.innerHTML = '<option value="" selected disabled>Pilih Produk Dulu</option>';
        return;
    }

    try {
        // Load variants for the selected product
        const { data: variants, error } = await supabase
            .from('produk_varian')
            .select('id, varian, harga_standar')
            .eq('id_produk', selectedProductId)
            .order('varian', { ascending: true });

        if (error) throw error;

        // Update variant select options
        variantSelect.innerHTML = `
            <option value="" ${!preSelectedVariantId ? 'selected' : ''} disabled>Pilih Varian</option>
            ${variants.map(v => 
                `<option value="${v.id}" data-price="${v.harga_standar}"
                    ${preSelectedVariantId === v.id ? 'selected' : ''}>
                    ${v.varian}
                </option>`
            ).join('')}
        `;
        
        variantSelect.disabled = false;

    } catch (error) {
        console.error('Error loading variants:', error);
        variantSelect.innerHTML = '<option value="" selected disabled>Error memuat varian</option>';
    }
}

function createItemRow(item, currentStatus) {
    const row = document.createElement('tr');
    row.dataset.itemId = item.id;

    const disableRemove = ['diterima', 'dibayar', 'selesai'].includes(currentStatus);
    
    row.innerHTML = `
        <td>
            <select class="form-select product-select" disabled>
                <option value="${item.produk_varian.id}" selected>
                    ${item.produk_varian.produk.nama}
                </option>
            </select>
        </td>
        <td>
            <select class="form-select variant-select" ${currentStatus !== 'dipesan' ? 'disabled' : ''}>
                <option value="${item.produk_varian.id}" selected>
                    ${item.produk_varian.varian}
                </option>
            </select>
        </td>
        <td>
            <input type="number" class="form-control quantity" 
                   value="${item.qty_dipesan}" min="1" 
                   ${currentStatus !== 'dipesan' ? 'readonly' : ''}>
        </td>
        ${currentStatus !== 'dipesan' ? 
        `<td>
            <input type="number" class="form-control received-qty" 
                   value="${item.qty_diterima || 0}" min="0"
                   ${['dibayar', 'selesai'].includes(currentStatus) ? 'readonly' : ''}>
        </td>` : ''}
        ${currentStatus !== 'dipesan' ? 
            `<td>
                <input type="number" class="form-control broken-qty" 
                       value="${item.qty_rusak || 0}" min="0"
                       ${['dibayar', 'selesai'].includes(currentStatus) ? 'readonly' : ''}>
            </td>` : ''}
        ${currentStatus !== 'dipesan' ? 
            `<td>
                <input type="number" class="form-control purchase-price" 
                        value="${item.harga_beli || 0}" min="0"
                        ${['dibayar', 'selesai'].includes(currentStatus) ? 'readonly' : ''}>
            </td>` : ''}
        <td>
            <button class="btn btn-danger btn-sm remove-item" 
                    ${disableRemove ? 'disabled' : ''}>×</button>
        </td>
    `;
    
    return row;
}

function setupStatusToggle(currentStatus, orderData) {
    const statusBadge = document.getElementById('orderStatusBadge');
    const toggleButtons = document.querySelectorAll('#orderStatusToggle .btn-status');
    
    // Store current field values before any updates
    const currentFieldValues = {};
    if (currentStatus === 'diterima') {
        currentFieldValues.tanggalDiterima = document.getElementById('tanggalDiterima')?.value || '';
        currentFieldValues.lokasiPenerimaan = document.getElementById('lokasiPenerimaan')?.value || '';
        currentFieldValues.noSuratJalan = document.getElementById('noSuratJalan')?.value || '';
    } else if (currentStatus === 'dibayar') {
        currentFieldValues.tanggalPembayaran = document.getElementById('tanggalPembayaran')?.value || '';
        currentFieldValues.totalDibayarkan = document.getElementById('totalDibayarkan')?.value || '';
        currentFieldValues.alatPembayaran = document.getElementById('alatPembayaran')?.value || '';
    }

    // Set the correct toggle button as active and disable appropriate ones
    toggleButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.disabled = false;
        
        if (btn.dataset.status === currentStatus) {
            btn.classList.add('active');
            btn.disabled = true; // Disable current status button
        }
    });
    
    // Disable previous status buttons
    const statusOrder = ['dipesan', 'diterima', 'dibayar', 'selesai'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    for (let i = 0; i < currentIndex; i++) {
        const prevStatus = statusOrder[i];
        document.querySelector(`#orderStatusToggle .btn-status[data-status="${prevStatus}"]`)
            .disabled = true;
    }
    
    // Immediately update form fields for the current status
    updateFormForStatus(currentStatus, currentFieldValues);
    
    // Set up click handlers
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.disabled) return;
            
            const newStatus = this.dataset.status;
            
            // Update UI
            statusBadge.textContent = newStatus;
            statusBadge.className = `badge bg-${getStatusColor(newStatus)}`;
            
            // Preserve existing field values
            const fieldValues = {};
            if (currentStatus === 'diterima') {
                fieldValues.tanggalDiterima = document.getElementById('tanggalDiterima')?.value || '';
                fieldValues.lokasiPenerimaan = document.getElementById('lokasiPenerimaan')?.value || '';
                fieldValues.noSuratJalan = document.getElementById('noSuratJalan')?.value || '';
            } else if (currentStatus === 'dibayar') {
                fieldValues.tanggalPembayaran = document.getElementById('tanggalPembayaran')?.value || '';
                fieldValues.totalDibayarkan = document.getElementById('totalDibayarkan')?.value || '';
                fieldValues.alatPembayaran = document.getElementById('alatPembayaran')?.value || '';
            }
            
            // Update form with preserved values
            updateFormForStatus(newStatus, fieldValues);

            // Update button states
            toggleButtons.forEach(b => {
                b.classList.remove('active');
                b.disabled = false;
            });
            this.classList.add('active');
            this.disabled = true;
            
            // Disable previous status buttons
            const newIndex = statusOrder.indexOf(newStatus);
            for (let i = 0; i < newIndex; i++) {
                const prevStatus = statusOrder[i];
                document.querySelector(`#orderStatusToggle .btn-status[data-status="${prevStatus}"]`)
                    .disabled = true;
            }
        });
    });
}

function createOrderCard(order) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-6 col-lg-4 mb-3';
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card h-100';
    
    // Card header with status and edit button
    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
    
    const title = document.createElement('h5');
    title.className = 'mb-0';
    title.textContent = `#${order.id}`;
    
    const statusDiv = document.createElement('div');
    statusDiv.className = 'd-flex align-items-center gap-2';
    
    const status = document.createElement('span');
    status.className = `order-status badge bg-${getStatusColor(order.status_pesanan)}`;
    status.textContent = order.status_pesanan;
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline-secondary edit-order';
    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openOrderModal('edit', order.id);
    });
    
    headerDiv.appendChild(title);
    statusDiv.appendChild(status);
    statusDiv.appendChild(editBtn);
    headerDiv.appendChild(statusDiv);
    
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'card-body';
    
    const dateP = document.createElement('p');
    dateP.className = 'mb-1';
    dateP.innerHTML = `<strong>Tanggal Pemesanan:</strong> ${order.tanggal_pesan}`;
    
    const supplierP = document.createElement('p');
    supplierP.className = 'mb-1';
    supplierP.innerHTML = `<strong>Supplier:</strong> ${order.supplier.perusahaan} (Contact Person: ${order.supplier.cp})`;

    // Items list
    const itemsTitle = document.createElement('p');
    itemsTitle.className = 'mb-1 mt-1 fw-bold';
    itemsTitle.textContent = 'Items:';
    
    const itemsList = document.createElement('ul');
    itemsList.className = 'list-unstyled mb-0';
    
    order.items.forEach(product => {
        const li = document.createElement('li');
        li.className = 'd-flex justify-content-between';
        li.innerHTML = `
            <span>${product.produk_varian?.produk?.nama || 'Produk'} - ${product.produk_varian?.varian || ''}</span>
            <span>${product.qty_dipesan}</span>
        `;
        itemsList.appendChild(li);
    });

    bodyDiv.appendChild(dateP);
    bodyDiv.appendChild(supplierP);
    bodyDiv.appendChild(itemsTitle);
    bodyDiv.appendChild(itemsList);
    
    // const productsP = document.createElement('p');
    // productsP.className = 'mb-1';
    // productsP.innerHTML = `<strong>Produk:</strong> ${order.products.map(p => `${p.name} (Qty: ${p.qty})`).join(', ')}`;
    
    const footerDiv = document.createElement('div');
    footerDiv.className = 'card-footer bg-transparent border-top-0';
    
    // const detailBtn = document.createElement('button');
    // detailBtn.className = 'btn btn-sm btn-outline-primary';
    // detailBtn.textContent = 'Detail';
    // detailBtn.addEventListener('click', () => showOrderDetail(order));
    // footerDiv.appendChild(detailBtn);
    
    const btnGroup = document.createElement('div');
    btnGroup.className = 'd-flex justify-content-between';
    
    const actionBtn = document.createElement('button');
    actionBtn.className = 'btn btn-sm';
    
    // Status-specific buttons
    if (order.status_pesanan === 'dipesan') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-sm btn-outline-danger ms-2 cancel-order';
        cancelBtn.innerHTML = '<i class="bi bi-x-circle"></i> Batalkan';
        cancelBtn.dataset.orderId = order.id;
        footerDiv.appendChild(cancelBtn);
    } 
    else if (order.status_pesanan === 'diterima') {
        const archiveBtn = document.createElement('button');
        archiveBtn.className = 'btn btn-sm btn-outline-warning ms-2 archive-order';
        archiveBtn.innerHTML = '<i class="bi bi-archive"></i> Arsipkan';
        archiveBtn.dataset.orderId = order.id;
        footerDiv.appendChild(archiveBtn);
    } 
    else if (order.status_pesanan === 'dibayar') {
        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn btn-sm btn-dark ms-2 complete-order';
        completeBtn.innerHTML = '<i class="bi bi-check-circle"></i> Selesaikan';
        completeBtn.dataset.orderId = order.id;
        
        // Store all items data as JSON in the button
        const itemsData = order.items.map(item => ({
            variantId: item.produk_varian?.id || '',
            receivedQty: item.qty_diterima || 0,
            brokenQty: item.qty_rusak || 0,
            price: item.harga_beli || 0
        }));
        
        completeBtn.dataset.items = JSON.stringify(itemsData);
        footerDiv.appendChild(completeBtn);
    }

    btnGroup.appendChild(actionBtn);
    footerDiv.appendChild(btnGroup);

    // footerDiv.appendChild(detailBtn);
    // if (order.status !== 'selesai') {
    //     footerDiv.appendChild(actionBtn);
    // }
    
    cardDiv.appendChild(headerDiv);
    cardDiv.appendChild(bodyDiv);
    cardDiv.appendChild(footerDiv);
    
    colDiv.appendChild(cardDiv);
    return colDiv;
}

// ========== Async Functions ==========
async function updateFormForStatus(newStatus, fieldValues = {}) {
    // 1. Update table structure
    const tableHeader = document.querySelector('#productsTable thead tr');
    if (newStatus === 'dipesan') {
        tableHeader.innerHTML = `
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. dipesan</th>
            <th></th>
        `;
    } else {
        tableHeader.innerHTML = `
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th>Qty. Diterima</th>
            <th>Qty. Rusak</th>
            <th>Harga Beli (satuan)</th>
            <th></th>
        `;
    }

    // 2. Update row editability
    document.querySelectorAll('#productsTable tbody tr').forEach(row => {
        const qtyInput = row.querySelector('.quantity');
        const variantSelect = row.querySelector('.variant-select');
        const receivedQty = row.querySelector('.received-qty');
        const brokenQty = row.querySelector('.broken-qty');
        const price = row.querySelector('.purchase-price');
        const deleteBtn = row.querySelector('.remove-item');
        
        qtyInput.readOnly = (newStatus !== 'dipesan');
        variantSelect.disabled = (newStatus !== 'dipesan');
        
        if (newStatus !== 'dipesan') {
            // Ensure columns exist
            if (!receivedQty && !brokenQty && !price) {
                const actionCell = row.querySelector('td:last-child');
                
                const receivedCell = document.createElement('td');
                receivedCell.innerHTML = `
                    <input type="number" class="form-control received-qty" min="0"
                           ${['dibayar', 'selesai'].includes(newStatus) ? 'readonly' : ''}>
                `;
                row.insertBefore(receivedCell, actionCell);
                
                const brokenCell = document.createElement('td');
                brokenCell.innerHTML = `
                    <input type="number" class="form-control broken-qty" min="0"
                           ${['dibayar', 'selesai'].includes(newStatus) ? 'readonly' : ''}>
                `;
                row.insertBefore(brokenCell, actionCell);
                
                const priceCell = document.createElement('td');
                priceCell.innerHTML = `
                    <input type="number" class="form-control purchase-price" min="0"
                           ${['dibayar', 'selesai'].includes(newStatus) ? 'readonly' : ''}>
                `;
                row.insertBefore(priceCell, actionCell);
            } else {
                if (receivedQty) receivedQty.readOnly = ['dibayar', 'selesai'].includes(newStatus);
                if (brokenQty) brokenQty.readOnly = ['dibayar', 'selesai'].includes(newStatus);
                if (price) price.readOnly = ['dibayar', 'selesai'].includes(newStatus);
            }
        } else {
            // Remove additional columns if reverting to 'dipesan'
            ['.received-qty', '.broken-qty', '.purchase-price'].forEach(selector => {
                const cell = row.querySelector(selector);
                if (cell) cell.parentElement.remove();
            });
        }
        
        if (deleteBtn) {
            deleteBtn.disabled = ['diterima', 'dibayar', 'selesai'].includes(newStatus);
        }
    });

    // 3. Control Add Item button visibility
    document.getElementById('addProduct').style.display = 
        newStatus === 'dipesan' ? 'block' : 'none';

    // 4. Update status-specific fields
    const container = document.getElementById('statusFieldsContainer');
    
    if (newStatus === 'diterima') {
        const locations = await getLocationEnum();
        
        let locationOptions = '<option value="" disabled selected>Pilih lokasi</option>';
        locations.forEach(location => {
            const selected = fieldValues.lokasiPenerimaan === location.value ? 'selected' : '';
            const displayText = location.value.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            locationOptions += `<option value="${location.value}" ${selected}>${displayText}</option>`;
        });

        container.innerHTML = `
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Diterima</label>
                    <input type="date" class="form-control" id="tanggalDiterima" 
                           value="${fieldValues.tanggalDiterima || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Lokasi Penerimaan</label>
                    <select class="form-select" id="lokasiPenerimaan">
                        ${locationOptions}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">No. Surat Jalan</label>
                    <input type="text" class="form-control" id="noSuratJalan" 
                           value="${fieldValues.noSuratJalan || ''}">
                </div>
            </div>
        `;
    }
    else if (newStatus === 'dibayar') {
        const paymentMethods = await getPaymentMethodsEnum();
        
        let paymentOptions = '<option value="" disabled selected>Pilih metode pembayaran</option>';
        paymentMethods.forEach(method => {
            const selected = fieldValues.alatPembayaran === method.value ? 'selected' : '';
            const displayText = method.value.charAt(0).toUpperCase() + method.value.slice(1);
            paymentOptions += `<option value="${method.value}" ${selected}>${displayText}</option>`;
        });

        container.innerHTML = `
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="date" class="form-control" id="tanggalPembayaran" 
                           value="${fieldValues.tanggalPembayaran || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Total Dibayarkan</label>
                    <input type="number" class="form-control" id="totalDibayarkan" 
                           value="${fieldValues.totalDibayarkan || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Alat Pembayaran</label>
                    <select class="form-select" id="alatPembayaran">
                        ${paymentOptions}
                    </select>
                </div>
            </div>
        `;
    }
    else {
        container.innerHTML = '';
    }
}

async function getLocationEnum() {
    try {
        const { data, error } = await supabase.rpc('get_enum_values', { 
            enum_name: 'lokasi_penerimaan' 
        });
        
        if (error) {
            console.error('Error loading locations:', error);
            return [
                { value: 'gudang' },
                { value: 'toko' }
            ]; // Fallback values
        }
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [
            { value: 'gudang' },
            { value: 'toko' }
        ]; // Fallback values
    }
}

async function getPaymentMethodsEnum() {
    try {
        const { data, error } = await supabase.rpc('get_enum_values', { 
            enum_name: 'alat_pembayaran' 
        });
        
        if (error) {
            console.error('Error loading payment methods:', error);
            return [
                { value: 'tunai' },
                { value: 'transfer' }
            ]; // Fallback values
        }
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [
            { value: 'tunai' },
            { value: 'transfer' }
        ]; // Fallback values
    }
}

async function updateOrderStatus(orderId, currentStatus) {
    const nextStatus = {
        dipesan: 'diterima',
        diterima: 'dibayar',
        dibayar: 'selesai'
    }[currentStatus];

    try {
        const updates = {
            status_pesanan: nextStatus
        };

        // Add payment details if moving to dibayar status
        // if (nextStatus === 'dibayar') {
        //     updates.tanggal_pembayaran = new Date().toISOString().split('T')[0];
        //     updates.alat_pembayaran = 'tunai'; // Default value, can be changed in edit
        // }

        const { error } = await supabase
            .from('pesanan_pembelian')
            .update(updates)
            .eq('id_beli', orderId);

        if (error) throw error;

        showToast(`Status pesanan berhasil diubah menjadi ${nextStatus}`, 'success');
        await renderOngoingOrders();
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Gagal mengupdate status pesanan', 'error');
    }
}

// Async DOM functions
async function renderOngoingOrders() {
    const ongoingContainer = document.getElementById('ongoingOrdersContainer');
    if (!ongoingContainer) return;
    
    try {
        ongoingContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat pesanan...
            </div>
        `;

        const { data: orders, error } = await supabase
            .from('pesanan_pembelian')
            .select(`
                id,
                tanggal_pesan,
                status_pesanan,
                supplier:id_supplier(perusahaan, cp),
                items:item_pesanan_pembelian(
                    id,
                    produk_varian:id_varian(
                        id,
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan,
                    qty_diterima,
                    qty_rusak,
                    harga_beli
                )
            `)
            .neq('status_pesanan', 'selesai')
            .order('tanggal_pesan', { ascending: false });

        if (error) throw error;

        ongoingContainer.innerHTML = '';
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row mt-3';
        
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                // const orderCard = createOrderCard({
                //     id: order.id,
                //     date: order.tanggal_pesan,
                //     supplier: order.supplier.perusahaan,
                //     products: order.items.map(item => ({
                //         name: `${item.produk_varian.produk.nama} (${item.produk_varian.varian})`,
                //         qty: item.qty_dipesan
                //     })),
                //     status: order.status_pesanan,
                //     id_beli: order.id
                // });
                rowDiv.appendChild(createOrderCard(order));
            });
        } else {
            rowDiv.innerHTML = '<div class="col-12 text-center text-muted">Tidak ada pesanan yang sedang berlangsung</div>';
        }
        
        ongoingContainer.appendChild(rowDiv);
    } catch (error) {
        console.error('Error fetching orders:', error);
        showToast('Gagal memuat daftar pesanan', 'error');
    }
}

async function openOrderModal(mode = 'add', orderId = null) {
    // Initialize modal if needed
    if (!orderModal) {
        orderModal = new bootstrap.Modal(document.getElementById('orderModal'));
        await loadSuppliers();
    }

    // Reset form completely before setting up
    document.getElementById('orderForm').reset();
    document.querySelector('#productsTable tbody').innerHTML = '';
    document.getElementById('statusFieldsContainer').innerHTML = '';

    setupModalEvents();

    // Get references to UI elements
    const statusToggleContainer = document.querySelector('.status-toggle-container');
    const statusBadge = document.getElementById('orderStatusBadge');
    const modalTitle = document.getElementById('orderModalLabel');
    const tableHeader = document.querySelector('#productsTable thead tr');

    // Set mode and UI state
    const modalElement = document.getElementById('orderModal');
    modalElement.dataset.mode = mode;
    
    if (mode === 'edit' && orderId) {
        // Edit mode - show toggle, hide badge
        if (statusToggleContainer) statusToggleContainer.style.display = 'block';
        if (statusBadge) statusBadge.style.display = 'none';
        modalTitle.textContent = 'Edit Pesanan Pembelian';
        
        // Set expanded table header for non-'dipesan' status
        const { data: order, error } = await supabase
            .from('pesanan_pembelian')
            .select('status_pesanan')
            .eq('id', orderId)
            .single();

        if (!error && order && order.status_pesanan !== 'dipesan') {
            tableHeader.innerHTML = `
                <th>Produk</th>
                <th>Varian</th>
                <th>Qty. Dipesan</th>
                <th>Qty. Diterima</th>
                <th>Qty. Rusak</th>
                <th>Harga Beli (satuan)</th>
                <th></th>
            `;
        } else {
            tableHeader.innerHTML = `
                <th>Produk</th>
                <th>Varian</th>
                <th>Qty. Dipesan</th>
                <th></th>
            `;
        }
        
        await populateEditForm(orderId);
        document.getElementById('saveOrder').textContent = 'Update';
        
    } else {
        // Add mode - hide toggle, show badge
        if (statusToggleContainer) statusToggleContainer.style.display = 'none';
        if (statusBadge) {
            statusBadge.style.display = 'inline-block';
            statusBadge.textContent = 'dipesan';
            statusBadge.className = `badge bg-${getStatusColor('dipesan')}`;
        }
        modalTitle.textContent = 'Tambah Pesanan Pembelian';
        
        // Set basic table header for add mode
        tableHeader.innerHTML = `
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th></th>
        `;
        
        document.getElementById('saveOrder').textContent = 'Simpan';
    }

    orderModal.show();
}

async function populateEditForm(orderId) {
    try {
        const { data: order, error } = await supabase
            .from('pesanan_pembelian')
            .select(`
                id,
                tanggal_pesan,
                id_supplier,
                status_pesanan,
                tanggal_diterima,
                lokasi_penerimaan,
                no_surat_jalan,
                tanggal_pembayaran,
                total_dibayarkan,
                alat_pembayaran,
                items:item_pesanan_pembelian(
                    id,
                    produk_varian:id_varian(
                        id,
                        varian,
                        produk:id_produk(id, nama)
                    ),
                    qty_dipesan,
                    qty_diterima,
                    qty_rusak,
                    harga_beli
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;

        // Store order data in modal
        const modal = document.getElementById('orderModal');
        modal.dataset.orderId = orderId;
        modal.dataset.currentStatus = order.status_pesanan;

        // Populate basic fields
        document.getElementById('orderDate').value = order.tanggal_pesan;
        document.getElementById('supplier').value = order.id_supplier;
        
        // Clear and prepare form
        const tableBody = document.querySelector('#productsTable tbody');
        tableBody.innerHTML = '';
        document.getElementById('statusFieldsContainer').innerHTML = '';
        
        // Create all item rows
        order.items.forEach(item => {
            const row = createItemRow(item, order.status_pesanan);
            tableBody.appendChild(row);
        });

        // Add status-specific fields with current data
        await addStatusSpecificFields(order);
        
        // Setup status toggle
        setupStatusToggle(order.status_pesanan, order);

        // Control UI elements based on status
        document.getElementById('addProduct').style.display = 
            order.status_pesanan === 'dipesan' ? 'block' : 'none';

    } catch (error) {
        console.error('Failed to load order:', error);
        showToast('Gagal memuat data pesanan', 'error');
        throw error;
    }
}

async function addStatusSpecificFields(order) {
    const container = document.getElementById('statusFieldsContainer');
    container.innerHTML = '';
    
    if (order.status_pesanan === 'diterima') {
        const locations = await getLocationEnum();
        
        let locationOptions = '<option value="" disabled selected>Pilih lokasi</option>';
        locations.forEach(location => {
            const isSelected = order.lokasi_penerimaan === location.value ? 'selected' : '';
            const displayText = location.value.split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            locationOptions += `<option value="${location.value}" ${isSelected}>${displayText}</option>`;
        });

        container.innerHTML = `
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Diterima</label>
                    <input type="date" class="form-control" id="tanggalDiterima" 
                           value="${order.tanggal_diterima || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Lokasi Penerimaan</label>
                    <select class="form-select" id="lokasiPenerimaan">
                        ${locationOptions}
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">No. Surat Jalan</label>
                    <input type="text" class="form-control" id="noSuratJalan" 
                           value="${order.no_surat_jalan || ''}">
                </div>
            </div>
        `;
    }
    else if (order.status_pesanan === 'dibayar') {
        const paymentMethods = await getPaymentMethodsEnum();
        
        let paymentOptions = '<option value="" disabled selected>Pilih metode pembayaran</option>';
        paymentMethods.forEach(method => {
            const isSelected = order.alat_pembayaran === method.value ? 'selected' : '';
            const displayText = method.value.charAt(0).toUpperCase() + method.value.slice(1);
            paymentOptions += `<option value="${method.value}" ${isSelected}>${displayText}</option>`;
        });

        container.innerHTML = `
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="date" class="form-control" id="tanggalPembayaran" 
                           value="${order.tanggal_pembayaran || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Total Dibayarkan</label>
                    <input type="number" class="form-control" id="totalDibayarkan" 
                           value="${order.total_dibayarkan || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Alat Pembayaran</label>
                    <select class="form-select" id="alatPembayaran">
                        ${paymentOptions}
                    </select>
                </div>
            </div>
        `;
    }
}

async function createOrder() {
    const formData = collectFormData();
    
    try {
        // 1. Create order header
        const { data: newOrder, error } = await supabase
            .from('pesanan_pembelian')
            .insert({
                tanggal_pesan: formData.orderDate,
                id_supplier: formData.supplierId,
                status_pesanan: 'dipesan'
            })
            .select()
            .single();

        if (error) throw error;
  
        // 2. Add items with variant IDs
        const { error: itemsError } = await supabase
            .from('item_pesanan_pembelian')
            .insert(formData.items.map(item => ({
                id_beli: newOrder.id,
                id_varian: item.variantId,
                qty_dipesan: item.quantity,
                qty_diterima: null,
                qty_rusak: null,
                harga_beli: null
            })));

        if (itemsError) throw itemsError;
  
        showToast('Pesanan baru berhasil dibuat', 'success');
        await renderOngoingOrders();
    } catch (error) {
        console.error('Create order error:', error);
        showToast('Gagal membuat pesanan: ' + error.message, 'error');
    }
}

async function updateOrder() {
    const orderId = document.getElementById('orderModal').dataset.orderId;
    const formData = collectFormData();
    
    try {
        // 1. Prepare order update data
        const orderUpdateData = {
            tanggal_pesan: formData.orderDate,
            id_supplier: formData.supplierId,
            status_pesanan: formData.status
        };

        // Add additional fields for 'diterima' status
        if (formData.status === 'diterima') {
            orderUpdateData.tanggal_diterima = formData.receivedDate;
            orderUpdateData.lokasi_penerimaan = formData.receivingLocation;
            orderUpdateData.no_surat_jalan = formData.deliveryNoteNumber;
        }
        // Add payment details for 'dibayar' status
        else if (formData.status === 'dibayar') {
            orderUpdateData.tanggal_pembayaran = formData.paymentDate;
            orderUpdateData.total_dibayarkan = formData.paymentAmount;
            orderUpdateData.alat_pembayaran = formData.paymentMethod;
        }

        // Update order header
        const { error: headerError } = await supabase
            .from('pesanan_pembelian')
            .update(orderUpdateData)
            .eq('id', orderId);

        if (headerError) throw headerError;

        // 2. Handle stock updates for received orders
        if (formData.status === "diterima") {
            for (const item of formData.items) {
                if (item.receivedQty === undefined || item.brokenQty === undefined) {
                    throw new Error('All items must have received and broken quantities when status is "diterima"');
                }

                const receivedQty = Number(item.receivedQty) || 0;
                const brokenQty = Number(item.brokenQty) || 0;
                const netQty = receivedQty - brokenQty;

                if (isNaN(receivedQty) || isNaN(brokenQty)) {
                    throw new Error('Quantities must be valid numbers');
                }

                // Update variant stock directly
                const newStock = await updateVariantStock(item.variantId, netQty, 'pembelian');
                if (newStock === null) {
                    throw new Error(`Failed to update stock for variant ${item.variantId}`);
                }
            }
        }

        // 3. Process item updates
        const updates = [];
        const newItems = [];
        
        formData.items.forEach(item => {
            const itemData = {
                id_varian: item.variantId,
                qty_dipesan: item.quantity
            };

            // Include additional fields for diterima/dibayar status
            if (formData.status !== 'dipesan') {
                itemData.qty_diterima = item.receivedQty || null;
                itemData.qty_rusak = item.brokenQty || null;
                itemData.harga_beli = item.purchasePrice || null;
            }

            if (item.rowId) {
                updates.push({ ...itemData, id: item.rowId });
            } else {
                newItems.push({ ...itemData, id_beli: orderId });
            }
        });

        // 4. Execute updates
        if (updates.length > 0) {
            const { error: updateError } = await supabase
                .from('item_pesanan_pembelian')
                .upsert(updates);
            
            if (updateError) throw updateError;
        }
        
        if (newItems.length > 0) {
            const { error: insertError } = await supabase
                .from('item_pesanan_pembelian')
                .insert(newItems);
            
            if (insertError) throw insertError;
        }

        showToast('Pesanan berhasil diperbarui', 'success');
        await renderOngoingOrders();
    } catch (error) {
        console.error('Update order error:', error);
        showToast('Gagal memperbarui pesanan: ' + error.message, 'error');
    }
}

// async function updateOrder() {
//     const orderId = document.getElementById('orderModal').dataset.orderId;
//     const formData = collectFormData();
    
//     try {
//         // 1. Update order header
//         const { error: headerError } = await supabase
//             .from('pesanan_pembelian')
//             .update({
//                 tanggal_pesan: formData.orderDate,
//                 id_supplier: formData.supplierId,
//                 status_pesanan: formData.status
//             })
//             .eq('id', orderId);

//         if (headerError) throw headerError;

//         if (formData.status == "diterima") {
//             if (formData.brokenQty && formData.receivedQty) {
//                 // Convert to numbers in case they're strings
//                 const receivedQty = Number(formData.receivedQty);
//                 const brokenQty = Number(formData.brokenQty);
                
//                 if (isNaN(receivedQty) || isNaN(brokenQty)) {
//                     throw new Error('Received quantity and broken quantity must be numbers');
//                 }

//                 const new_qty = receivedQty - brokenQty;

//                 await updateVariantStock(formData.variantId, new_qty, 'pembelian')
        
//         //         try {
//         //             // First get current stock
//         //             const { data: currentProduct, error: fetchError } = await supabase
//         //                 .from('produk_varian')
//         //                 .select('jumlah_stok')
//         //                 .eq('id', formData.variantId)
//         //                 .single();
                    
//         //             if (fetchError) throw fetchError;
//         //             if (!currentProduct) throw new Error('Product variant not found');
                    
//         //             // Calculate new stock (current + received - broken)
//         //             const currentStock = currentProduct.jumlah_stok || 0;
//         //             const newStock = currentStock + receivedQty - brokenQty;
                    
//         //             // Update stock
//         //             const { error: updateError } = await supabase
//         //                 .from('produk_varian')
//         //                 .update({
//         //                     jumlah_stok: newStock
//         //                 })
//         //                 .eq('id', formData.variantId);
                    
//         //             if (updateError) throw updateError;
                    
//         //             // Also update the received/broken quantities in the order items
//         //             // You might want to add this part as well
//         //         }
//         //         catch (error) {
//         //             console.error('Update "jumlah_stok" error:', error);
//         //             showToast('Gagal memperbarui data jumlah stok: ' + error.message, 'error');
//         //             throw error; // Re-throw to prevent marking the order as "diterima"
//         //         }
//             } else {
//                 throw new Error('Received quantity and broken quantity are required when status is "diterima"');
//             }
//         }
            
//         // 2. Get current items to compare
//         const { data: currentItems, error: itemsError } = await supabase
//             .from('item_pesanan_pembelian')
//             .select('id, id_varian')
//             .eq('id_beli', orderId);

//         if (itemsError) throw itemsError;

//         // 3. Process item updates
//         const updates = [];
//         const newItems = [];
        
//         formData.items.forEach(item => {
//             if (item.rowId) {
//                 updates.push({
//                     id: item.rowId,
//                     id_varian: item.variantId,
//                     qty_dipesan: item.quantity,
//                     qty_diterima: item.
//                 });
//             } else {
//                 newItems.push({
//                     id_beli: orderId,
//                     id_varian: item.variantId,
//                     qty_dipesan: item.quantity
//                     // qty_diterima: null
//                 });
//             }
//         });

//         // 4. Execute updates
//         if (updates.length > 0) {
//             const { error: updateError } = await supabase
//                 .from('item_pesanan_pembelian')
//                 .upsert(updates);
            
//             if (updateError) throw updateError;
//         }
        
//         if (newItems.length > 0) {
//             const { error: insertError } = await supabase
//                 .from('item_pesanan_pembelian')
//                 .insert(newItems);
            
//             if (insertError) throw insertError;
//         }

//         showToast('Pesanan berhasil diperbarui', 'success');
//         await renderOngoingOrders();
//     } catch (error) {
//         console.error('Update order error:', error);
//         showToast('Gagal memperbarui pesanan: ' + error.message, 'error');
//     }
// }

async function loadSuppliers() {
    try {
        const supplierSelect = document.getElementById('supplier');
        if (!supplierSelect) {
            console.error('Supplier select element not found!');
            showToast('Elemen supplier tidak ditemukan', 'error');
            return;
        }

        supplierSelect.innerHTML = '<option value="" disabled selected>Memuat supplier...</option>';

        const { data, error } = await supabase
            .from('supplier')
            .select('id, perusahaan, cp');

        if (error) throw error;

        if (!data || data.length === 0) {
            showToast('Tidak ada data supplier', 'warning');
            supplierSelect.innerHTML = '<option value="" disabled selected>Tidak ada supplier</option>';
            return;
        }

        supplierSelect.innerHTML = '<option value="" disabled selected>Pilih Supplier</option>';
        
        data.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.id;
            option.textContent = `${supplier.perusahaan} (Contact Person: ${supplier.cp})`;
            supplierSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading suppliers:', error);
        const supplierSelect = document.getElementById('supplier');
        supplierSelect.innerHTML = '<option value="" disabled selected>Error loading suppliers</option>';
        showToast('Gagal memuat daftar supplier: ' + error.message, 'error');
    }
}


async function renderHistoryTable() {
    const historyTableBody = document.querySelector('#history tbody');
    if (!historyTableBody) return;
    
    try {
        // Fetch completed orders (status = 'selesai')
        const { data: orders, error } = await supabase
            .from('pesanan_pembelian')
            .select(`
                id,
                tanggal_pesan,
                supplier: id_supplier(perusahaan),
                status_pesanan,
                tanggal_diterima,
                lokasi_penerimaan,
                no_surat_jalan,
                tanggal_pembayaran,
                total_dibayarkan,
                alat_pembayaran,
                items: item_pesanan_pembelian(
                    id,
                    produk_varian: id_varian(
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan,
                    qty_diterima
                )
            `)
            .eq('status_pesanan', 'selesai')
            .order('tanggal_pesan', { ascending: false });

        if (error) throw error;

        historyTableBody.innerHTML = '';

        if (orders && orders.length > 0) {
            orders.forEach(order => {
                // Format dates
                const formattedOrderDate = new Date(order.tanggal_pesan).toLocaleDateString('id-ID');
                const formattedReceivedDate = order.tanggal_diterima ? new Date(order.tanggal_diterima).toLocaleDateString('id-ID') : '-';
                const formattedPaymentDate = order.tanggal_pembayaran ? new Date(order.tanggal_pembayaran).toLocaleDateString('id-ID') : '-';
                
                // Calculate total quantities
                const totalOrdered = order.items.reduce((sum, item) => sum + item.qty_dipesan, 0);
                const totalReceived = order.items.reduce((sum, item) => sum + (item.qty_diterima || 0), 0);

                // Create a row for each order
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${formattedOrderDate}</td>
                    <td>${order.supplier.perusahaan}</td>
                    <td>${order.lokasi_penerimaan || '-'}</td>
                    <td>${totalOrdered}</td>
                    <td>${totalReceived}</td>
                    <td>${formattedReceivedDate}</td>
                    <td>${formatCurrency(order.total_dibayarkan)}</td>
                    <td>${formattedPaymentDate}</td>
                    <td>${order.alat_pembayaran || '-'}</td>
                    <td><button class="btn btn-sm btn-outline-primary detail-btn" data-order-id="${order.id}">Detail</button></td>
                `;
                historyTableBody.appendChild(row);
            });

            // Add event listeners to detail buttons
            document.querySelectorAll('.detail-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const orderId = e.target.dataset.orderId;
                    await showOrderDetails(orderId);
                });
            });
        } else {
            historyTableBody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center text-muted">Tidak ada riwayat pesanan</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Error fetching history:', error);
        showToast('Gagal memuat riwayat pesanan', 'error');
    }
}

async function showOrderDetails(orderId) {
    try {
        // Fetch the specific order with its items
        const { data: order, error } = await supabase
            .from('pesanan_pembelian')
            .select(`
                id,
                tanggal_pesan,
                supplier: id_supplier(perusahaan),
                status_pesanan,
                tanggal_diterima,
                lokasi_penerimaan,
                tanggal_pembayaran,
                total_dibayarkan,
                alat_pembayaran,
                items: item_pesanan_pembelian(
                    id,
                    produk_varian: id_varian(
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan,
                    qty_diterima
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;

        // Format dates
        const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('id-ID') : '-';

        // Create and show a modal with the order details
        const modalHtml = `
            <div class="modal fade" id="orderDetailModal" tabindex="-1" aria-labelledby="orderDetailModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="orderDetailModalLabel">Detail Pesanan #${order.id}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p><strong>Tanggal Pesan:</strong> ${formatDate(order.tanggal_pesan)}</p>
                                    <p><strong>Supplier:</strong> ${order.supplier.perusahaan}</p>
                                    <p><strong>Lokasi Penerimaan:</strong> ${order.lokasi_penerimaan || '-'}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Tanggal Diterima:</strong> ${formatDate(order.tanggal_diterima)}</p>
                                    <p><strong>Total Dibayarkan:</strong> ${formatCurrency(order.total_dibayarkan)}</p>
                                    <p><strong>Pembayaran:</strong> ${order.alat_pembayaran || '-'} (${formatDate(order.tanggal_pembayaran)})</p>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>Varian</th>
                                            <th>Dipesan</th>
                                            <th>Diterima</th>
                                            <th>Selisih</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>${item.produk_varian.produk.nama}</td>
                                                <td>${item.produk_varian.varian || '-'}</td>
                                                <td>${item.qty_dipesan}</td>
                                                <td>${item.qty_diterima || 0}</td>
                                                <td>${item.qty_dipesan - (item.qty_diterima || 0)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="2" class="text-end"><strong>Total:</strong></td>
                                            <td><strong>${order.items.reduce((sum, item) => sum + item.qty_dipesan, 0)}</strong></td>
                                            <td><strong>${order.items.reduce((sum, item) => sum + (item.qty_diterima || 0), 0)}</strong></td>
                                            <td><strong>${order.items.reduce((sum, item) => sum + (item.qty_dipesan - (item.qty_diterima || 0)), 0)}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add the modal to the DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
        modal.show();

        // Remove the modal from DOM when hidden
        document.getElementById('orderDetailModal').addEventListener('hidden.bs.modal', () => {
            modalContainer.remove();
        });
    } catch (error) {
        console.error('Error showing order details:', error);
        showToast('Gagal memuat detail pesanan', 'error');
    }
}

// ========== DOMContentLoaded Section ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const pembelianTabs = document.getElementById('pembelianTabs');
    const addDataBtn = document.querySelector('.btn-primary');
    const ongoingTab = document.getElementById('ongoing-tab');
    const historyTab = document.getElementById('history-tab');

    pembelianTabs.addEventListener('click', function(e) {
        if (e.target && e.target.matches('#history-tab')) {
            // Hide the add button when history tab is clicked
            addDataBtn.style.display = 'none';
        } else if (e.target && e.target.matches('#ongoing-tab')) {
            // Show the add button when ongoing tab is clicked
            addDataBtn.style.display = 'inline-block';
        }
    });

    // Initialize the page
    initPage();

    document.getElementById('addProduct').addEventListener('click', addProductRow);

    // Cancel Order (dipesan)
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.cancel-order')) {
            const orderId = e.target.closest('.cancel-order').dataset.orderId;
            if (confirm('Yakin ingin membatalkan pesanan ini?')) {
                const { error } = await supabase
                    .from('pesanan_pembelian')
                    .delete()
                    .eq('id', orderId);
                
                if (!error) {
                    showToast('Pesanan dibatalkan', 'success');
                    renderOngoingOrders();
                }
            }
        }
    });

    // Archive Order (diterima)
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.archive-order')) {
            const orderId = e.target.closest('.archive-order').dataset.orderId;
            if (confirm('Arsipkan pesanan ke riwayat tanpa pembayaran?')) {
                const { error } = await supabase
                    .from('pesanan_pembelian')
                    .update({ 
                        status_pesanan: 'selesai',
                        tanggal_pembayaran: null,
                        total_dibayaran: null,
                        alat_pembayaran: null,
                        tanggal_selesai: new Date().toISOString()
                    })
                    .eq('id', orderId);
                
                if (!error) {
                    showToast('Pesanan diarsipkan', 'success');
                    renderOngoingOrders();
                    renderHistoryTable();
                }
            }
        }
    });

    // Complete Order (dibayar)
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.complete-order')) {
            const button = e.target.closest('.complete-order');
            const orderId = button.dataset.orderId;
            const itemsData = JSON.parse(button.dataset.items || '[]');
            
            try {
                console.log("Items data before processing:", itemsData);
                // Process all items
                for (const item of itemsData) {
                    // Process received items
                    await processEntry({
                        variantId: item.variantId,
                        type: 'pembelian',
                        id: orderId,
                        quantity: item.receivedQty,
                        price: item.price
                    });
                    
                    // Process broken items if any
                    if (item.brokenQty > 0) {
                        await processEntry({
                            variantId: item.variantId,
                            type: 'penyesuaian_keluar',
                            id: orderId,
                            quantity: item.brokenQty,
                            price: 0
                        });
                    }
                }
                
                // Update order status to 'selesai' after processing all items
                const { error } = await supabase
                    .from('pesanan_pembelian')
                    .update({ status_pesanan: 'selesai' })
                    .eq('id', orderId);
                
                if (error) throw error;
                
                showToast('Pesanan berhasil diselesaikan', 'success');
                await renderOngoingOrders();
                
            } catch (error) {
                console.error('Order processing failed:', error);
                showToast('Gagal menyelesaikan pesanan', 'error');
            }
        }
    });

    // Non-async DOM functions
    function initPage() {
        renderOngoingOrders();
        
        if (addDataBtn) {
            addDataBtn.addEventListener('click', () => openOrderModal('add'));
        }
        
        if (ongoingTab) ongoingTab.addEventListener('click', renderOngoingOrders);
        if (historyTab) historyTab.addEventListener('click', renderHistoryTable);
    }
});

const modal = document.getElementById('orderModal');

modal.addEventListener('hidden.bs.modal', () => {
  modal.setAttribute('aria-hidden', 'true'); // Only hide AFTER modal closes
});

window.updateOrderStatus = updateOrderStatus;