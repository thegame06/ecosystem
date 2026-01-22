import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../services/api';

interface UseServerPaginationOptions {
    endpoint: string;
    pageSize?: number;
    filters?: Record<string, any>;
    searchTerm?: string;
    searchField?: string;
    orderBy?: string;
}

interface PaginationState {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export const useServerPagination = <T>({
    endpoint,
    pageSize = 20,
    filters = {},
    searchTerm = '',
    searchField = 'name',
    orderBy = '' // No default here to avoid mismatch if not needed
}: UseServerPaginationOptions) => {
    const [data, setData] = useState<T[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageNumber: 1,
        pageSize,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const buildQueryString = (pageNumber: number): string => {
        const skip = (pageNumber - 1) * pageSize;
        const params = new URLSearchParams();

        // OData Standard parameters
        params.append('$skip', skip.toString());
        params.append('$top', pageSize.toString());
        params.append('$count', 'true');

        if (orderBy) {
            // Ensure orderBy uses lowercase 'name' if that's what's requested
            params.append('$orderby', orderBy);
        }

        const filterParts: string[] = [];

        // Search via OData filter
        if (searchTerm) {
            // Use the specified searchField
            filterParts.push(`contains(${searchField}, '${searchTerm}')`);
        }

        // Additional Filters via OData
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value === 'string') {
                    filterParts.push(`${key} eq '${value}'`);
                } else {
                    filterParts.push(`${key} eq ${value}`);
                }
            }
        });

        if (filterParts.length > 0) {
            params.append('$filter', filterParts.join(' and '));
        }

        return params.toString();
    };

    const fetchData = useCallback(async (pageNumber: number, signal?: AbortSignal) => {
        setLoading(true);
        setError(null);

        try {
            const queryString = buildQueryString(pageNumber);
            const response = await api.get(`${endpoint}?${queryString}`, { signal });

            const result = response.data;
            // The backend returns { items, totalCount, pageNumber, rowsPerPage, totalPages, hasNextPage, hasPreviousPage }
            setData(result.items || []);
            setPagination({
                pageNumber: result.pageNumber || pageNumber,
                pageSize: result.rowsPerPage || pageSize,
                totalCount: result.totalCount || 0,
                totalPages: result.totalPages || 0,
                hasPreviousPage: result.hasPreviousPage || false,
                hasNextPage: result.hasNextPage || false
            });
        } catch (err: any) {
            if (axios.isCancel(err)) return;

            setError(err.response?.data?.message || err.message || 'Error al cargar datos');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [endpoint, pageSize, JSON.stringify(filters), searchTerm, searchField, orderBy]);

    useEffect(() => {
        const controller = new AbortController();
        fetchData(1, controller.signal);

        return () => {
            controller.abort();
        };
    }, [fetchData]);

    return {
        data,
        pagination,
        loading,
        error,
        goToPage: (page: number) => fetchData(page),
        refresh: () => fetchData(pagination.pageNumber)
    };
};
