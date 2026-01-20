import React, { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react';
import { Customer, CreateCustomerRequest } from '../../types/customer';
import { customerService } from '../../services/customerService';
import Button from '../../components/Common/Button';
import Input from '../../components/Common/Input';
import Modal from '../../components/Common/Modal';

// Local interface for the form state, distinct from the DTO
interface CustomerFormData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    notes: string;
}

const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<CustomerFormData>({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        notes: ''
    });

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setIsLoading(true);
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            address: '',
            city: '',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Combine names, trim extra spaces
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            // Combine address and city if relevant, or just rely on address
            const fullAddress = formData.city 
                ? `${formData.address}${formData.address ? ', ' : ''}${formData.city}` 
                : formData.address;

            const request: CreateCustomerRequest = {
                name: fullName || 'Cliente Sin Nombre',
                phone: formData.phone,
                email: formData.email || undefined,
                address: fullAddress || undefined
            };

            await customerService.create(request);
            await loadCustomers();
            handleCloseModal();
        } catch (error) {
            console.error('Error creating customer:', error);
            alert('Error al guardar el cliente');
        }
    };

    const filteredCustomers = customers.filter(c => {
        const fullName = c.name || `${c.firstName || ''} ${c.lastName || ''}`;
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    // Helper to safely get initials
    const getInitials = (c: Customer) => {
        if (c.name) {
             const parts = c.name.split(' ');
             if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
             return c.name.substring(0, 2).toUpperCase();
        }
        return `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase() || '??';
    };

    // Helper to safely get display name
    const getDisplayName = (c: Customer) => {
        return c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Clientes
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Gestiona tu base de datos de clientes y contactos</p>
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
                        placeholder="Buscar por nombre, teléfono o email..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Customer List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-start items-start space-x-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                {getInitials(customer)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                    {getDisplayName(customer)}
                                </h3>
                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                    <Phone size={14} className="mr-1.5 flex-shrink-0" />
                                    {customer.phone}
                                </div>
                                {customer.email && (
                                    <div className="mt-1 flex items-center text-sm text-gray-500">
                                        <Mail size={14} className="mr-1.5 flex-shrink-0" />
                                        <span className="truncate">{customer.email}</span>
                                    </div>
                                )}
                                {(customer.city || customer.address) && (
                                    <div className="mt-1 flex items-center text-sm text-gray-500">
                                        <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                                        <span className="truncate">
                                            {[customer.city, customer.address].filter(Boolean).join(', ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col space-y-2">
                                <button className="text-gray-400 hover:text-blue-600">
                                    <Pencil size={18} />
                                </button>
                                <button className="text-gray-400 hover:text-red-600">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isLoading && (
                <div className="text-center py-12">
                     <p className="text-gray-500">Cargando clientes...</p>
                </div>
            )}

            {!isLoading && filteredCustomers.length === 0 && (
                <div className="p-12 text-center bg-white rounded-lg border border-gray-100 border-dashed">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron clientes</h3>
                    <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo cliente para tu base de datos.</p>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Nuevo Cliente">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Nombres" 
                            required 
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                        <Input 
                            label="Apellidos" 
                            required 
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                    </div>
                    
                    <Input 
                        label="Teléfono (WhatsApp)" 
                        required 
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />

                    <Input 
                        label="Email (Opcional)" 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />

                    <Input 
                        label="Ciudad" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <textarea
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                    </div>

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

export default CustomersPage;
