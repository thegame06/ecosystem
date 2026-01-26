import React, { useState, useMemo } from 'react';
import { Search, Package, ChevronRight, ArrowLeft, Wrench, Truck } from 'lucide-react';
import { Product } from '../../types/product';
import { ProductType, PRODUCT_TYPE_LABELS } from '../../types/enums';

interface POSCatalogProps {
    products: Product[];
    isLoading: boolean;
    onAddToCart: (product: Product) => void;
    currencySymbol: string;
}

const POSCatalog: React.FC<POSCatalogProps> = ({ products, isLoading, onAddToCart, currencySymbol }) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ProductType | null>(null);
    const [filterType, setFilterType] = useState<ProductType | 'all'>('all');

    const getTypeIcon = (type: ProductType) => {
        switch (type) {
            case ProductType.Tangible: return <Package size={24} className="text-primary-600" />;
            case ProductType.Service: return <Wrench size={24} className="text-blue-600" />;
            case ProductType.Rentable: return <Truck size={24} className="text-amber-600" />;
            default: return <Package size={24} className="text-slate-600" />;
        }
    };

    const getStockIndicator = (product: Product) => {
        if (!product.trackInventory) return <span className="text-[10px] font-bold text-slate-400">♾️ Ilimitado</span>;
        const stock = product.stock || 0;
        if (stock === 0) return <span className="text-[10px] font-bold text-red-500 font-black uppercase">❌ Sin stock</span>;
        if (stock <= 3) return <span className="text-[10px] font-bold text-amber-500 font-black uppercase">⚠️ Solo {stock}</span>;
        return <span className="text-[10px] font-bold text-green-600 font-black uppercase">✅ {stock} disp.</span>;
    };

    const groupedProducts = useMemo(() => {
        const groups: Record<ProductType, Product[]> = {
            [ProductType.Tangible]: [],
            [ProductType.Service]: [],
            [ProductType.Rentable]: []
        };
        products.forEach(p => {
            if (p.type !== undefined && groups[p.type]) groups[p.type].push(p);
        });
        return groups;
    }, [products]);

    const displayProducts = useMemo(() => {
        let filtered = products;
        if (selectedCategory !== null) filtered = filtered.filter(p => p.type === selectedCategory);
        if (selectedCategory === null && filterType !== 'all') filtered = filtered.filter(p => p.type === filterType);
        if (search) filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
        return filtered;
    }, [products, search, filterType, selectedCategory]);

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder={selectedCategory !== null ? `Buscar en ${PRODUCT_TYPE_LABELS[selectedCategory]}s...` : "Buscar productos o servicios..."}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {!selectedCategory && (
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Todos ({products.length})</button>
                    <button onClick={() => setFilterType(ProductType.Tangible)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === ProductType.Tangible ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-100 text-slate-600'}`}>Productos</button>
                    <button onClick={() => setFilterType(ProductType.Service)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === ProductType.Service ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-100 text-slate-600'}`}>Servicios</button>
                    <button onClick={() => setFilterType(ProductType.Rentable)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === ProductType.Rentable ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-100 text-slate-600'}`}>Rentas</button>
                </div>
            )}

            {selectedCategory !== null && (
                <button onClick={() => setSelectedCategory(null)} className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 transition-colors">
                    <ArrowLeft size={16} /> Volver a categorías
                </button>
            )}

            <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-fit pb-10">
                {isLoading ? (
                    <div className="col-span-full text-center py-20 text-slate-400 animate-pulse font-black uppercase tracking-widest">Cargando catálogo...</div>
                ) : selectedCategory === null && filterType === 'all' && !search ? (
                    Object.entries(groupedProducts).map(([type, items]) => {
                        const productType = Number(type) as ProductType;
                        if (items.length === 0) return null;
                        return (
                            <div key={type} onClick={() => setSelectedCategory(productType)} className="p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-primary-500 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group col-span-full flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-50 transition-colors shadow-inner">{getTypeIcon(productType)}</div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-xl uppercase tracking-tighter leading-none mb-2">{PRODUCT_TYPE_LABELS[productType]}s</h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{items.length} ítems disponibles</p>
                                    </div>
                                </div>
                                <ChevronRight size={24} className="text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        );
                    })
                ) : displayProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-400 italic font-bold">No se encontraron resultados para "{search}"</div>
                ) : (
                    displayProducts.map(product => {
                        const canAdd = !product.trackInventory || (product.stock && product.stock > 0);
                        return (
                            <div key={product.id} onClick={() => canAdd && onAddToCart(product)} className={`p-4 bg-white border border-slate-100 rounded-[2rem] transition-all flex flex-col gap-4 text-left group ${canAdd ? 'hover:border-primary-500 hover:shadow-xl cursor-pointer hover:-translate-y-1' : 'opacity-50 cursor-not-allowed grayscale'}`}>
                                <div className={`aspect-square bg-slate-50 rounded-[1.5rem] flex items-center justify-center transition-colors relative overflow-hidden ${canAdd ? 'text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-500' : 'text-slate-300'}`}>
                                    <Package size={40} />
                                    {product.priceIncludesTax && (
                                        <div className="absolute top-3 right-3 px-2 py-1 bg-green-100 text-green-700 text-[8px] font-black rounded-lg uppercase tracking-tighter">IVA Inc.</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 px-2">
                                    <h4 className="font-bold text-slate-800 truncate text-sm leading-tight mb-2">{product.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black text-primary-600">{currencySymbol}{product.price.toFixed(2)}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.unit || 'pza'}</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-slate-50">
                                        {getStockIndicator(product)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default POSCatalog;
