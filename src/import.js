import supabase from './db_conn.js';

// Function to update the stock in the variant table
async function updateVariantStock(variantId, quantity, tipeRiwayat) {
    const { data: variant, error: fetchError } = await supabase
        .from('produk_varian')
        .select('jumlah_stok')
        .eq('id', variantId)
        .single();

    if (fetchError) {
        console.error('Error fetching variant stock:', fetchError);
        return null;
    }

    let newStock = variant.jumlah_stok;
    if (tipeRiwayat === 'pembelian' || tipeRiwayat === 'penyesuaian_masuk') {
        newStock += quantity;
    } else if (tipeRiwayat === 'penjualan' || tipeRiwayat === 'penyesuaian_keluar') {
        newStock -= quantity;
    }

    const { error: updateError } = await supabase
        .from('produk_varian')
        .update({ 
            jumlah_stok: newStock
        })
        .eq('id', variantId);

    if (updateError) {
        console.error('Error updating variant stock:', updateError);
        return null;
    }

    return newStock;
}

// Updated calculateHPP function (same as before)
async function calculateHPP(variantId, saleQty) {
    const { data: purchases } = await supabase
      .from('riwayat_stok')
      .select('id, qty, stok_sisa, harga, tanggal')
      .eq('id_varian', variantId)
      .eq('tipe_riwayat', 'pembelian')
      .gt('stok_sisa', 0)
      .order('tanggal', { ascending: true })
      .limit(100);
  
    let remainingQty = saleQty;
    let totalCost = 0;
    const updates = [];
    const consumptionRecords = [];
  
    for (const purchase of purchases) {
      if (remainingQty <= 0) break;
      
      const usedQty = Math.min(remainingQty, purchase.stok_sisa);
      totalCost += usedQty * purchase.harga;
      remainingQty -= usedQty;
  
      updates.push({
        id: purchase.id,
        newRemaining: purchase.stok_sisa - usedQty
      });
      
      consumptionRecords.push({
        usedQty: usedQty,
        purchasePrice: purchase.harga,
        purchaseDate: purchase.tanggal
      });
    }
  
    if (updates.length > 0) {
      await supabase.rpc('batch_update_remaining', {
        updates: updates.map(u => ({
          id: u.id,
          remaining: u.newRemaining
        }))
      });
    }
  
    return {
      averageHpp: totalCost / saleQty,
      consumptionRecords,
      hasPartialConsumption: consumptionRecords.length > 1
    };
}

async function processEntry({
    variantId = null, 
    type = null, 
    id = null, 
    quantity = null,
    price = null,
    date = new Date().toISOString()
}) {
    try {
        if (!variantId || !type || quantity === null) {
            throw new Error('Missing required parameters');
        }

        // 1. FIRST get current stock (BEFORE any updates)
        const { data: variant, error: fetchError } = await supabase
            .from('produk_varian')
            .select('jumlah_stok')
            .eq('id', variantId)
            .single();
        if (fetchError) throw fetchError;
        
        const originalStock = variant.jumlah_stok;

        // 2. Handle incoming stock (purchases/adjustments in)
        if (type === 'pembelian' || type === 'penyesuaian_masuk') {
            let newStock = originalStock;
            if (type === 'penyesuaian_masuk') {
                newStock = await updateVariantStock(variantId, quantity, type);
                if (newStock === null) throw new Error('Failed to update variant stock');
            }
            
            // Single record for incoming stock
            const { data, error } = await supabase.from('riwayat_stok').insert([{
                id_varian: variantId,
                tipe_riwayat: type,
                qty: quantity,
                stok_sisa: quantity, // Full quantity available
                saldo: newStock,
                harga: price,
                hpp: null,
                tanggal: date,
                id_referensi: id,
            }]).select();

            if (error) throw error;
            return { success: true, newStock, records: data, isMultiRecord: false };
        }

        // 3. Handle outgoing stock (sales/adjustments out)
        if (type === 'penjualan' || type === 'penyesuaian_keluar') {
            const { averageHpp, consumptionRecords, hasPartialConsumption } = 
                await calculateHPP(variantId, quantity);
            
            if (hasPartialConsumption) {
                const recordsToInsert = [];
                let runningStock = originalStock; // Use ORIGINAL stock here
                
                // Create records with intermediate balances
                for (const record of consumptionRecords) {
                    runningStock -= record.usedQty;
                    recordsToInsert.push({
                        id_varian: variantId,
                        tipe_riwayat: type,
                        qty: record.usedQty,
                        stok_sisa: null,
                        saldo: runningStock,
                        harga: price,
                        hpp: record.purchasePrice,
                        tanggal: date,
                        id_referensi: id
                    });
                }

                // Update physical stock ONLY AFTER creating records
                const newStock = await updateVariantStock(variantId, quantity, type);
                if (newStock === null) throw new Error('Failed to update variant stock');

                const { error } = await supabase
                    .from('riwayat_stok')
                    .insert(recordsToInsert);
                if (error) throw error;

                return { 
                    success: true, 
                    newStock, 
                    records: recordsToInsert,
                    isMultiRecord: true 
                };
            }
            
            // Single record case for outgoing stock
            const newStock = await updateVariantStock(variantId, quantity, type);
            if (newStock === null) throw new Error('Failed to update variant stock');

            const { data, error } = await supabase.from('riwayat_stok').insert([{
                id_varian: variantId,
                tipe_riwayat: type,
                qty: quantity,
                stok_sisa: null,
                saldo: newStock,
                harga: price,
                hpp: averageHpp,
                tanggal: date,
                id_referensi: id,
            }]).select();

            if (error) throw error;
            return { success: true, newStock, records: data, isMultiRecord: false };
        }

        throw new Error('Invalid transaction type');
    } catch (error) {
        console.error('Error in processEntry:', error);
        throw error;
    }
}

