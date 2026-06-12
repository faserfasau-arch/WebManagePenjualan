import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, CATEGORIES } from '../types';
import { ProductFormModal } from './ProductFormModal';
import { Search, Plus, Minus, Edit, Trash2, ShieldAlert, ArrowDownUp, CheckCircle, Eye } from 'lucide-react';

export const InventoryPanel: React.FC = () => {
  const { products, adjustStock, deleteProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Normal'>('All');
  
  // Sort configurations
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const categories = useMemo(() => ['Semua', ...CATEGORIES], []);

  // Filter products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      
      const isLow = p.stock <= p.minStock;
      const matchesStock = 
        stockFilter === 'All' ? true : 
        stockFilter === 'Low' ? isLow : !isLow;

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, stockFilter]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredProducts, sortField, sortDirection]);

  const handleToggleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleAddClick = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}" dari inventaris?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div id="inventory-panel-container" className="bg-white p-5 rounded-2xl border border-slate-200">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Manajemen Stok Inventaris</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola data produk, perbarui harga barang, dan set batas minimum stok.</p>
        </div>

        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center space-x-1.5 shadow-md shadow-emerald-250 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      {/* Complex Filter Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 mb-5">
        {/* Search Input (5 Cols) */}
        <div className="md:col-span-5 relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan SKU atau nama produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Category Selector (4 Cols) */}
        <div className="md:col-span-4 flex items-center space-x-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Kategori</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Stock Filter (3 Cols) */}
        <div className="md:col-span-3 flex items-center space-x-2">
          <label className="text-[10px] uppercase font-bold text-slate-500 shrink-0">Stok</label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="All">Semua Stok</option>
            <option value="Low">Menipis (≤ Batas Min)</option>
            <option value="Normal">Stok Aman</option>
          </select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">Produk tidak ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Ubah filter pencarian atau buat produk baru.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP: Tables View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-650 min-w-4xl">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider select-none">
                  <th className="py-3 px-4 rounded-l-xl cursor-pointer hover:text-slate-900" onClick={() => handleToggleSort('sku')}>
                    <span className="flex items-center space-x-1">
                      <span>SKU</span>
                      <ArrowDownUp className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleToggleSort('name')}>
                    <span className="flex items-center space-x-1">
                      <span>Nama Produk</span>
                      <ArrowDownUp className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => handleToggleSort('category')}>
                    <span className="flex items-center space-x-1">
                      <span>Kategori</span>
                      <ArrowDownUp className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-900" onClick={() => handleToggleSort('buyPrice')}>
                    <span className="flex items-center space-x-1 justify-end">
                      <span>Harga Beli</span>
                      <ArrowDownUp className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-3 px-4 text-right cursor-pointer hover:text-slate-900" onClick={() => handleToggleSort('sellPrice')}>
                    <span className="flex items-center space-x-1 justify-end">
                      <span>Harga Jual</span>
                      <ArrowDownUp className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-3 px-4 text-right">Laba/Unit</th>
                  <th className="py-3 px-4 text-center cursor-pointer hover:text-slate-900" onClick={() => handleToggleSort('stock')}>
                    <span className="flex items-center space-x-1 justify-center">
                      <span>Stok Tersedia</span>
                      <ArrowDownUp className="h-3 w-3" />
                    </span>
                  </th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody id="inventory-table-body" className="divide-y divide-slate-100">
                {sortedProducts.map(product => {
                  const isLow = product.stock <= product.minStock;
                  const isOut = product.stock <= 0;
                  const profit = product.sellPrice - product.buyPrice;

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isLow ? 'bg-amber-50/15' : 'bg-transparent'
                      }`}
                    >
                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800 select-all">
                        {product.sku}
                      </td>

                      {/* Name & Indicators */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        <div>
                          <span>{product.name}</span>
                          {isOut ? (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.25 text-[9px] font-bold bg-rose-100 text-rose-800 rounded">
                              Habis
                            </span>
                          ) : isLow ? (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.25 text-[9px] font-bold bg-amber-100 text-amber-800 rounded animate-pulse">
                              Stok Menipis
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-slate-500 font-medium">
                        {product.category}
                      </td>

                      {/* Buy Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-600">
                        Rp {product.buyPrice.toLocaleString('id-ID')}
                      </td>

                      {/* Sell Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        Rp {product.sellPrice.toLocaleString('id-ID')}
                      </td>

                      {/* Laba */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        Rp {profit.toLocaleString('id-ID')}
                      </td>

                      {/* Rapid Stock Adjustment */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => adjustStock(product.id, -1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-rose-600 transition"
                            title="Kurang 1 Stok"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <span className={`px-2.5 py-0.75 text-xs font-mono font-bold rounded-lg border text-center min-w-16 ${
                            isOut
                              ? 'bg-rose-100/50 text-rose-800 border-rose-200'
                              : isLow
                              ? 'bg-amber-100/55 text-amber-800 border-amber-300 ring-2 ring-amber-300/30'
                              : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}>
                            {product.stock} {product.unit}
                          </span>

                          <button
                            onClick={() => adjustStock(product.id, 1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-emerald-700 transition"
                            title="Tambah 1 Stok"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center mt-1">Min: {product.minStock} {product.unit}</p>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="p-1.5 hover:bg-slate-100 hover:text-emerald-600 transition text-slate-450 rounded-lg cursor-pointer"
                            title="Ubah Rincian"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product.id, product.name)}
                            className="p-1.5 hover:bg-slate-100 hover:text-rose-600 transition text-slate-450 rounded-lg cursor-pointer"
                            title="Hapus Barang"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE: Grid Cards View */}
          <div className="mobile-cards-grid md:hidden grid grid-cols-1 gap-3">
            {sortedProducts.map(product => {
              const isLow = product.stock <= product.minStock;
              const isOut = product.stock <= 0;
              const profit = product.sellPrice - product.buyPrice;

              return (
                <div
                  key={product.id}
                  className={`p-4 border rounded-xl space-y-3 relative ${
                    isOut
                      ? 'border-rose-200 bg-rose-50/10'
                      : isLow
                      ? 'border-amber-300 bg-amber-50/10'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{product.sku}</span>
                    <div>
                      {isOut ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-800 rounded">Habis</span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded animate-pulse">Minipis</span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-800 rounded-lg">Aman</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{product.name}</h3>
                    <p className="text-xs text-slate-455 font-medium mt-0.5">Kategori: <b>{product.category}</b></p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-medium text-slate-400">Harga Beli</p>
                      <p className="font-semibold font-mono text-slate-600">Rp {product.buyPrice.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-medium text-slate-400">Harga Jual</p>
                      <p className="font-bold font-mono text-slate-900">Rp {product.sellPrice.toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Inline Stock adjustment */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-lg p-0.5">
                      <button
                        onClick={() => adjustStock(product.id, -1)}
                        className="p-1 bg-white hover:bg-slate-150 rounded text-slate-500"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-800 px-2 min-w-10 text-center">
                        {product.stock} {product.unit}
                      </span>
                      <button
                        onClick={() => adjustStock(product.id, 1)}
                        className="p-1 bg-white hover:bg-slate-150 rounded text-slate-500"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600"
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id, product.name)}
                        className="p-2 border border-slate-200 rounded-xl hover:bg-rose-50 text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Integrate the product modifier modal cleanly */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
      />
    </div>
  );
};
