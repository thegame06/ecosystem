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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="text-blue-600" />
                        Productos
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Gestiona tu catálogo de productos y servicios</p>
                </div>
                <div className="w-40">
                    <Button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2">
                        <Plus size={18} />
                        Nuevo
                    </Button>
                </div>
            </div>

            {/* Filters / Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Tipo:</label>
                    <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                        <option value="">Todos los tipos</option>
                        <option value={ProductType.Tangible}>Tangibles</option>
                        <option value={ProductType.Service}>Servicios</option>
                        <option value={ProductType.Rentable}>Rentas</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Estado:</label>
                    <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={filters.isActive}
                        onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
                    >
                        <option value="">Todos</option>
                        <option value="true">Activos</option>
                        <option value="false">Inactivos</option>
                    </select>
                </div>
            </div>

            {/* Product List */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    Cargando productos...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-red-500">
                                    {error}
                                </td>
                            </tr>
                        ) : products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${product.type === ProductType.Tangible ? 'bg-blue-100 text-blue-800' :
                                            product.type === ProductType.Service ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {PRODUCT_TYPE_LABELS[product.type]}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${product.price.toFixed(2)} {product.priceIncludesTax && <span className="text-[10px] text-green-600 font-bold ml-1">IVA INC.</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.trackInventory ? (
                                        <span className={product.stock && product.stock < 5 ? 'text-red-600 font-bold' : ''}>
                                            {product.stock}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">N/A</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEditProduct(product)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && products.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron productos. Crea uno nuevo para comenzar.
                    </div>
                )}

                {/* Pagination Footer */}
                {!loading && products.length > 0 && (
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <Button
                                onClick={() => goToPage(pagination.pageNumber - 1)}
                                disabled={!pagination.hasPreviousPage}
                                variant="secondary"
                            >
                                Anterior
                            </Button>
                            <Button
                                onClick={() => goToPage(pagination.pageNumber + 1)}
                                disabled={!pagination.hasNextPage}
                                variant="secondary"
                            >
                                Siguiente
                            </Button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{(pagination.pageNumber - 1) * pagination.pageSize + 1}</span> a <span className="font-medium">{Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)}</span> de <span className="font-medium">{pagination.totalCount}</span> resultados
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <select
                                    className="block w-24 pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                >
                                    <option value={10}>10 / pág</option>
                                    <option value={20}>20 / pág</option>
                                    <option value={50}>50 / pág</option>
                                    <option value={100}>100 / pág</option>
                                </select>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => goToPage(pagination.pageNumber - 1)}
                                        disabled={!pagination.hasPreviousPage}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Anterior</span>
                                        &larr;
                                    </button>
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                        Pág. {pagination.pageNumber} de {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => goToPage(pagination.pageNumber + 1)}
                                        disabled={!pagination.hasNextPage}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Siguiente</span>
                                        &rarr;
                                    </button>
                                </nav>
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
                            <div className="flex items-center mt-2">
                                <input
                                    id="price-includes-tax"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    checked={formData.priceIncludesTax}
                                    onChange={(e) => setFormData({ ...formData, priceIncludesTax: e.target.checked })}
                                />
                                <label htmlFor="price-includes-tax" className="ml-2 block text-[10px] text-gray-700">
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
                        <div className="flex items-center my-4">
                            <input
                                id="track-inventory"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={formData.trackInventory}
                                onChange={(e) => setFormData({ ...formData, trackInventory: e.target.checked })}
                            />
                            <label htmlFor="track-inventory" className="ml-2 block text-sm text-gray-900">
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
                        <div className="text-red-600 text-sm font-semibold mb-2">{errorMsg}</div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseModal} className="w-auto">
                            Cancelar
                        </Button>
                        <Button type="submit" className="w-auto">
                            {editingId ? "Actualizar" : "Guardar"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProductsPage;
