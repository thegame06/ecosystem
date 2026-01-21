// Generic pagination types matching backend patterns
export interface PagedRequest {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
}

export interface PagedResponse<T> {
    result: T[];
    totalRows: number;
    page: number; // Skip
    rowsPerPage: number; // Top
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
}
