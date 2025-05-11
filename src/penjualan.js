import supabase from './db_conn.js';
import { processEntry, updateVariantStock } from './import.js';

// ========== Global Variables ==========
let saleModal;

// ========== Utility Functions ==========
function getStatusColor(status) {
    const colorMap = {
        'dipesan': 'secondary',
        'diambil': 'success',
        'dibayar': 'primary',
        'selesai': 'success'
    };
    return colorMap[status] || 'secondary';
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// ========== Data Fetching Functions ==========
async function loadBakuls() {
    try {
        const { data, error } = await supabase
            .from('bakul')
            .select('id, nama')
            .order('nama', { ascending: true });
            
        if (error) throw error;
        
        const select = document.getElementById('customer');
        select.innerHTML = '<option value="" disabled selected>Pilih Bakul</option>';
        
        data.forEach(bakul => {
            const option = document.createElement('option');
            option.value = bakul.id;
            option.textContent = `${bakul.nama}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading bakuls:', error);
        showToast('Gagal memuat daftar bakul', 'error');
    }
}

// ========== Form Handling Functions ==========
async function openSaleModal(mode = 'add', orderId = null) {
    // Initialize modal if needed
    if (!saleModal) {
        saleModal = new bootstrap.Modal(document.getElementById('saleModal'));
        await loadBakuls();
    }

    // Reset form completely before setting up
    document.getElementById('saleForm').reset();
    document.querySelector('#productsTable tbody').innerHTML = '';
    document.getElementById('statusFieldsContainer').innerHTML = '';

    setupModalEvents();

    // Get references to UI elements
    const statusToggleContainer = document.querySelector('.status-toggle-container');
    const statusBadge = document.getElementById('saleStatusBadge');
    const modalTitle = document.getElementById('saleModalLabel');

    // Set mode and UI state
    const modalElement = document.getElementById('saleModal');
    modalElement.dataset.mode = mode;

    if (mode === 'edit' && orderId) {
        // Edit mode - show toggle, hide badge
        if (statusToggleContainer) statusToggleContainer.style.display = 'block';
        if (statusBadge) statusBadge.style.display = 'none';
        modalTitle.textContent = 'Edit Pesanan Penjualan';

        await populateSaleForm(orderId);
        
        // Initialize the status toggle with the loaded status
        // const currentStatus = document.getElementById('saleStatusBadge').textContent;
        // setupStatusToggle(currentStatus);

        document.getElementById('saveSaleBtn').textContent = 'Update';
    } else {
        // Add mode - hide toggle, show badge
        if (statusToggleContainer) statusToggleContainer.style.display = 'none';
        if (statusBadge) {
            statusBadge.style.display = 'inline-block';
            statusBadge.textContent = 'draft';
            statusBadge.className = `badge bg-${getStatusColor('dipesan')}`;
        }
        modalTitle.textContent = 'Tambah Pesanan Penjualan';
        
        // Ensure table structure is reset to 'dipesan' state
        const tableHeader = document.querySelector('#productsTable thead tr');
        tableHeader.innerHTML = `
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th>Harga</th>
            <th>Subtotal</th>
            <th></th>
        `;
        
        document.getElementById('saveSaleBtn').textContent = 'Simpan';
    }

    saleModal.show();
}

function setupModalEvents() {
    document.getElementById('addProductBtn').addEventListener('click', addItemRow);
    document.getElementById('saveSaleBtn').addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent form submission if needed
        try {
            await saveSale(); // Now errors will be catchable
        } catch (err) {
            console.error("Save failed:", err);
            showToast("Gagal menyimpan: " + err.message, "error");
        }
    });

    // Add supplier change listener
    document.getElementById('customer').addEventListener('change', async function() {
        // Clear existing product rows
        // document.querySelector('#productsTable tbody').innerHTML = '';
        
        // If we're in edit mode, don't auto-add products
        const mode = document.getElementById('saleModal').dataset.mode;
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
    
    document.getElementById('saleModal').addEventListener('hidden.bs.modal', () => {
        document.getElementById('saleForm').reset();
        document.querySelector('#productsTable tbody').innerHTML = '';
        document.getElementById('statusFieldsContainer').innerHTML = '';
        
        // Reset table header structure
        const tableHeader = document.querySelector('#productsTable thead tr');
        tableHeader.innerHTML = `
            <th>Produk</th>
            <th>Varian</th>
            <th>Qty. Dipesan</th>
            <th>Harga</th>
            <th>Subtotal</th>
            <th></th>
        `;
    });
}

function setupStatusToggle(currentStatus, saleData) {
    const statusBadge = document.getElementById('saleStatusBadge');
    const toggleButtons = document.querySelectorAll('#saleStatusToggle .btn-status');
    
    // Store current field values before any updates
    const currentFieldValues = {};
    if (currentStatus === 'diambil') {
        currentFieldValues.tanggalAmbil = document.getElementById('tanggalAmbil')?.value || '';
        currentFieldValues.pihakPengambil = document.getElementById('pihakPengambil')?.value || '';
    } else if (currentStatus === 'dibayar') {
        currentFieldValues.tanggalPembayaran = document.getElementById('tanggalPembayaran')?.value || '';
        currentFieldValues.totalDibayarkan = document.getElementById('totalDibayarkan')?.value || '';
        currentFieldValues.alatPembayaran = document.getElementById('alatPembayaran')?.value || '';
    }

    // Set the correct toggle button as active
    toggleButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.disabled = false;
        
        if (btn.dataset.status === currentStatus) {
            btn.classList.add('active');
        }
    });
    
    // Disable previous status buttons
    const statusOrder = ['dipesan', 'diambil', 'dibayar', 'selesai'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    for (let i = 0; i < currentIndex; i++) {
        const prevStatus = statusOrder[i];
        document.querySelector(`#saleStatusToggle .btn-status[data-status="${prevStatus}"]`)
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
            if (newStatus === 'diambil') {
                fieldValues.tanggalAmbil = document.getElementById('tanggalAmbil')?.value || 
                    (saleData?.tanggal_diambil || '');
                fieldValues.pihakPengambil = document.getElementById('pihakPengambil')?.value || 
                    (saleData?.pihak_pengambil || '');
            } else if (newStatus === 'dibayar') {
                fieldValues.tanggalPembayaran = document.getElementById('tanggalPembayaran')?.value || 
                    (saleData?.tanggal_dibayar || '');
                fieldValues.totalDibayarkan = document.getElementById('totalDibayarkan')?.value || 
                    (saleData?.total_dibayarkan || '');
                fieldValues.alatPembayaran = document.getElementById('alatPembayaran')?.value || 
                    (saleData?.alat_pembayaran || '');
            }
            
            // Update form with preserved values
            updateFormForStatus(newStatus, fieldValues);

            toggleButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

async function populateSaleForm(saleId) {
    try {
        const { data: sale, error } = await supabase
            .from('pesanan_penjualan')
            .select(`
                id,
                tanggal_pesan,
                id_bakul,
                status_pesanan,
                tanggal_dibutuhkan,
                tanggal_diambil,
                pihak_pengambil,
                tanggal_dibayar,
                total_dibayarkan,
                alat_pembayaran,
                items:item_pesanan_penjualan(
                    id,
                    produk_varian:id_varian(
                        id,
                        varian,
                        produk:id_produk(id, nama)
                    ),
                    harga_jual,
                    qty_dipesan
                )
            `)
            .eq('id', saleId)
            .single();

        if (error) throw error;

        // Store order data in modal for reference
        const modal = document.getElementById('saleModal');
        modal.dataset.saleId = saleId;
        modal.dataset.currentStatus = sale.status_pesanan;

        // Populate basic fields
        document.getElementById('saleDate').value = sale.tanggal_pesan;
        document.getElementById('needDate').value = sale.tanggal_dibutuhkan;
        document.getElementById('customer').value = sale.id_bakul;
        
        // Clear and prepare form
        const tableBody = document.querySelector('#productsTable tbody');
        tableBody.innerHTML = '';
        document.getElementById('statusFieldsContainer').innerHTML = '';
        
        // Create all item rows first
        sale.items.forEach(item => {
            const row = createItemRow(item, sale.status_pesanan);
            tableBody.appendChild(row);
        });

        calculateTotal();

        // Add status-specific fields with current data
        await addStatusSpecificFields(sale);
        
        // THEN setup the status toggle which will update form fields
        setupStatusToggle(sale.status_pesanan, sale);

        // Control UI elements based on status
        document.getElementById('addProductBtn').style.display = 
            sale.status_pesanan === 'dipesan' ? 'block' : 'none';

        const printGroup = document.getElementById('printButtonGroup');
        printGroup.style.display = sale.status_pesanan === 'dibayar' ? 'flex' : 'none';

        // Show the modal
        saleModal.show();

    } catch (error) {
        console.error('Failed to load order:', error);
        showToast('Gagal memuat data pesanan', 'error');
        throw error;
    }
}

async function updateFormForStatus(newStatus, fieldValues = {}) {
    // 1. Update row editability
    document.querySelectorAll('#productsTable tbody tr').forEach(row => {
        const qtyInput = row.querySelector('.quantity');
        const variantSelect = row.querySelector('.variant-select');
        const priceInput = row.querySelector('.price');
        const deleteBtn = row.querySelector('.remove-item');
        
        qtyInput.readOnly = (newStatus !== 'dipesan');
        variantSelect.disabled = (newStatus !== 'dipesan');
        priceInput.readOnly = ['dibayar', 'selesai'].includes(newStatus);
        if (deleteBtn) deleteBtn.disabled = ['diambil', 'dibayar', 'selesai'].includes(newStatus);
    });
    
    // 2. Control Add Item button visibility
    document.getElementById('addProductBtn').style.display = 
        newStatus === 'dipesan' ? 'block' : 'none';

    // 3. Update status-specific fields
    const container = document.getElementById('statusFieldsContainer');
    
    if (newStatus === 'diambil') {
        const takers = await getTakerList();

        let options = '<option value="" disabled selected>Pilih pihak pengambil</option>';
        takers.forEach(taker => {
            const selected = fieldValues.pihakPengambil === taker.value ? 'selected' : '';
            const displayText = taker.value.charAt(0).toUpperCase() + taker.value.slice(1);
            options += `<option value="${taker.value}" ${selected}>${displayText}</option>`;
        });

        container.innerHTML = `
            <div class="row mt-3">
                <div class="col-md-6">
                    <label class="form-label">Tanggal Diambil</label>
                    <input type="date" class="form-control" id="tanggalAmbil" 
                           value="${fieldValues.tanggalAmbil || ''}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Pihak Pengambil</label>
                    <select class="form-select" id="pihakPengambil">
                        ${options}
                    </select>
                </div>
            </div>
        `;
    } else if (newStatus === 'dibayar') {
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

    // 4. Show print options if status is 'dibayar'
    const printGroup = document.getElementById('printButtonGroup');
    printGroup.style.display = newStatus === 'dibayar' ? 'flex' : 'none';
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

async function getTakerList() {
    try {
        const { data, error } = await supabase.rpc('get_enum_values', { 
            enum_name: 'pihak_pengambil' 
        });
        
        if (error) {
            console.error('Error loading locations:', error);
            return [
                { value: 'sendiri' },
                { value: 'perwakilan' }
            ]; // Fallback values
        }
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        return [
            { value: 'sendiri' },
            { value: 'perwakilan' }
        ]; // Fallback values
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

async function addItemRow(productId = null, variantId = null) {
    const tbody = document.querySelector('#productsTable tbody');
    
    try {
        // Fetch all products
        const { data: products, error: productsError } = await supabase
            .from('produk')
            .select('id, nama')
            .order('nama', { ascending: true });

        if (productsError) throw productsError;

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
                <input type="number" class="form-control price" min="0" step="100" value="0">
            </td>
            <td class="subtotal">${formatCurrency(0)}</td>
            <td>
                <button class="btn btn-danger btn-sm remove-product">×</button>
            </td>
        `;

        tbody.appendChild(row);

        // Set up product and variant handling
        const productSelect = row.querySelector('.product-select');
        const variantSelect = row.querySelector('.variant-select');
        
        productSelect.addEventListener('change', async function() {
            await loadVariants(productSelect, variantSelect, row, variantId);
        });

        variantSelect.addEventListener('change', function() {
            const selectedOption = variantSelect.options[variantSelect.selectedIndex];
            const price = selectedOption.getAttribute('data-price') || 0;
            console.log("price: ", price)
            row.querySelector('.price').value = price;
            row.querySelector('.price').dispatchEvent(new Event('input')); // to recalculate subtotal
        });        

        // If product is pre-selected, trigger the change event to load variants
        if (productId) {
            // Set initial state before loading
            variantSelect.innerHTML = '<option value="" selected disabled>Memuat varian...</option>';
            variantSelect.disabled = true;
            
            // Trigger the load
            productSelect.dispatchEvent(new Event('change'));
        }

        setupRowCalculations(row);

    } catch (error) {
        console.error('Error adding product row:', error);
        showToast('Gagal menambahkan produk', 'error');
    }
}

function createItemRow(item, currentStatus) {
    const row = document.createElement('tr');
    row.dataset.itemId = item.id;

    const disableRemove = ['diambil', 'dibayar', 'selesai'].includes(currentStatus);
    
    row.innerHTML = `
        <td>
            <select class="form-select product-select" disabled>
                <option value="${item.produk_varian.produk.id}" selected>
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
        <td>
            <input type="number" class="form-control price" 
                   value="${item.harga_jual || 0}" min="0"
                   ${['dibayar', 'selesai'].includes(currentStatus) ? 'readonly' : ''}>
        </td>
        <td class="subtotal">${formatCurrency((item.harga_jual || 0) * item.qty_dipesan)}</td>
        <td>
            <button class="btn btn-danger btn-sm remove-item" 
                    ${disableRemove ? 'disabled' : ''}>×</button>
        </td>
    `;

    // If in edit mode (status = 'dipesan'), load all variants for this product
    if (currentStatus === 'dipesan') {
        const productSelect = row.querySelector('.product-select');
        const variantSelect = row.querySelector('.variant-select');
        
        // Set up product change handler
        productSelect.addEventListener('change', async function() {
            await loadVariants(productSelect, variantSelect, row);
        });

        // Immediately load variants for the current product
        setTimeout(async () => {
            await loadVariants(productSelect, variantSelect, row, item.produk_varian.id);
        }, 0);
    }

    setupRowCalculations(row);
    return row;
}

function setupRowCalculations(row) {
    // Calculate subtotal for the row and update total
    const calculateSubtotal = () => {
        const price = parseFloat(row.querySelector('.price').value) || 0;
        const quantity = parseInt(row.querySelector('.quantity').value) || 0;
        const subtotal = price * quantity;
        
        // Update the subtotal display (either textContent or value depending on your row type)
        const subtotalElement = row.querySelector('.subtotal');
        if (subtotalElement.tagName === 'TD') {
            subtotalElement.textContent = formatCurrency(subtotal);
        } else {
            subtotalElement.value = subtotal;
        }
        
        calculateTotal();
    };

    // Set up event listeners
    row.querySelector('.price').addEventListener('input', calculateSubtotal);
    row.querySelector('.quantity').addEventListener('input', calculateSubtotal);
    
    // Initial calculation
    calculateSubtotal();

    // Remove row button
    const removeBtn = row.querySelector('.remove-product, .remove-item');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            row.remove();
            calculateTotal();
        });
    }
}

function calculateTotal() {
    let total = 0;
    document.querySelectorAll('#productsTable tbody tr').forEach(row => {
        const subtotalText = row.querySelector('.subtotal').textContent;
        const subtotal = parseFloat(subtotalText.replace(/[^0-9]/g, '')) || 0;
        total += subtotal;
    });
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

async function addStatusSpecificFields(sale) {
    const container = document.getElementById('statusFieldsContainer');
    container.innerHTML = '';
    calculateTotal();
    
    if (sale.status_pesanan === 'diambil') {
        const takers = await getTakerList();
        
        let takerOpts = '<option value="" disabled selected>Pilih pengambil</option>';
        takers.forEach(taker => {
            const isSelected = sale.pihak_pengambil === taker.value ? 'selected' : '';
            const displayText = taker.value.charAt(0).toUpperCase() + taker.value.slice(1);
            takerOpts += `<option value="${taker.value}" ${isSelected}>${displayText}</option>`;
        });

        container.innerHTML = `
            <div class="row mt-3">
                <div class="col-md-6">
                    <label class="form-label">Tanggal Diambil</label>
                    <input type="date" class="form-control" id="tanggalAmbil" 
                           value="${sale.tanggal_diambil || ''}">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Pihak Pengambil</label>
                    <select class="form-select" id="pihakPengambil">
                        ${takerOpts}
                    </select>
                </div>
            </div>
        `;
    }
    else if (sale.status_pesanan === 'dibayar') {
        const paymentMethods = await getPaymentMethodsEnum();
        
        let paymentOptions = '<option value="" disabled selected>Pilih metode pembayaran</option>';
        paymentMethods.forEach(method => {
            const isSelected = sale.alat_pembayaran === method.value ? 'selected' : '';
            const displayText = method.value.charAt(0).toUpperCase() + method.value.slice(1);
            paymentOptions += `<option value="${method.value}" ${isSelected}>${displayText}</option>`;
        });

        container.innerHTML = `
            <div class="row mt-3">
                <div class="col-md-4">
                    <label class="form-label">Tanggal Pembayaran</label>
                    <input type="date" class="form-control" id="tanggalPembayaran" 
                           value="${sale.tanggal_pembayaran || ''}">
                </div>
                <div class="col-md-4">
                    <label class="form-label">Total Dibayarkan</label>
                    <input type="number" class="form-control" id="totalDibayarkan" 
                           value="${sale.total_dibayarkan || ''}">
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

function collectFormData() {
    const mode = document.getElementById('saleModal').dataset.mode;
    const currentStatus = document.getElementById('saleStatusBadge')?.textContent || 'dipesan';
    const data = {
        orderDate: document.getElementById('saleDate').value,
        needDate: document.getElementById('needDate').value,
        bakulID: document.getElementById('customer').value,
        status: currentStatus,
        items: Array.from(document.querySelectorAll('#productsTable tbody tr')).map(row => ({
            variantId: row.querySelector('.variant-select').value, // Changed from productId
            quantity: parseInt(row.querySelector('.quantity').value),
            rowId: row.dataset.itemId || null,
            price: row.querySelector('.price').value
        }))
    };

    if (mode === 'edit') {
        // Add data if in diambil status
        if (currentStatus === 'diambil') {
            data.tanggalAmbil = document.getElementById('tanggalAmbil').value;
            data.pihakPengambil = document.getElementById('pihakPengambil').value;
        }
        // Add payment data if in dibayar status
        if (currentStatus === 'dibayar') {
            data.tanggalPembayaran = document.getElementById('tanggalPembayaran').value;
            data.totalDibayarkan = document.getElementById('totalDibayarkan').value;
            data.alatPembayaran = document.getElementById('alatPembayaran').value;
        }
    }

    return data;
}

// ========== CRUD Operations ==========
async function saveSale() {
    const mode = document.getElementById('saleModal').dataset.mode;
    
    try {
        if (mode === 'edit') {
            await updateSale();
        } else {
            await createSale();
        }
      
        saleModal.hide();
        await renderOngoingSales();
    } catch (error) {
      console.error('Save failed:', error);
      showToast('Gagal menyimpan pesanan', 'error');
    }
}

async function createSale() {
    const formData = collectFormData();
    
    try {
        // 1. Create order header
        const { data: newOrder, error } = await supabase
            .from('pesanan_penjualan')
            .insert({
                tanggal_pesan: formData.orderDate,
                tanggal_dibutuhkan: formData.needDate,
                id_bakul: formData.bakulID,
                status_pesanan: 'dipesan'
            })
            .select()
            .single();

        if (error) throw error;
  
        // 2. Add items with variant IDs
        const { error: itemsError } = await supabase
            .from('item_pesanan_penjualan')
            .insert(formData.items.map(item => ({
                id_jual: newOrder.id,
                id_varian: item.variantId,
                qty_dipesan: item.quantity,
                harga_jual: item.price
            })));

        if (itemsError) throw itemsError;

        for (const item of formData.items) {
            if (item.quantity === undefined) {
                throw new Error('All items must have quantity when making an order');
            }

            const qty = Number(item.quantity) || 0;

            if (isNaN(qty)) {
                throw new Error('Quantity must be a valid number');
            }

            // Update variant stock directly
            const newStock = await updateVariantStock(item.variantId, qty, 'penjualan');
            if (newStock === null) {
                throw new Error(`Failed to update stock for variant ${item.variantId}`);
            }
        }
  
        showToast('Pesanan baru berhasil dibuat', 'success');
        await renderOngoingSales();
    } catch (error) {
        console.error('Create order error:', error);
        showToast('Gagal membuat pesanan: ' + error.message, 'error');
    }
}

async function updateSale() {
    const saleId = document.getElementById('saleModal').dataset.saleId;
    const formData = collectFormData();
    console.log(formData.status);
    
    try {
        // 1. Prepare order update data
        const saleUpdateData = {
            tanggal_pesan: formData.orderDate,
            id_bakul: formData.bakulID,
            status_pesanan: formData.status
        };
        // Add additional fields for 'diambil' status
        if (formData.status === 'diambil') {
            saleUpdateData.tanggal_diambil = formData.tanggalAmbil;
            saleUpdateData.pihak_pengambil = formData.pihakPengambil;
        }
        // Add payment details for 'dibayar' status
        else if (formData.status === 'dibayar') {
            saleUpdateData.tanggal_dibayar = formData.tanggalPembayaran;
            saleUpdateData.total_dibayarkan = formData.totalDibayarkan;
            saleUpdateData.alat_pembayaran = formData.alatPembayaran;
        }
        // Update order header
        const { error: headerError } = await supabase
            .from('pesanan_penjualan')
            .update(saleUpdateData)
            .eq('id', saleId);

        if (headerError) throw headerError;

        // 3. Process item updates
        const updates = [];
        const newItems = [];
        
        formData.items.forEach(item => {
            const itemData = {
                id_jual: saleId, 
                id_varian: item.variantId,
                qty_dipesan: item.quantity,
                harga_jual: item.price
            };

            if (item.rowId) {
                updates.push({ ...itemData, id: item.rowId });
            } else {
                newItems.push({ ...itemData, id_jual: saleId });
            }
        });

        // 4. Execute updates
        if (updates.length > 0) {
            const { error: updateError } = await supabase
                .from('item_pesanan_penjualan')
                .upsert(updates);
            
            if (updateError) throw updateError;
        }
        
        if (newItems.length > 0) {
            const { error: insertError } = await supabase
                .from('item_pesanan_penjualan')
                .insert(newItems);
            
            if (insertError) throw insertError;
        }

        showToast('Pesanan berhasil diperbarui', 'success');
        await renderOngoingSales();
    } catch (error) {
        console.error('Update order error:', error);
        showToast('Gagal memperbarui pesanan: ' + error.message, 'error');
    }
}

async function deleteSale(saleId) {
    if (!confirm('Apakah Anda yakin ingin menghapus penjualan ini?')) return;
    
    try {
        // First delete items
        await supabase
            .from('item_pesanan_penjualan')
            .delete()
            .eq('id_jual', saleId);

        // Then delete sale
        await supabase
            .from('pesanan_penjualan')
            .delete()
            .eq('id', saleId);

        // await fetchSales();
        showToast('Penjualan berhasil dihapus', 'success');
    } catch (error) {
        console.error('Error deleting sale:', error);
        showToast('Gagal menghapus penjualan', 'error');
    }
}

// display
async function renderOngoingSales() {
    try {
        const container = document.getElementById('ongoingOrdersContainer');
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border spinner-border-sm" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                Memuat pesanan...
            </div>
        `;

        const { data: sales, error } = await supabase
            .from('pesanan_penjualan')
            .select(`
                id,
                tanggal_pesan,
                tanggal_dibutuhkan,
                status_persiapan,
                status_pesanan,
                bakul:id_bakul(nama),
                items:item_pesanan_penjualan(
                    produk_varian(id, varian, produk:id_produk(nama)),
                    harga_jual,
                    qty_dipesan
                )
            `)
            .neq('status_pesanan', 'selesai')
            .order('tanggal_pesan', { ascending: false });

        if (error) throw error;

        container.innerHTML = '';

        if (sales.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center text-muted">
                    Tidak ada pesanan aktif
                </div>
            `;
            return;
        }

        // Calculate total for each sale
        const salesWithTotal = sales.map(sale => ({
            ...sale,
            total: sale.items.reduce((sum, item) => sum + (item.harga_jual * item.qty_dipesan), 0)
        }));

        // Create a row for the cards
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3';

        salesWithTotal.forEach(sale => {
            rowDiv.appendChild(createSaleCard(sale));
        });

        container.appendChild(rowDiv);

    } catch (error) {
        console.error('Error loading ongoing sales:', error);
        showToast('Gagal memuat pesanan aktif', 'error');
        document.getElementById('ongoingOrdersContainer').innerHTML = `
            <div class="col-12 text-center text-danger">
                Gagal memuat data
            </div>
        `;
    }
}

function createSaleCard(sale) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-6 col-lg-4 mb-3';
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card h-100';
    cardDiv.dataset.saleId = sale.id;
    
    // Card header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
    
    const title = document.createElement('h5');
    title.className = 'mb-0';
    title.textContent = `#${sale.id}`;

    const statusDiv = document.createElement('div');
    statusDiv.className = 'd-flex align-items-center gap-2';
    
    const status = document.createElement('span');
    status.className = `badge bg-${getStatusColor(sale.status_pesanan)}`;
    status.textContent = sale.status_pesanan;

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline-secondary edit-order';
    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openSaleModal('edit', sale.id);
    });
    
    headerDiv.appendChild(title);
    statusDiv.appendChild(status);
    statusDiv.appendChild(editBtn);
    headerDiv.appendChild(statusDiv);
    
    // Card body
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'card-body';
    
    const customerInfo = document.createElement('p');
    customerInfo.className = 'mb-1';
    customerInfo.innerHTML = `<strong>Bakul:</strong> ${sale.bakul?.nama || '-'}`;
    
    const orderDate = document.createElement('p');
    orderDate.className = 'mb-1';
    orderDate.innerHTML = `<strong>Tanggal Pesan:</strong> ${formatDate(sale.tanggal_pesan)}`;
    
    const neededDate = document.createElement('p');
    neededDate.className = 'mb-1';
    neededDate.innerHTML = `<strong>Dibutuhkan:</strong> ${formatDate(sale.tanggal_dibutuhkan)}`;
    
    // const prepStatus = document.createElement('p');
    // prepStatus.className = 'mb-1';
    // prepStatus.innerHTML = `<strong>Persiapan:</strong> ${sale.status_persiapan ? 'Siap' : 'Belum siap'}`;
    
    const totalAmount = document.createElement('p');
    totalAmount.className = 'mb-1';
    totalAmount.innerHTML = `<strong>Total:</strong> ${formatCurrency(sale.total || 0)}`;
    
    // Items list
    const itemsTitle = document.createElement('p');
    itemsTitle.className = 'mb-1 mt-2 fw-bold';
    itemsTitle.textContent = 'Items:';
    
    const itemsList = document.createElement('ul');
    itemsList.className = 'list-unstyled mb-0';
    
    sale.items.forEach(item => {
        const li = document.createElement('li');
        li.className = 'd-flex justify-content-between';
        li.innerHTML = `
            <span>${item.produk_varian?.produk?.nama || 'Produk'} - ${item.produk_varian?.varian || ''}</span>
            <span>${item.qty_dipesan} × ${formatCurrency(item.harga_jual)}</span>
        `;
        itemsList.appendChild(li);
    });
    
    bodyDiv.appendChild(customerInfo);
    bodyDiv.appendChild(orderDate);
    bodyDiv.appendChild(neededDate);
    // bodyDiv.appendChild(prepStatus);
    bodyDiv.appendChild(totalAmount);
    bodyDiv.appendChild(itemsTitle);
    bodyDiv.appendChild(itemsList);
    
    // Card footer with action buttons
    const footerDiv = document.createElement('div');
    footerDiv.className = 'card-footer bg-transparent border-top-0';

    // ===== Preparation Checkbox =====
    if (sale.status_pesanan === 'dipesan') {
        const prepCheckboxDiv = document.createElement('div');
        prepCheckboxDiv.className = 'form-check mb-2';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input preparation-checkbox';
        checkbox.id = `prep-${sale.id}`;
        checkbox.checked = sale.status_persiapan || false;
        
        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `prep-${sale.id}`;
        label.textContent = 'Persiapan Selesai';
        
        // Call our standalone function
        setupPreparationCheckbox(checkbox, sale);
        
        prepCheckboxDiv.appendChild(checkbox);
        prepCheckboxDiv.appendChild(label);
        footerDiv.appendChild(prepCheckboxDiv);
    }
    
    const btnGroup = document.createElement('div');
    btnGroup.className = 'd-flex justify-content-between';
    
    const actionBtn = document.createElement('button');
    actionBtn.className = 'btn btn-sm';
    
    // Status-specific actions
    if (sale.status_pesanan === 'dipesan') {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-sm btn-outline-danger ms-2 cancel-order';
        cancelBtn.innerHTML = '<i class="bi bi-x-circle"></i> Batalkan';
        cancelBtn.dataset.orderId = sale.id;
        footerDiv.appendChild(cancelBtn);
    } 
    else if (sale.status_pesanan === 'diambil') {
        const archiveBtn = document.createElement('button');
        archiveBtn.className = 'btn btn-sm btn-outline-warning ms-2 archive-order';
        archiveBtn.innerHTML = '<i class="bi bi-archive"></i> Arsipkan';
        archiveBtn.dataset.orderId = sale.id;
        footerDiv.appendChild(archiveBtn);
    } 
    else if (sale.status_pesanan === 'dibayar') {
        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn btn-sm btn-dark ms-2 complete-order';
        completeBtn.innerHTML = '<i class="bi bi-check-circle"></i> Selesaikan';
        completeBtn.dataset.orderId = sale.id;

        // Store all items data as JSON in the button
        const itemsData = sale.items.map(item => ({
            variantId: item.produk_varian?.id || '',
            qty: item.qty_dipesan || 0,
            price: item.harga_jual || 0
        }));
        
        completeBtn.dataset.items = JSON.stringify(itemsData);
        footerDiv.appendChild(completeBtn);
    }
    
    btnGroup.appendChild(actionBtn);
    
    footerDiv.appendChild(btnGroup);
    
    cardDiv.appendChild(headerDiv);
    cardDiv.appendChild(bodyDiv);
    cardDiv.appendChild(footerDiv);
    colDiv.appendChild(cardDiv);
    
    return colDiv;
}

function setupPreparationCheckbox(checkbox, sale) {
    checkbox.addEventListener('change', async function() {
        const newValue = this.checked;
        const action = newValue ? 'menandai' : 'membatalkan tanda';
        const confirmed = confirm(`Yakin ingin ${action} persiapan selesai untuk pesanan #${sale.id}?`);
        
        if (!confirmed) {
            this.checked = !newValue; // Revert the change
            return;
        }

        // Disable during processing
        this.disabled = true;
        
        try {
            const { error } = await supabase
                .from('pesanan_penjualan')
                .update({ status_persiapan: newValue })
                .eq('id', sale.id);
            
            if (error) throw error;
            
            showToast(`Status persiapan ${newValue ? 'diselesaikan' : 'dibatalkan'}`, 'success');
            
            // Update any related UI elements
            const statusElement = this.closest('.card').querySelector('.prep-status');
            if (statusElement) {
                statusElement.textContent = `Persiapan: ${newValue ? 'Siap' : 'Belum siap'}`;
            }
        } catch (error) {
            console.error('Update error:', error);
            this.checked = !newValue; // Revert on error
            showToast('Gagal memperbarui status', 'error');
        } finally {
            this.disabled = false;
        }
    });
}

// history
async function renderHistoryTable() {
    const historyTableBody = document.querySelector('#history tbody');
    if (!historyTableBody) return;
    
    try {
        // Fetch completed orders (status = 'selesai')
        const { data: orders, error } = await supabase
            .from('pesanan_penjualan')
            .select(`
                id,
                tanggal_pesan,
                bakul: id_bakul(nama),
                status_pesanan,
                tanggal_diambil,
                pihak_pengambil,
                tanggal_dibayar,
                total_dibayarkan,
                alat_pembayaran,
                items: item_pesanan_penjualan(
                    id,
                    produk_varian: id_varian(
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan
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
                const formattedTakenDate = order.tanggal_diambil ? new Date(order.tanggal_diambil).toLocaleDateString('id-ID') : '-';
                const formattedPaymentDate = order.tanggal_dibayar ? new Date(order.tanggal_dibayar).toLocaleDateString('id-ID') : '-';
                
                // Calculate total quantities
                const totalOrdered = order.items.reduce((sum, item) => sum + item.qty_dipesan, 0);

                // Create a row for each order
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${formattedOrderDate}</td>
                    <td>${order.bakul.nama}</td>
                    <td>${formattedTakenDate}</td>
                    <td>${order.pihak_pengambil || '-'}</td>
                    <td>${totalOrdered}</td>
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
            .from('pesanan_penjualan')
            .select(`
                id,
                tanggal_pesan,
                bakul: id_bakul(nama),
                status_pesanan,
                tanggal_diambil,
                pihak_pengambil,
                tanggal_dibayar,
                total_dibayarkan,
                alat_pembayaran,
                items: item_pesanan_penjualan(
                    id,
                    produk_varian: id_varian(
                        varian,
                        produk:id_produk(nama)
                    ),
                    qty_dipesan
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
                                    <p><strong>Supplier:</strong> ${order.bakul.nama}</p>
                                    <p><strong>Lokasi Penerimaan:</strong> ${order.pihak_pengambil || '-'}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Tanggal Diterima:</strong> ${formatDate(order.tanggal_diambil)}</p>
                                    <p><strong>Total Dibayarkan:</strong> ${formatCurrency(order.total_dibayarkan)}</p>
                                    <p><strong>Pembayaran:</strong> ${order.alat_pembayaran || '-'} (${formatDate(order.tanggal_dibayar)})</p>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th>Varian</th>
                                            <th>Kuantitas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>${item.produk_varian.produk.nama}</td>
                                                <td>${item.produk_varian.varian || '-'}</td>
                                                <td>${item.qty_dipesan}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colspan="2" class="text-end"><strong>Total:</strong></td>
                                            <td><strong>${order.items.reduce((sum, item) => sum + item.qty_dipesan, 0)}</strong></td>
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

// Receipt
function setupPrintButton() {
    const printBtn = document.getElementById('printReceiptBtn');
    const pdfBtn = document.getElementById('exportPdfBtn');
    const printGroup = document.getElementById('printButtonGroup');
    
    printBtn?.addEventListener('click', printReceipt);
    pdfBtn?.addEventListener('click', exportToPdf);
    
    // Observe status changes to show/hide print options
    document.getElementById('saleStatusToggle')?.addEventListener('click', (e) => {
        if (e.target.closest('.btn-status')) {
            const status = e.target.closest('.btn-status').dataset.status;
            printGroup.style.display = status === 'dibayar' ? 'flex' : 'none';
        }
    });
}

// Update the printReceipt function to handle status visibility
async function printReceipt() {
    const orderId = document.getElementById('saleModal').dataset.saleId;
    if (!orderId) {
        showToast('Tidak ada pesanan yang dipilih', 'error');
        return;
    }

    try {
        const order = await fetchOrderData(orderId);
        const receiptHtml = generateReceiptHtml(order);
        printReceiptHtml(receiptHtml);
    } catch (error) {
        console.error('Error printing receipt:', error);
        showToast('Gagal mencetak struk', 'error');
    }
}

// PDF Export Function
async function exportToPdf() {
    const orderId = document.getElementById('saleModal').dataset.saleId;
    if (!orderId) {
        showToast('Tidak ada pesanan yang dipilih', 'error');
        return;
    }

    const pdfBtn = document.getElementById('exportPdfBtn');
    const originalHtml = pdfBtn.innerHTML;
    
    try {
        // Show loading state
        pdfBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Memproses...';
        pdfBtn.disabled = true;

        // Fetch order data
        const order = await fetchOrderData(orderId);
        const receiptHtml = generateReceiptHtml(order);

        // Create PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 297] // Standard receipt size
        });

        await doc.html(receiptHtml, {
            html2canvas: {
                scale: 0.3, // Adjusted scale for better fit
                logging: false,
                useCORS: true,
                letterRendering: true,
                width: 80 // Explicit width
            },
            callback: function(doc) {
                doc.save(`Struk_${orderId}.pdf`);
                pdfBtn.innerHTML = originalHtml;
                pdfBtn.disabled = false;
            },
            x: 0,
            y: 0,
            width: 80, // Match the physical receipt width
            windowWidth: 800 // Higher window width for better quality
        });
        
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('Gagal membuat PDF: ' + error.message, 'error');
        pdfBtn.innerHTML = originalHtml;
        pdfBtn.disabled = false;
    }
}

function printReceiptHtml(htmlContent) {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Write the HTML content to the new window
    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Struk</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @media print {
                    body { 
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        width: 80mm;
                        margin: 0;
                        padding: 0;
                    }
                    @page {
                        size: 80mm 297mm;
                        margin: 0;
                    }
                    .no-print { display: none !important; }
                    button { display: none !important; }
                }
                .receipt-container {
                    width: 100%;
                    padding: 10px;
                    box-sizing: border-box;
                }
                .receipt-header, .receipt-footer {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .receipt-items {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 10px 0;
                }
                .receipt-items th {
                    border-bottom: 1px dashed #000;
                    padding: 5px 0;
                    text-align: left;
                }
                .receipt-items td {
                    padding: 3px 0;
                }
                .text-right {
                    text-align: right;
                }
                .text-center {
                    text-align: center;
                }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="receipt-container">
                ${htmlContent}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 300);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function generateReceiptHtml(order) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return `
    <div style="width:72mm; padding:4mm; font-family:Arial; font-size:10px;">
        <!-- Header -->
        <div style="text-align:center; margin-bottom:5px;">
            <div style="font-weight:bold; font-size:12px;">Gunarto</div>
            <div>Pasar Klewer, Surakarta</div>
            <div>Telp: 08123456789</div>
        </div>
        
        <hr style="border-top:1px dashed #000; margin:5px 0;">
        
        <!-- Order Info -->
        ${generateMetadataRow('No. Pesanan:', order.id)}
        ${generateMetadataRow('Tanggal:', formatDate(order.tanggal_pesan))}
        ${generateMetadataRow('Pembeli:', order.bakul?.nama || '-')}
        
        <hr style="border-top:1px dashed #000; margin:5px 0;">
        
        <!-- Items Table -->
        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr>
                    <th style="text-align:left; padding:2px 0; border-bottom:1px dashed #000;">Item</th>
                    <th style="text-align:right; padding:2px 0; border-bottom:1px dashed #000;">Qty</th>
                    <th style="text-align:right; padding:2px 0; border-bottom:1px dashed #000;">Harga</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td style="padding:2px 0;">${item.produk_varian?.produk?.nama || 'Produk'} ${item.produk_varian?.varian || ''}</td>
                        <td style="text-align:right; padding:2px 0;">${item.qty_dipesan}</td>
                        <td style="text-align:right; padding:2px 0;">${formatCurrency(item.harga_jual)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <hr style="border-top:1px dashed #000; margin:5px 0;">
        
        <!-- Totals -->
        ${generateMetadataRow('TOTAL:', formatCurrency(order.total_dibayarkan), true)}
        ${generateMetadataRow('Pembayaran:', order.alat_pembayaran || 'Tunai')}
        
        <!-- Footer -->
        <div style="text-align:center; margin-top:10px; font-size:9px;">
            <div>Terima kasih telah berbelanja</div>
            <div>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</div>
        </div>
    </div>
    `;
}

function generateMetadataRow(label, value, bold = false) {
    return `
    <div style="display:flex; justify-content:space-between; margin:3px 0; ${bold ? 'font-weight:bold;' : ''}">
        <span>${label}</span>
        <span>${value}</span>
    </div>
    `;
}

// Helper function to fetch order data
async function fetchOrderData(orderId) {
    const { data: order, error } = await supabase
        .from('pesanan_penjualan')
        .select(`
            id,
            tanggal_pesan,
            tanggal_dibayar,
            bakul: id_bakul(nama, no_hp),
            total_dibayarkan,
            alat_pembayaran,
            items: item_pesanan_penjualan(
                produk_varian: id_varian(
                    varian,
                    produk: id_produk(nama)
                ),
                harga_jual,
                qty_dipesan
            )
        `)
        .eq('id', orderId)
        .single();

    if (error) throw error;
    return order;
}

// ========== Initialization ==========
document.addEventListener('DOMContentLoaded', async () => {
    saleModal = new bootstrap.Modal(document.getElementById('saleModal'));
    const tabs = document.getElementById('penjualanTabs');
    const addDataBtn = document.getElementById('addSaleBtn');
    const ongoingTab = document.getElementById('ongoing-tab');
    const historyTab = document.getElementById('history-tab');
    

    // Load initial data
    await loadBakuls();
    // await renderOngoingSales();
    initPage();

    document.getElementById('addProductBtn').addEventListener('click', addItemRow);

    // Cancel Order (dipesan)
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.cancel-order')) {
            const orderId = e.target.closest('.cancel-order').dataset.orderId;
            if (confirm('Yakin ingin membatalkan pesanan ini?')) {
                const { error } = await supabase
                    .from('pesanan_penjualan')
                    .delete()
                    .eq('id', orderId);
                
                if (!error) {
                    showToast('Pesanan dibatalkan', 'success');
                    renderOngoingSales();
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
                // Process received items
                for (const item of itemsData) {
                    await processEntry({
                        variantId: item.variantId,
                        type: 'penjualan',
                        id: orderId,
                        quantity: item.quantity,
                        price: item.price
                    });
                }

                // Update order status to 'selesai' after processing all items
                const { error } = await supabase
                    .from('pesanan_pembelian')
                    .update({ status_pesanan: 'selesai' })
                    .eq('id', orderId);
                
                if (error) throw error;
                
                showToast('Pesanan berhasil diselesaikan', 'success');
                await renderOngoingSales();
                
            } catch (error) {
                console.error('Order processing failed:', error);
                showToast('Gagal menyelesaikan pesanan', 'error');
            }
        }
    });

    setupPrintButton();
    
    // Add jsPDF library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.body.appendChild(script);
    
    const script2 = document.createElement('script');
    script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.body.appendChild(script2);

    function initPage() {
        renderOngoingSales();
        
        if (addDataBtn) {
            addDataBtn.addEventListener('click', () => openSaleModal('add'));
        }
        
        if (ongoingTab) ongoingTab.addEventListener('click', renderOngoingSales);
        if (historyTab) historyTab.addEventListener('click', renderHistoryTable);
    }
});

// // ========== Global Functions ==========
// window.editSale = async function(saleId) {
//     await openSaleModal('edit', saleId);
// };

window.deleteSale = deleteSale;
window.showSaleDetail = function(saleId) {
    // Implementation for showing sale details
    console.log('Showing details for sale:', saleId);
};