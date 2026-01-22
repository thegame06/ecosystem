// Generic pagination types matching backend patterns
export interface PagedRequest {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface PagedResponse<T> {
    items: T[];
    pageNumber: number;
    rowsPerPage: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
}
