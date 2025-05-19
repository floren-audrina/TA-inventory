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

// async function calculateHPP(variantId, saleQty) {
//     // Get only purchases with remaining stock (FIFO order)
//     const { data: purchases } = await supabase
//       .from('riwayat_stok')
//       .select('id, qty, stok_sisa, harga')
//       .eq('id_varian', variantId)
//       .eq('tipe_riwayat', 'pembelian')
//       .gt('stok_sisa', 0)  // Only consider purchases with stock left
//       .order('tanggal', { ascending: true }) // Oldest first
//       .limit(100); // Safety limit
  
//     let remainingQty = saleQty;
//     let totalCost = 0;
//     const updates = [];
  
//     for (const purchase of purchases) {
//       if (remainingQty <= 0) break;
      
//       const usedQty = Math.min(remainingQty, purchase.stok_sisa);
//       totalCost = purchase.harga;
//       remainingQty -= usedQty;
  
//       updates.push({
//         id: purchase.id,
//         newRemaining: purchase.stok_sisa - usedQty
//       });
//     }
  
//     // Batch update remaining stock
//     if (updates.length > 0) {
//       await supabase.rpc('batch_update_remaining', {
//         updates: updates.map(u => ({
//           id: u.id,
//           remaining: u.newRemaining
//         }))
//       });
//     }
  
//     return totalCost;
// }

// async function processEntry({
//     variantId = null, 
//     type = null, 
//     id = null, 
//     quantity = null,
//     price = null,
//     date = new Date().toISOString()
// }) {
//     try {
//         // Validate required parameters
//         if (!variantId || !type || quantity === null) {
//             throw new Error('Missing required parameters');
//         }

//         // Update stock in variant table
//         const newStock = await updateVariantStock(variantId, quantity, type);
//         if (newStock === null) {
//             throw new Error('Failed to update variant stock');
//         }

//         // Determine stok_sisa based on transaction type
//         let stok_sisa = null;
//         if (type === 'pembelian' || type === 'penyesuaian_masuk') {
//             // For incoming stock, set remaining = full quantity
//             stok_sisa = quantity;
//         }

//         // Calculate HPP only for outgoing transactions
//         let hpp = null;
//         if (type === 'penjualan' || type === 'penyesuaian_keluar') {
//             hpp = await calculateHPP(variantId, quantity);
//             if (hpp === null) {
//                 console.warn('HPP calculation failed, proceeding without HPP');
//             }
//         }

//         // Insert stock history record
//         const { data, error } = await supabase
//             .from('riwayat_stok')
//             .insert([{
//                 id_varian: variantId,
//                 tipe_riwayat: type,
//                 qty: quantity,
//                 stok_sisa: stok_sisa, // Will be null for outgoing transactions
//                 saldo: newStock,
//                 harga: price,
//                 hpp: hpp,
//                 tanggal: date,
//                 id_referensi: id
//             }])
//             .select(); // Return the inserted record

//         if (error) throw error;

//         return { 
//             success: true, 
//             newStock,
//             record: data[0] // Return the created record
//         };
//     } catch (error) {
//         console.error('Error in processEntry:', error);
//         throw error;
//     }
// }

export {
    processEntry,
    calculateHPP,
    updateVariantStock
};