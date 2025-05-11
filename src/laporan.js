import supabase from './db_conn.js';
const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const jenisSelect = document.getElementById('jenis');
    const periodeSelect = document.getElementById('periode');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const reportContent = document.getElementById('report-content');
    const generateText = document.getElementById('generateText');
    const generateSpinner = document.getElementById('generateSpinner');

    // Report templates with dynamic data fetching
    const reportData = {
    "Laba Rugi": {
        fetchData: async (year) => {
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            
            // 1. Fetch SALES (Pendapatan) from pesanan_penjualan
            const { data: sales, error: salesError } = await supabase
            .from('pesanan_penjualan')
            .select('total_dibayarkan')
            .gte('tanggal_pesan', startDate)
            .lte('tanggal_pesan', endDate);
            
            if (salesError) throw salesError;
            
            // 2. Fetch COGS (HPP) from riwayat_stok (for sales transactions)
            const { data: cogsData, error: cogsError } = await supabase
            .from('riwayat_stok')
            .select('hpp, qty')
            .eq('tipe_riwayat', 'penjualan') // Only sales transactions
            .gte('tanggal', startDate)
            .lte('tanggal', endDate);
            
            if (cogsError) throw cogsError;
            
            // Calculate TOTAL REVENUE (Pendapatan)
            const totalRevenue = sales.reduce((sum, item) => sum + (item.total_dibayarkan || 0), 0);
            
            // Calculate TOTAL COGS (HPP * Quantity Sold)
            const totalCOGS = cogsData.reduce((sum, item) => sum + (item.hpp * item.qty || 0), 0);
            
            // Calculate Profits
            const grossProfit = totalRevenue - totalCOGS;
            const operatingExpenses = grossProfit * 0.3; // Assuming 30% operating expenses
            const netProfit = grossProfit - operatingExpenses;
            
            return {
            totalRevenue,
            totalCOGS,
            grossProfit,
            operatingExpenses,
            netProfit
            };
        },
        template: (data, year) => `
            <h4 class="report-header">Laporan Laba Rugi Tahun ${year}</h4>
            <table class="table table-bordered">
            <thead class="table-light">
                <tr>
                <th>Keterangan</th>
                <th>Jumlah (Rp)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                <td>Pendapatan</td>
                <td class="text-end">${formatCurrency(data.totalRevenue)}</td>
                </tr>
                <tr>
                <td>Harga Pokok Penjualan (HPP)</td>
                <td class="text-end">${formatCurrency(data.totalCOGS)}</td>
                </tr>
                <tr class="table-active">
                <td><strong>Laba Kotor</strong></td>
                <td class="text-end"><strong>${formatCurrency(data.grossProfit)}</strong></td>
                </tr>
                <tr>
                <td>Biaya Operasional</td>
                <td class="text-end">${formatCurrency(data.operatingExpenses)}</td>
                </tr>
                <tr class="table-active">
                <td><strong>Laba Bersih</strong></td>
                <td class="text-end"><strong>${formatCurrency(data.netProfit)}</strong></td>
                </tr>
            </tbody>
            </table>
        `
        },
    "Pembelian": {
        fetchData: async (year) => {
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            
            // First fetch the purchase orders
            const { data: orders, error: ordersError } = await supabase
                .from('pesanan_pembelian')
                .select(`
                    id,
                    tanggal_pesan,
                    total_dibayarkan,
                    supplier:id_supplier(perusahaan,cp)
                `)
                .gte('tanggal_pesan', startDate)
                .lte('tanggal_pesan', endDate)
                .order('tanggal_pesan', { ascending: true });
            
            if (ordersError) throw ordersError;
            
            // Then fetch the items for each order
            const { data: items, error: itemsError } = await supabase
                .from('item_pesanan_pembelian')
                .select('id_beli, qty_dipesan')
                .in('id_beli', orders.map(order => order.id));
            
            if (itemsError) throw itemsError;
            
            // Calculate total items per order
            const itemsPerOrder = items.reduce((acc, item) => {
                acc[item.id_beli] = (acc[item.id_beli] || 0) + item.qty_dipesan;
                return acc;
            }, {});
            
            // Combine the data
            return orders.map(order => ({
                ...order,
                total_items: itemsPerOrder[order.id] || 0
            }));
        },
        template: (data, year) => {
            const total = data.reduce((sum, item) => sum + (item.total_dibayarkan || 0), 0);
            const totalItems = data.reduce((sum, item) => sum + (item.total_items || 0), 0);
            
            return `
                <h4 class="report-header">Laporan Pembelian Tahun ${year}</h4>
                <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                    <th>No</th>
                    <th>Tanggal Pesan</th>
                    <th>ID Pesanan</th>
                    <th>Supplier</th>
                    <th>Total Items</th>
                    <th>Total Dibayarkan (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${formatDate(item.tanggal_pesan)}</td>
                        <td>PO-${item.id.toString().padStart(4, '0')}</td>
                        <td>${item.supplier?.perusahaan || '-'} (${item.supplier?.cp || '-'})</td>
                        <td class="text-end">${item.total_items}</td>
                        <td class="text-end">${formatCurrency(item.total_dibayarkan)}</td>
                    </tr>
                    `).join('')}
                    <tr class="table-active">
                    <td colspan="4"><strong>Total</strong></td>
                    <td class="text-end"><strong>${totalItems}</strong></td>
                    <td class="text-end"><strong>${formatCurrency(total)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `;
        }
    },
    "Penjualan": {
        fetchData: async (year) => {
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            
            // First fetch sales orders
            const { data: orders, error: ordersError } = await supabase
                .from('pesanan_penjualan')
                .select(`
                    id,
                    tanggal_pesan,
                    total_dibayarkan,
                    bakul:id_bakul(nama)
                `)
                .gte('tanggal_pesan', startDate)
                .lte('tanggal_pesan', endDate)
                .order('tanggal_pesan', { ascending: true });
            
            if (ordersError) throw ordersError;
            
            // Then fetch items for each order
            const { data: items, error: itemsError } = await supabase
                .from('item_pesanan_penjualan')
                .select('id_jual, qty_dipesan')
                .in('id_jual', orders.map(order => order.id));
            
            if (itemsError) throw itemsError;
            
            // Calculate total items per order
            const itemsPerOrder = items.reduce((acc, item) => {
                acc[item.id_jual] = (acc[item.id_jual] || 0) + item.qty_dipesan;
                return acc;
            }, {});
            
            // Combine the data
            return orders.map(order => ({
                ...order,
                total_items: itemsPerOrder[order.id] || 0
            }));
        },
        template: (data, year) => {
            const total = data.reduce((sum, item) => sum + (item.total_dibayarkan || 0), 0);
            const totalItems = data.reduce((sum, item) => sum + (item.total_items || 0), 0);
            
            return `
                <h4 class="report-header">Laporan Penjualan Tahun ${year}</h4>
                <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                    <th>No</th>
                    <th>Tanggal Pesan</th>
                    <th>ID Pesanan</th>
                    <th>Pelanggan</th>
                    <th>Total Items</th>
                    <th>Total Dibayarkan (Rp)</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((item, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${formatDate(item.tanggal_pesan)}</td>
                        <td>SO-${item.id.toString().padStart(4, '0')}</td>
                        <td>${item.bakul?.nama || 'Walk-in'}</td>
                        <td class="text-end">${item.total_items}</td>
                        <td class="text-end">${formatCurrency(item.total_dibayarkan)}</td>
                    </tr>
                    `).join('')}
                    <tr class="table-active">
                    <td colspan="4"><strong>Total</strong></td>
                    <td class="text-end"><strong>${totalItems}</strong></td>
                    <td class="text-end"><strong>${formatCurrency(total)}</strong></td>
                    </tr>
                </tbody>
                </table>
            `;
        }
    },
    "Kartu Stok": {
        fetchData: async (year) => {
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;

            // 1. Fetch stock history
            const { data, error } = await supabase
                .from('riwayat_stok')
                .select(`
                    tanggal,
                    tipe_riwayat,
                    qty,
                    saldo,
                    hpp,
                    varian:id_varian(id, varian, produk:id_produk(nama))
                `)
                .gte('tanggal', startDate)
                .lte('tanggal', endDate)
                .order('tanggal', { ascending: true });

            if (error) throw error;

            // 2. Group by variant and calculate
            const variantsMap = new Map();

            data.forEach(record => {
                const varianId = record.varian.id;
                
                if (!variantsMap.has(varianId)) {
                    variantsMap.set(varianId, {
                        id: varianId,
                        name: `${record.varian.produk.nama} - ${record.varian.varian}`,
                        history: [],
                        purchaseHistory: [] // Track purchases separately for FIFO
                    });
                }
                
                const variant = variantsMap.get(varianId);
                variant.history.push(record);
                
                // Store purchases for FIFO HPP calculation
                if (record.tipe_riwayat === 'penjualan') {
                    variant.purchaseHistory.push({
                        qty: record.qty,
                        hpp: record.hpp,
                        tanggal: record.tanggal
                    });
                }
            });

            // 3. Process each variant
            return Array.from(variantsMap.values()).map(variant => {
                const history = variant.history.sort((a, b) => 
                    new Date(a.tanggal) - new Date(b.tanggal));

                // A. Opening Balance (handles all transaction types)
                let openingBalance;
                if (history.length > 0) {
                    const firstRecord = history[0];
                    openingBalance = ['purchase', 'penyesuaian_masuk'].includes(firstRecord.tipe_riwayat)
                        ? firstRecord.saldo - firstRecord.qty  // Subtract for inbound
                        : firstRecord.saldo + firstRecord.qty; // Add for outbound
                } else {
                    openingBalance = 0;
                }

                // B. Transactions
                const purchases = history
                    .filter(item => item.tipe_riwayat === 'pembelian')
                    .reduce((sum, item) => sum + item.qty, 0);

                const sales = history
                    .filter(item => item.tipe_riwayat === 'penjualan')
                    .reduce((sum, item) => sum + item.qty, 0);

                const adjustmentsIn = history
                    .filter(item => item.tipe_riwayat === 'penyesuaian_masuk')
                    .reduce((sum, item) => sum + item.qty, 0);

                const adjustmentsOut = history
                    .filter(item => item.tipe_riwayat === 'penyesuaian_keluar')
                    .reduce((sum, item) => sum + item.qty, 0);

                // C. Closing Balance
                const closingBalance = history.length > 0 
                    ? history[history.length - 1].saldo 
                    : openingBalance;

                // D. HPP Calculation (FIFO-compatible approach)
                let hpp;
                if (variant.purchaseHistory.length > 0) {
                    // Option 1: FIFO Unit Cost (latest purchase)
                    hpp = variant.purchaseHistory[variant.purchaseHistory.length - 1].hpp;
                    
                    // Option 2: Weighted Average (uncomment if preferred)
                    // const totalHppValue = variant.purchaseHistory.reduce((sum, p) => sum + (p.hpp * p.qty), 0);
                    // const totalQty = variant.purchaseHistory.reduce((sum, p) => sum + p.qty, 0);
                    // hpp = totalQty > 0 ? totalHppValue / totalQty : 0;
                } else {
                    hpp = 0;
                }

                return {
                    id: variant.id,
                    name: variant.name,
                    initialStock: openingBalance,
                    purchases,
                    sales,
                    adjustmentsIn,
                    adjustmentsOut,
                    finalStock: closingBalance,
                    hpp: hpp
                };
            });
        },
        template: (data, year) => `
            <h4 class="report-header">Laporan Kartu Stok Tahun ${year}</h4>
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th rowspan="2">Kode</th>
                        <th rowspan="2">Nama Barang</th>
                        <th rowspan="2" class="text-end">Stok Awal</th>
                        <th colspan="2" class="text-center">Stok Masuk</th>
                        <th colspan="2" class="text-center">Stok Keluar</th>
                        <th rowspan="2" class="text-end">Stok Akhir</th>
                        <th rowspan="2" class="text-end">HPP</th>
                    </tr>
                    <tr>
                        <!-- Subheaders for merged columns -->
                        <th class="text-end">Pembelian</th>
                        <th class="text-end">Penyesuaian</th>
                        <th class="text-end">Penjualan</th>
                        <th class="text-end">Penyesuaian</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td>VAR${item.id.toString().padStart(4, '0')}</td>
                            <td>${item.name}</td>
                            <td class="text-end">${item.initialStock}</td>
                            <td class="text-end">${item.purchases}</td>
                            <td class="text-end">${item.adjustmentsIn}</td>
                            <td class="text-end">${item.sales}</td>
                            <td class="text-end">${item.adjustmentsOut}</td>
                            <td class="text-end">${item.finalStock}</td>
                            <td class="text-end">${formatCurrency(item.hpp)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
    },
    "Stock Opname": {
        fetchData: async (year) => {
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            
            const { data: logs, error } = await supabase
                .from('log_opname')
                .select(`
                    id,
                    tanggal,
                    status_log,
                    item_opname(
                        id,
                        id_varian,
                        stok,
                        status_item_log,
                        varian:id_varian(
                            varian,
                            produk:id_produk(nama),
                            jumlah_stok
                        )
                    )
                `)
                .gte('tanggal', startDate)
                .lte('tanggal', endDate)
                .order('tanggal', { ascending: false });
            
            if (error) throw error;

            return {
                logs
            };
        },
        template: (data, year) => {
            return `
            <div class="stock-opname-report">
                <h4 class="report-header">Laporan Stock Opname Tahun ${year}</h4>
                
                <table class="table table-bordered table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>ID Log</th>
                            <th>Tanggal</th>
                            <th>Status Log</th>
                            <th>ID Item</th>
                            <th>Status Item</th>
                            <th>Stok Sistem</th>
                            <th>Stok Fisik</th>
                            <th>Selisih</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.logs.map(log => `
                            ${log.item_opname.map((item, index) => `
                                <tr class="${log.status_log === 'final' ? 'table-success' : 'table-warning'}">
                                    ${index === 0 ? `
                                        <td rowspan="${log.item_opname.length}">${log.id}</td>
                                        <td rowspan="${log.item_opname.length}">${new Date(log.tanggal).toLocaleDateString('id-ID')}</td>
                                        <td rowspan="${log.item_opname.length}">
                                            ${log.status_log}
                                        </td>
                                    ` : ''}
                                    <td>VAR${item.id_varian.toString().padStart(4, '0')}</td>
                                    <td>
                                        ${item.status_item_log}
                                    </td>
                                    <td class="text-end">${item.varian?.jumlah_stok || 0}</td>
                                    <td class="text-end">${item.stok}</td>
                                    <td class="text-end ${item.stok - (item.varian?.jumlah_stok || 0) > 0 ? 'text-success' : item.stok - (item.varian?.jumlah_stok || 0) < 0 ? 'text-danger' : ''}">
                                        ${item.stok - (item.varian?.jumlah_stok || 0) > 0 ? '+' : ''}${item.stok - (item.varian?.jumlah_stok || 0)}
                                    </td>
                                </tr>
                            `).join('')}
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <style>
                .table {
                    border-collapse: collapse;
                    width: 100%;
                }
                .table th, .table td {
                    border: 1px solid #dee2e6;
                    padding: 8px;
                    vertical-align: middle;
                }
                .table th {
                    background-color: #f8f9fa;
                    text-align: left;
                }
                .table-success { background-color: rgba(40, 167, 69, 0.05); }
                .table-warning { background-color: rgba(255, 193, 7, 0.05); }
                .text-success { color: #28a745 !important; }
                .text-danger { color: #dc3545 !important; }
                .text-end { text-align: right; }
            </style>
            `;
        }
    }
    };

    // Helper functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount).replace('Rp', 'Rp ');
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID');
    }

    // Generate report function
    async function generateReport() {
        const jenis = jenisSelect.value;
        const year = periodeSelect.value;
        
        try {
            // Show loading state
            generateText.textContent = 'Memuat...';
            generateSpinner.style.display = 'inline-block';
            generateBtn.disabled = true;
            
            // Fetch data
            const data = await reportData[jenis].fetchData(year);
            
            // Generate HTML
            const content = reportData[jenis].template(data, year);
            reportContent.innerHTML = content;
        } catch (error) {
            console.error('Error generating report:', error);
            reportContent.innerHTML = `
            <div class="alert alert-danger">
                Gagal memuat laporan: ${error.message}
            </div>
            `;
        } finally {
            // Reset loading state
            generateText.textContent = 'Buat Laporan';
            generateSpinner.style.display = 'none';
            generateBtn.disabled = false;
        }
    }

    // Download PDF function
    // async function downloadPDF() {
    //     const element = document.getElementById("report");
    //     const year = periodeSelect.value;
    //     const jenis = jenisSelect.value;
        
    //     try {
    //         const canvas = await html2canvas(element); // Now using global html2canvas
    //         const imgData = canvas.toDataURL('image/png');
    //         const pdf = new jsPDF('p', 'mm', 'a4'); // jsPDF is from window.jspdf
    //         const imgProps = pdf.getImageProperties(imgData);
    //         const pdfWidth = pdf.internal.pageSize.getWidth();
    //         const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
    //         pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    //         pdf.save(`Laporan_${jenis}_${year}.pdf`);
    //     } 
    //     catch (error) {
    //         console.error('Error generating PDF:', error);
    //         alert('Gagal mengunduh PDF. Silakan coba lagi.');
    //     }
    // }

    async function generatePDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const margin = 20;
        let yPos = 30;
        const year = periodeSelect.value;
        const jenis = jenisSelect.value;
        
        // 1. Letterhead Header
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(40);
        pdf.text('GUNARTO', margin, 15);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text('Pasar Klewer, Surakarta', margin, 20);
        pdf.setDrawColor(150);
        pdf.line(margin, 22, 210 - margin, 22);
        
        // 2. Report Title
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text(`LAPORAN ${jenis.toUpperCase()}`, 105, yPos, {align: 'center'});
        yPos += 8;
        
        pdf.setFontSize(12);
        pdf.text(`TAHUN ${year}`, 105, yPos, {align: 'center'});
        yPos += 15;
        
        // 3. Get report data
        const data = await reportData[jenis].fetchData(year);
        
        // 4. Generate report-specific content
        switch(jenis) {
            case 'Laba Rugi':
                generateProfitLossTable(pdf, data, yPos, margin);
                break;
                
            case 'Pembelian':
                generateTransactionTable(pdf, data, yPos, margin, 'Supplier');
                break;
                
            case 'Penjualan':
                generateTransactionTable(pdf, data, yPos, margin, 'Pelanggan');
                break;
                
            case 'Kartu Stok':
                generateStockCardTable(pdf, data, yPos, margin);
                break;
                
            case 'Stock Opname':
                generateStockOpname(pdf, data, yPos, margin);
                break;
        }
        
        // 5. Add footer to all pages
        addFooter(pdf, margin);
        
        pdf.save(`Laporan_${jenis}_${year}.pdf`);
    }
    
    // ===== REPORT TYPE TEMPLATES ===== //
    
    function generateProfitLossTable(pdf, data, yPos, margin) {
        // Prepare the financial data
        const financialData = [
            ['PENDAPATAN', formatCurrencyPDF(data.totalRevenue)],
            ['Harga Pokok Penjualan (HPP)', formatCurrencyPDF(data.totalCOGS)],
            ['LABA KOTOR', formatCurrencyPDF(data.grossProfit)],
            ['Biaya Operasional', formatCurrencyPDF(data.operatingExpenses)],
            ['LABA BERSIH', formatCurrencyPDF(data.netProfit)]
        ];
    
        // Create the table
        pdf.autoTable({
            head: [['KETERANGAN', 'JUMLAH (Rp)']],
            body: financialData,
            startY: yPos,
            margin: {left: margin, right: margin},
            headStyles: {
                fillColor: [13, 71, 161],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 11
            },
            bodyStyles: {
                textColor: [33, 33, 33],
                fontSize: 10,
                cellPadding: 5
            },
            columnStyles: {
                1: {
                    halign: 'right',
                    cellWidth: 50
                }
            },
            didDrawCell: (data) => {
                // Highlight important rows
                const highlightRows = [0, 2, 4]; // Pendapatan, Laba Kotor, Laba Bersih
                if (highlightRows.includes(data.row.index)) {
                    pdf.setFillColor(227, 242, 253); // Light blue highlight
                    pdf.rect(
                        data.cell.x - 1,
                        data.cell.y - 1,
                        data.cell.width + 2,
                        data.cell.height + 2,
                        'F'
                    );
                    // Redraw text over highlight
                    pdf.setTextColor(0);
                    pdf.text(
                        data.cell.raw,
                        data.cell.x + data.cell.width - 2,
                        data.cell.y + data.cell.height - 5,
                        { align: 'right' }
                    );
                }
                
                // Add thousand separators
                if (data.column.index === 1 && data.cell.raw) {
                    const formatted = formatCurrencyPDF(parseFloat(data.cell.raw.replace(/\./g, '')));
                    data.cell.text = formatted;
                }
            }
        });
    }
    
    function generateTransactionTable(pdf, data, yPos, margin, contactType) {
        const isPurchase = contactType === 'Supplier';
        const prefix = isPurchase ? 'PO' : 'SO';
        const contactLabel = isPurchase ? 'Supplier' : 'Pelanggan';

        const headers = [
            'NO', 
            'TANGGAL', 
            `ID ${prefix}`, 
            contactLabel.toUpperCase(), 
            'TOTAL ITEMS', 
            'TOTAL (Rp)'
        ];
        
        const body = data.map((item, index) => [
            index + 1,
            formatDate(item.tanggal_pesan),
            `${prefix}-${item.id.toString().padStart(4, '0')}`,
            isPurchase 
                ? `${item.supplier?.perusahaan || '-'}\n${item.supplier?.cp || ''}`
                : item.bakul?.nama || 'Walk-in',
            item.total_items || 0,
            formatCurrencyPDF(item.total_dibayarkan)
        ]);
        
        // Add total row
        const totalAmount = data.reduce((sum, item) => sum + (item.total_dibayarkan || 0), 0);
        const totalItems = data.reduce((sum, item) => sum + (item.total_items || 0), 0);
        body.push(['', '', '', 'TOTAL', totalItems, formatCurrencyPDF(totalAmount)]);
        
        pdf.autoTable({
            head: [headers],
            body: body,
            startY: yPos,
            margin: {left: margin, right: margin},
            headStyles: {
                fillColor: [50, 50, 50],       // Dark gray header (almost black)
                textColor: 255,                 // White text
                fontStyle: 'bold'
            },
            columnStyles: {
                4: {halign: 'right'},
                5: {halign: 'right'},
                [body.length-1]: {
                    fontStyle: 'bold', 
                    fillColor: [220, 220, 220], // Light gray for total row
                    textColor: 0,               // Black text
                    halign: 'right'
                }
            },
            styles: {
                fontSize: 10,
                cellPadding: 4,
                overflow: 'linebreak',
                textColor: 0,                   // Black text for all cells
                fillColor: 255                   // White background for data rows
            },
            didParseCell: (data) => {
                if (data.row.index === body.length-1) {
                    data.cell.styles.fontStyle = 'bold';
                    if (data.column.index === 3) {
                        data.cell.colSpan = 2;
                        data.cell.halign = 'left';
                    }
                }
            }
        });
    }
    
    function generateStockCardTable(pdf, data, yPos, margin) {
        pdf.autoTable({
            head: [['KODE', 'NAMA BARANG', 'STOK AWAL', 'PEMBELIAN', 'PENJUALAN', 'STOK AKHIR']],
            body: data.map(item => [
                `VAR${item.id.toString().padStart(4, '0')}`,
                item.name,
                item.initialStock,
                item.purchases,
                item.sales,
                item.finalStock
            ]),
            startY: yPos,
            margin: {left: margin, right: margin},
            headStyles: {
                fillColor: [13, 71, 161],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                2: {halign: 'right'},
                3: {halign: 'right'},
                4: {halign: 'right'},
                5: {halign: 'right'}
            },
            styles: {
                fontSize: 9,
                cellPadding: 3
            }
        });
    }
    
    function generateStockOpname(pdf, data, startY = 30, margin = 14) {
        const { logs } = data;
        
        // Set document styles
        pdf.setFont('helvetica');
        
        // 1. Title
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 128);
        pdf.text(`LAPORAN STOCK OPNAME`, 105, startY, { align: 'center' });
        
        // 2. Table with properly merged rows
        const tableY = startY + 25;
        
        // Prepare data for autoTable with correct merged cells
        const body = [];
        logs.forEach(log => {
            log.item_opname.forEach((item, index) => {
                const difference = item.stok - (item.varian?.jumlah_stok || 0);
                const row = [
                    index === 0 ? { 
                        content: log.id.toString(), 
                        rowSpan: log.item_opname.length 
                    } : '',
                    index === 0 ? { 
                        content: formatDate(log.tanggal), 
                        rowSpan: log.item_opname.length 
                    } : '',
                    index === 0 ? { 
                        content: log.status_log, 
                        rowSpan: log.item_opname.length 
                    } : '',
                    `VAR${item.id_varian.toString().padStart(4, '0')}`,
                    item.status_item_log,
                    { content: (item.varian?.jumlah_stok || 0).toString(), styles: { halign: 'right' } },
                    { content: item.stok.toString(), styles: { halign: 'right' } },
                    { 
                        content: difference === 0 ? '0' : (difference > 0 ? `+${difference}` : difference.toString()),
                        styles: { 
                            halign: 'right',
                            textColor: difference > 0 ? [0, 128, 0] : difference < 0 ? [255, 0, 0] : [0, 0, 0]
                        }
                    }
                ];
                body.push(row);
            });
        });
    
        pdf.autoTable({
            head: [['ID LOG', 'TANGGAL', 'STATUS LOG', 'ID ITEM', 'STATUS ITEM', 'STOK SISTEM', 'STOK FISIK', 'SELISIH']],
            body: body,
            startY: tableY,
            margin: { left: margin, right: margin },
            headStyles: {
                fillColor: [13, 71, 161],
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 20 },  // ID Log
                1: { cellWidth: 30 },  // Tanggal
                2: { cellWidth: 25 },  // Status Log
                3: { cellWidth: 25 },  // ID Item
                4: { cellWidth: 30 },  // Status Item
                5: { cellWidth: 25, halign: 'right' },  // Stok Sistem
                6: { cellWidth: 25, halign: 'right' },  // Stok Fisik
                7: { cellWidth: 20, halign: 'right' }   // Selisih
            },
            didDrawPage: function(data) {
                // Add footer to each page
                addFooter(pdf, margin);
            },
            // Handle merged cells
            createdCell: function(cell, data) {
                if (cell.raw !== null && typeof cell.raw === 'object' && cell.raw.rowSpan) {
                    cell.rowSpan = cell.raw.rowSpan;
                    cell.content = cell.raw.content;
                }
            },
            // Ensure empty cells are properly rendered
            drawCell: function(cell, data) {
                if (cell.raw === '') {
                    data.table.cell(cell.x, cell.y, cell.width, cell.height, '', cell.styles);
                    return false;
                }
            }
        });
    
        return pdf;
    }
    
    // ===== UTILITY FUNCTIONS ===== //
    
    function addFooter(pdf, margin) {
        const pageCount = pdf.internal.getNumberOfPages();
        
        for(let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            
            // Footer line
            pdf.setDrawColor(200);
            pdf.line(margin, 285, 210 - margin, 285);
            
            // Footer text
            pdf.text(`Halaman ${i} dari ${pageCount}`, 105, 291, {align: 'center'});
            pdf.text(`Dibuat pada ${new Date().toLocaleDateString('id-ID')}`, 105, 294, {align: 'center'});
        }
    }
    
    // Improved currency formatting
    function formatCurrencyPDF(amount) {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Event listeners
    generateBtn.addEventListener('click', generateReport);
    downloadBtn.addEventListener('click', generatePDF);

    // Initialize
    // function init() {
    // periodeSelect.value = new Date().getFullYear().toString();
    // }

    // init();
});