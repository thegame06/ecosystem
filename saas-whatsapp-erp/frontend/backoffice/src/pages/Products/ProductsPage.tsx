import React, { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Product, ProductType, CreateProductRequest } from '../../types/product';
import { productService } from '../../services/productService';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Modal from '../../components/Common/Modal';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState<CreateProductRequest>({
        name: '',
        type: ProductType.TANGIBLE,
        price: 0,
        taxRate: 0.15,
        trackInventory: false,
        stock: 0
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            name: '',
            type: ProductType.TANGIBLE,
            price: 0,
            taxRate: 0.15,
            trackInventory: false,
            stock: 0
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const request: CreateProductRequest = {
                ...formData,
                price: Number(formData.price),
                stock: formData.trackInventory ? Number(formData.stock || 0) : 0,
                taxRate: Number(formData.taxRate)
            };
            
            await productService.create(request);
            await loadProducts();
            handleCloseModal();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Error al crear producto');
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <Button onClick={handleOpenModal} className="flex items-center justify-center gap-2">
                        <Plus size={18} />
                        Nuevo
                    </Button>
                </div>
            </div>

            {/* Filters / Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
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
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                    Cargando productos...
                                </td>
                            </tr>
                        ) : filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${product.type === ProductType.TANGIBLE ? 'bg-blue-100 text-blue-800' : 
                                          product.type === ProductType.SERVICE ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {product.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    ${product.price.toFixed(2)}
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
                                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                                        <Pencil size={18} />
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!isLoading && filteredProducts.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No se encontraron productos. Crea uno nuevo para comenzar.
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Nuevo Producto">
                <form onSubmit={handleSave} className="space-y-4">
                    <Input 
                        label="Nombre" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select 
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as ProductType})}
                        >
                            <option value={ProductType.TANGIBLE}>Producto (Tangible)</option>
                            <option value={ProductType.SERVICE}>Servicio</option>
                            <option value={ProductType.RENTAL}>Alquiler</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Precio" 
                            type="number" 
                            step="0.01" 
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                        />
                        <Input 
                            label="IVA (%)" 
                            type="number" 
                            step="0.01" 
                            value={formData.taxRate}
                            onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value)})}
                        />
                    </div>

                    {formData.type !== ProductType.SERVICE && (
                        <div className="flex items-center my-4">
                            <input
                                id="track-inventory"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={formData.trackInventory}
                                onChange={(e) => setFormData({...formData, trackInventory: e.target.checked})}
                            />
                            <label htmlFor="track-inventory" className="ml-2 block text-sm text-gray-900">
                                Controlar Inventario
                            </label>
                        </div>
                    )}

                    {formData.trackInventory && (
                        <Input 
                            label="Stock Inicial" 
                            type="number" 
                            value={formData.stock || 0}
                            onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                        />
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseModal} className="w-auto">
                            Cancelar
                        </Button>
                        <Button type="submit" className="w-auto">
                            Guardar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProductsPage;
