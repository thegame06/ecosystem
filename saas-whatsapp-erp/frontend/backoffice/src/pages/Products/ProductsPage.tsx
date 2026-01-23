import React, { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Product, CreateProductRequest, UpdateProductRequest } from '../../types/product';
import { ProductType, PRODUCT_TYPE_LABELS } from '../../types/enums';
import { productService } from '../../services/productService';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Modal from '../../components/Common/Modal';
import { useServerPagination } from '../../hooks/useServerPagination';

const ProductsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        isActive: ''
    });
    const [pageSize, setPageSize] = useState(20);

    const {
        data: products,
        pagination,
        loading,
        error,
        goToPage,
        refresh
    } = useServerPagination<Product>({
        endpoint: '/products',
        pageSize,
        filters,
        searchTerm,
        orderBy: 'name asc'
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateProductRequest>({
        name: '',
        description: '',
        type: ProductType.Tangible,
        price: 0,
        costPrice: 0,
        taxRate: 0.15,
        priceIncludesTax: false,
        imageUrl: '',
        unit: 'pza',
        discount: 0,
        trackInventory: false,
        stock: 0
    });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // No local loadProducts needed anymore as hook handles it
    const loadProducts = async () => {
        refresh();
    };

    const handleOpenModal = () => {
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            type: ProductType.Tangible,
            price: 0,
            costPrice: 0,
            taxRate: 0.15,
            priceIncludesTax: false,
            imageUrl: '',
            unit: 'pza',
            discount: 0,
            trackInventory: false,
            stock: 0
        });
        setErrorMsg(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setEditingId(product.id);
        setFormData({
            name: product.name,
            description: product.description || '',
            type: product.type,
            price: product.price,
            costPrice: product.costPrice || 0,
            taxRate: product.taxRate || 0.15,
            priceIncludesTax: product.priceIncludesTax || false,
            imageUrl: product.imageUrl || '',
            unit: product.unit || 'pza',
            discount: product.discount || 0,
            trackInventory: product.trackInventory,
            stock: product.stock
        });
        setErrorMsg(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const commonData: CreateProductRequest = {
                ...formData,
                price: Number(formData.price),
                costPrice: Number(formData.costPrice),
                taxRate: Number(formData.taxRate),
                discount: Number(formData.discount),
                stock: formData.trackInventory ? Number(formData.stock || 0) : 0,
            };

            if (editingId) {
                const updateRequest: UpdateProductRequest = {
                    ...commonData,
                    isActive: true
                };
                await productService.update(editingId, updateRequest);
            } else {
                await productService.create(commonData);
            }

            await loadProducts();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving product:', error);
            setErrorMsg(error?.response?.data?.message || 'Error al guardar producto');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
        try {
            await productService.delete(id);
            await loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error al eliminar el producto');
        }
    };

    const filteredProducts = products; // Already filtered by server

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <Package size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Productos</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Gestiona tu catálogo de productos y servicios</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-primary-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    NUEVO PRODUCTO
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o descripción..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-700 font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-6 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                        <option value="">Todos los tipos</option>
                        <option value={ProductType.Tangible}>Productos</option>
                        <option value={ProductType.Service}>Servicios</option>
                        <option value={ProductType.Rentable}>Rentas</option>
                    </select>
                    <select
                        className="px-6 py-3 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.isActive}
                        onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                    >
                        <option value="">Todos los estados</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Product List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Precio</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">Cargando productos...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={5} className="px-8 py-12 text-center text-red-400 font-bold">{error}</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">No se encontraron productos.</td></tr>
                        ) : products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-slate-900 mb-1">{product.name}</div>
                                    {product.description && (
                                        <div className="text-xs text-slate-400 line-clamp-1">{product.description}</div>
                                    )}
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${
                                        product.type === ProductType.Tangible ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        product.type === ProductType.Service ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                                        'bg-amber-100 text-amber-700 border-amber-200'
                                    }`}>
                                        {PRODUCT_TYPE_LABELS[product.type]}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="font-black text-slate-900 text-lg">
                                        ${product.price.toFixed(2)}
                                    </div>
                                    {product.priceIncludesTax && (
                                        <div className="text-[10px] text-green-600 font-bold">IVA INC.</div>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-center">
                                    {product.trackInventory ? (
                                        <span className={`font-bold ${
                                            product.stock === 0 ? 'text-red-600' :
                                            product.stock && product.stock < 5 ? 'text-amber-600' : 
                                            'text-slate-700'
                                        }`}>
                                            {product.stock}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 italic text-sm">♾️ Ilimitado</span>
                                    )}
                                </td>
                                <td className="px-8 py-6 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEditProduct(product)}
                                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-primary-600 transition-all border border-transparent hover:border-slate-200"
                                        title="Editar producto"
                                    >
                                        <Pencil size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-red-600 transition-all border border-transparent hover:border-slate-200"
                                        title="Eliminar producto"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                {!loading && products.length > 0 && (
                    <div className="bg-slate-50 px-8 py-6 flex items-center justify-between border-t border-slate-100">
                        <p className="text-sm text-slate-500 font-bold">
                            Mostrando <span className="text-slate-900">{products.length}</span> de <span className="text-slate-900">{pagination.totalCount}</span> productos
                        </p>
                        <div className="flex items-center gap-4">
                            <select
                                className="bg-white border-2 border-slate-200 rounded-xl px-3 py-1 text-sm font-bold text-slate-600 outline-none"
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => goToPage(pagination.pageNumber - 1)}
                                    disabled={!pagination.hasPreviousPage}
                                    className="p-2 bg-white border-2 border-slate-200 rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:border-primary-500"
                                >
                                    &larr;
                                </button>
                                <div className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl font-black text-slate-900 text-sm">
                                    {pagination.pageNumber} / {pagination.totalPages}
                                </div>
                                <button
                                    onClick={() => goToPage(pagination.pageNumber + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="p-2 bg-white border-2 border-slate-200 rounded-xl disabled:opacity-30 disabled:grayscale transition-all hover:border-primary-500"
                                >
                                    &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Producto" : "Nuevo Producto"}>
                <form onSubmit={handleSave} className="space-y-4">
                    <Input
                        label="Nombre"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    <Input
                        label="Descripción"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: Number(e.target.value) as ProductType })}
                        >
                            {Object.values(ProductType)
                                .filter(v => typeof v === 'number')
                                .map((v) => (
                                    <option key={v} value={v}>{PRODUCT_TYPE_LABELS[v as ProductType]}</option>
                                ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Precio Venta"
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        />
                        <Input
                            label="Costo"
                            type="number"
                            step="0.01"
                            value={formData.costPrice || 0}
                            onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Input
                                label="IVA (0.0 - 1.0)"
                                type="number"
                                step="0.01"
                                value={formData.taxRate}
                                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                            />
                            <div className="flex items-center mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <input
                                    id="price-includes-tax"
                                    type="checkbox"
                                    className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500 transition-all"
                                    checked={formData.priceIncludesTax}
                                    onChange={(e) => setFormData({ ...formData, priceIncludesTax: e.target.checked })}
                                />
                                <label htmlFor="price-includes-tax" className="ml-3 block text-xs font-black text-slate-600 uppercase tracking-wider">
                                    Precio incluye IVA
                                </label>
                            </div>
                        </div>
                        <Input
                            label="Descuento (%)"
                            type="number"
                            step="0.01"
                            value={formData.discount || 0}
                            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                value={formData.unit || 'Unidad'}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="Unidad">Unidad</option>
                                <option value="Hora">Hora</option>
                                <option value="Día">Día</option>
                                <option value="Kilogramo">Kilogramo</option>
                                <option value="Libra">Libra</option>
                                <option value="Quintal">Quintal</option>
                                <option value="Caja">Caja</option>
                                <option value="Svc">Servicio</option>
                                <option value="Otro">Otro (Personalizado)</option>
                            </select>
                        </div>
                        <div>
                            {formData.unit === 'Otro' ? (
                                <Input
                                    label="Especifique Unidad"
                                    placeholder="Ej: Metro, Galón..."
                                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                />
                            ) : (
                                <>
                                    <Input
                                        label="Imagen URL"
                                        value={formData.imageUrl || ''}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                    {formData.imageUrl && (
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="mt-2 h-20 w-20 object-cover rounded border border-gray-200"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {formData.type !== ProductType.Service && (
                        <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <input
                                id="track-inventory"
                                type="checkbox"
                                className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500 transition-all"
                                checked={formData.trackInventory}
                                onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                            />
                            <label htmlFor="track-inventory" className="ml-3 block text-xs font-black text-slate-600 uppercase tracking-wider">
                                Controlar Inventario
                            </label>
                        </div>
                    )}

                    {formData.trackInventory && (
                        <Input
                            label="Stock"
                            type="number"
                            value={formData.stock || 0}
                            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        />
                    )}

                    {errorMsg && (
                        <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-bold">{errorMsg}</div>
                    )}

                    <div className="pt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-lg shadow-primary-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                            {editingId ? "ACTUALIZAR" : "GUARDAR"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProductsPage;
