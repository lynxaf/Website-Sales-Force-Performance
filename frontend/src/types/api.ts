export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    timestamp?: string;
    // filters?: Partial<Filters>;
}

export interface ApiError {
    success: false;
    error: string;
    msg?: string;
}