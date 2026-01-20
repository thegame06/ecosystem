import api from './api';
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../types/customer';

// Adapt API response to UI Model
const adaptCustomer = (c: Customer): Customer => ({
    ...c,
    // Backend returns 'Name', UI might want split names, but we'll use Name for now
    firstName: c.name.split(' ')[0] || c.name,
    lastName: c.name.split(' ').slice(1).join(' ') || '',
    isActive: true 
});

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
      const response = await api.get<Customer[]>('/customers');
      return response.data.map(adaptCustomer);
  },
  getById: async (id: string): Promise<Customer | undefined> => {
      const response = await api.get<Customer>(`/customers/${id}`);
      return adaptCustomer(response.data);
  },
  create: async (data: CreateCustomerRequest): Promise<Customer> => {
       const response = await api.post<Customer>('/customers', data);
       return adaptCustomer(response.data);
  },
  update: async (id: string, data: UpdateCustomerRequest): Promise<Customer> => {
       // Assuming backend supports PUT
       const response = await api.put<Customer>(`/customers/${id}`, data);
       return adaptCustomer(response.data);
  },
  delete: async (id: string) => {
      return api.delete(`/customers/${id}`);
  }
};
