import React, { useState, useEffect } from 'react';
import { Users, Plus, Pencil, Trash2, Search, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
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
    whatsappConsent: boolean;
}

const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
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
        notes: '',
        whatsappConsent: true
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

    const handleOpenModal = (customer?: Customer) => {
        if (customer && customer.id) {
            setEditingCustomer(customer);
            const nameParts = (customer.name || '').split(' ');
            setFormData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                phone: customer.phone || '',
                email: customer.email || '',
                address: customer.address || '',
                city: customer.city || '',
                notes: '',
                whatsappConsent: customer.whatsappConsent ?? true
            });
        } else {
            setEditingCustomer(null);
            setFormData({
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                address: '',
                city: '',
                notes: '',
                whatsappConsent: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();
            const fullAddress = formData.city
                ? `${formData.address}${formData.address ? ', ' : ''}${formData.city}`
                : formData.address;

            const request: CreateCustomerRequest = {
                name: fullName || 'Cliente Sin Nombre',
                phone: formData.phone,
                email: formData.email || undefined,
                address: fullAddress || undefined,
                whatsappConsent: formData.whatsappConsent
            };

            if (editingCustomer) {
                await customerService.update(editingCustomer.id, request);
            } else {
                await customerService.create(request);
            }

            await loadCustomers();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Error al guardar el cliente');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;
        try {
            await customerService.delete(id);
            await loadCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Error al eliminar el cliente');
        }
    };

    const filteredCustomers = customers.filter(c => {
        const fullName = c.name || `${c.firstName || ''} ${c.lastName || ''}`;
        return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    const getInitials = (c: Customer) => {
        if (c.name) {
            const parts = c.name.split(' ').filter(p => p.length > 0);
            if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
            return c.name.substring(0, 2).toUpperCase();
        }
        return `${c.firstName?.[0] || ''}${c.lastName?.[0] || ''}`.toUpperCase() || '??';
    };

    const getDisplayName = (c: Customer) => {
        return c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim();
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clientes</h1>
                    </div>
                    <p className="text-slate-500 font-medium">Gestiona tu base de datos de clientes y contactos</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3.5 rounded-2xl font-black shadow-xl shadow-primary-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    NUEVO CLIENTE
                </button>
            </div>

            {/* Filters / Search */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, teléfono o email..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-700 font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Customer Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <p className="text-slate-400 font-bold">Cargando clientes...</p>
                </div>
            ) : filteredCustomers.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
                    <Users className="mx-auto h-12 w-12 text-slate-300" />
                    <h3 className="mt-2 text-sm font-black text-slate-900">No se encontraron clientes</h3>
                    <p className="mt-1 text-sm text-slate-500">Comienza creando un nuevo cliente para tu base de datos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-black text-lg shadow-sm">
                                        {getInitials(customer)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-black text-slate-900 truncate leading-tight">
                                            {getDisplayName(customer)}
                                        </h3>
                                        <div className="mt-2 flex items-center text-sm text-slate-500 font-medium">
                                            <Phone size={14} className="mr-1.5 flex-shrink-0" />
                                            {customer.phone}
                                            {customer.whatsappConsent && (
                                                <div className="ml-2 flex items-center text-primary-600" title="WhatsApp Consentimiento">
                                                    <MessageCircle size={14} className="text-primary-500" />
                                                </div>
                                            )}
                                        </div>
                                        {customer.email && (
                                            <div className="mt-1 flex items-center text-sm text-slate-500 font-medium">
                                                <Mail size={14} className="mr-1.5 flex-shrink-0" />
                                                <span className="truncate">{customer.email}</span>
                                            </div>
                                        )}
                                        {(customer.city || customer.address) && (
                                            <div className="mt-1 flex items-center text-sm text-slate-500 font-medium">
                                                <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                                                <span className="truncate">
                                                    {[customer.city, customer.address].filter(Boolean).join(', ')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                <button
                                    onClick={() => handleOpenModal(customer)}
                                    className="flex-1 p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-primary-600 transition-all border border-transparent hover:border-slate-200 font-bold text-sm"
                                >
                                    <Pencil size={16} className="inline mr-1" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(customer.id)}
                                    className="flex-1 p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-red-600 transition-all border border-transparent hover:border-slate-200 font-bold text-sm"
                                >
                                    <Trash2 size={16} className="inline mr-1" />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Nuevo Cliente">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Nombres"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                        <Input
                            label="Apellidos"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Teléfono (WhatsApp)"
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />

                    <div className="flex items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <input
                            id="whatsapp-consent"
                            type="checkbox"
                            className="w-5 h-5 rounded-lg border-slate-300 text-primary-600 focus:ring-primary-500 transition-all"
                            checked={formData.whatsappConsent}
                            onChange={(e) => setFormData({ ...formData, whatsappConsent: e.target.checked })}
                        />
                        <label htmlFor="whatsapp-consent" className="ml-3 block text-xs font-black text-slate-600 uppercase tracking-wider">
                            Tiene consentimiento para recibir mensajes de WhatsApp
                        </label>
                    </div>

                    <Input
                        label="Email (Opcional)"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    <Input
                        label="Ciudad"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />

                    <div className="mb-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Dirección</label>
                        <textarea
                            className="appearance-none block w-full px-4 py-3 bg-slate-50 border-none rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-700 font-bold sm:text-sm"
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

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
                            {editingCustomer ? 'ACTUALIZAR' : 'GUARDAR'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CustomersPage;
