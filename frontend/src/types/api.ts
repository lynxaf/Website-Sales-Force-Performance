// src/types/api.ts
import { Filters } from './dashboard'; // Add this import

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    timestamp?: string;
    filters?: Partial<Filters>; // Now Filters is imported
}

export interface ApiError {
    success: false;
    error: string;
    msg?: string;
}