// Function to check for unpaid overdue orders
async function checkUnpaidOrders() {
    try {
        const today = new Date();
        const oneMonthAgo = new Date(today);
        const threeMonthsAgo = new Date(today);

        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const { data: orders, error } = await supabase
            .from('pesanan_pembelian')
            .select(`
                id,
                tanggal_diterima,
                supplier: id_supplier(perusahaan, cp)
            `)
            .eq('status_pesanan', 'diterima')
            .lt('tanggal_diterima', oneMonthAgo.toISOString().split('T')[0]) // Older than 1 month

        if (error) throw error;

        // Add overdue range category
        const annotatedOrders = (orders || []).map(order => {
            const diterimaDate = new Date(order.tanggal_diterima);
            let overdueType = '1_bulan';

            if (diterimaDate < threeMonthsAgo) {
                overdueType = '3_bulan';
            }

            return { ...order, overdueType };
        });

        return annotatedOrders;
    } catch (error) {
        console.error('Error checking unpaid orders:', error);
        return [];
    }
}

async function displayUnpaidNotice() {
    const rowContainer = document.getElementById('unpaidBannerRow');
    const container = document.getElementById('unpaidBanner');

    if (!rowContainer || !container) {
        console.warn('[WARN] unpaidBanner or unpaidBannerRow container not found.');
        return;
    }

    container.innerHTML = ''; // clear old banner
    rowContainer.style.display = 'none'; // hide by default

    const unpaidOrders = await checkUnpaidOrders();

    if (unpaidOrders.length === 0) return; // keep row hidden

    // Show the row only if there are unpaid orders
    rowContainer.style.display = 'flex'; // or 'block' depending on your layout

    // create banner as before
    const banner = document.createElement('div');
    banner.className = 'unpaid-notice-banner alert alert-danger d-flex justify-content-between align-items-center mb-0';

    let message = '';

    const count1Month = unpaidOrders.filter(o => o.overdueType === '1_bulan').length;
    const count3Month = unpaidOrders.filter(o => o.overdueType === '3_bulan').length;

    if (count3Month > 0) {
        message += `⚠️ ${count3Month} pesanan sudah lewat 3 bulan dan belum dibayar. `;
    }
    if (count1Month > 0) {
        message += `${count1Month} pesanan sudah lewat 1 bulan dan belum dibayar. `;
    }

    message += `<a href="/pembelian.html" style="color: #a30000; text-decoration: underline;">Lihat daftar pesanan</a>`;

    banner.innerHTML = `
        <div class="container-fluid d-flex justify-content-between align-items-center py-2">
            <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <span>${message}</span>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    container.appendChild(banner);

    banner.querySelector('.btn-close').addEventListener('click', () => {
        banner.remove();
        // If no banner remains, hide the row container again
        if (!container.hasChildNodes()) {
            rowContainer.style.display = 'none';
        }
    });
}

export {
    processEntry,
    calculateHPP,
    updateVariantStock,
    displayUnpaidNotice
};