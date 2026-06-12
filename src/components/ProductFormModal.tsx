import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product, CATEGORIES, UNITS } from '../types';
import { X, Save, Sparkles } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const { addProduct, updateProduct, products } = useApp();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [stock, setStock] = useState('0');
  const [minStock, setMinStock] = useState('5');
  const [buyPrice, setBuyPrice] = useState('0');
  const [sellPrice, setSellPrice] = useState('0');
  const [unit, setUnit] = useState(UNITS[0]);

  const [errorMsg, setErrorMsg] = useState('');

  // Sync state with editing product
  useEffect(() => {
    if (productToEdit) {
      setSku(productToEdit.sku);
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setStock(String(productToEdit.stock));
      setMinStock(String(productToEdit.minStock));
      setBuyPrice(String(productToEdit.buyPrice));
      setSellPrice(String(productToEdit.sellPrice));
      setUnit(productToEdit.unit);
    } else {
      // Clear fields to add item
      setSku('');
      setName('');
      setCategory(CATEGORIES[0]);
      setStock('0');
      setMinStock('5');
      setBuyPrice('0');
      setSellPrice('0');
      setUnit(UNITS[0]);
    }
    setErrorMsg('');
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // Auto-generate unique SKU helper
  const handleGenerateSKU = () => {
    const prefix = 
      category === "Makanan & Minuman" ? "FNB" :
      category === "Bahan Pokok" ? "BHK" :
      category === "Alat Tulis Kantor" ? "ATK" :
      category === "Kebutuhan Rumah Tangga" ? "HRT" : "KSH";
    
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku(`${prefix}-${randomNum}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Form validation checks
    if (!sku.trim()) {
      setErrorMsg('Kode SKU barang harus diisi.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Nama barang harus diisi.');
      return;
    }

    const stockNum = parseInt(stock) || 0;
    const minStockNum = parseInt(minStock) || 0;
    const buyPriceNum = parseFloat(buyPrice) || 0;
    const sellPriceNum = parseFloat(sellPrice) || 0;

    if (stockNum < 0) {
      setErrorMsg('Stok barang tidak boleh minus.');
      return;
    }
    if (minStockNum < 0) {
      setErrorMsg('Batas stok menipis minimal tidak boleh minus.');
      return;
    }
    if (buyPriceNum <= 0) {
      setErrorMsg('Harga beli harus lebih besar dari Rp 0.');
      return;
    }
    if (sellPriceNum <= buyPriceNum) {
      setErrorMsg('Harga jual harus lebih tinggi daripada harga beli barang untuk memperoleh laba.');
      return;
    }

    // Check SKU duplicate only when creating new
    if (!productToEdit) {
      const isSkuDuplicate = products.some(p => p.sku.toUpperCase() === sku.toUpperCase());
      if (isSkuDuplicate) {
        setErrorMsg(`Kode SKU "${sku.toUpperCase()}" sudah digunakan oleh produk lain.`);
        return;
      }
    }

    const payload = {
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category,
      stock: stockNum,
      minStock: minStockNum,
      buyPrice: buyPriceNum,
      sellPrice: sellPriceNum,
      unit
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, payload);
    } else {
      addProduct(payload);
    }

    onClose();
  };

  return (
    <div id="product-modal-root" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-base font-bold text-slate-800 font-sans tracking-tight">
            {productToEdit ? 'Ubah Informasi Produk' : 'Tambah Produk Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg border border-slate-200 hover:bg-slate-200 bg-white transition text-slate-500 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-800">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Row SKU & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Kode SKU</span>
                {!productToEdit && (
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center space-x-0.5 cursor-pointer"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    <span>Auto-sku</span>
                  </button>
                )}
              </label>
              <input
                type="text"
                disabled={!!productToEdit} // Lock SKU on edit
                placeholder="ATK-002"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand Name field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Produk</label>
            <input
              type="text"
              required
              placeholder="Contoh: Aqua Botol Mini 330ml"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Row Prices (Buy and Sell) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Harga Beli Cabang (Rp)</label>
              <input
                type="number"
                required
                min="0"
                placeholder="12000"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Harga Jual Konsumen (Rp)</label>
              <input
                type="number"
                required
                min="0"
                placeholder="15000"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row Stock & Minimum Warning */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-sans">Jumlah Stok</label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 font-sans">Batas Min (Alert)</label>
              <input
                type="number"
                required
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Satuan Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action trigger buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition border border-slate-200 cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-emerald-100 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Informasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
