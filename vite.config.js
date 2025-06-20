// for dev
export default {
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
};


// // for build and deploy
// import { defineConfig } from 'vite';
// import { resolve } from 'path';

// export default defineConfig({
//   base: '/TA-inventory/', 
//   server: {
//     port: 3000,
//   },
//   build: {
//     outDir: 'dist',
//     rollupOptions: {
//       input: {
//         main: resolve(__dirname, './index.html'),
//         product: resolve(__dirname, './product.html'),
//         history: resolve(__dirname, './history.html'),
//         supplier: resolve(__dirname, './supplier.html'),
//         bakul: resolve(__dirname, './bakul.html'),
//         navbar: resolve(__dirname, './navbar.html'),
//         stock_opname: resolve(__dirname, './stock_opname.html'),
//         dashboard: resolve(__dirname, './dashboard.html'),
//         laporan: resolve(__dirname, './laporan.html'),
//         pembelian: resolve(__dirname, './pembelian.html'),
//         penjualan: resolve(__dirname, './penjualan.html'),
//       },
//       output: {
//         entryFileNames: '[name].js',
//         chunkFileNames: '[name].js',
//         assetFileNames: '[name].[ext]',
//         manualChunks(id) {
//           if (id.includes('auth.js')) {
//             return 'auth';
//           }
//           if (id.includes('db_conn.js')) {
//             return 'db_conn';
//           }
//         }
//       }
//     }
//   }
// });