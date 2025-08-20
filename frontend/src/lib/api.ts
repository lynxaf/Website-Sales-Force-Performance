// lib/api.ts - Create this file in your project
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface SalesForceData {
    kodeSF: string;
    namaSF: string;
    totalPs: number;
    category: 'Black' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    timestamp?: string;
}

class ApiService {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        try {
            console.log(`Making API request to: ${API_BASE_URL}${endpoint}`);

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
                ...options,
            });

            console.log(`API Response status: ${response.status}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('API Response data:', data);

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // Get overall performance data (categories)
    async getOverallPerformance(): Promise<SalesForceData[]> {
        try {
            const response = await this.request<ApiResponse<SalesForceData[]>>('/api/dashboard/overall');

            // Handle different response formats
            if (response.success !== undefined) {
                // New format with success field
                return response.data || [];
            } else if (Array.isArray(response)) {
                // Direct array response (old format)
                return response as SalesForceData[];
            } else {
                // Fallback
                return [];
            }
        } catch (error) {
            console.error('Error fetching overall performance:', error);
            return []; // Return empty array on error instead of throwing
        }
    }
    // Test API connection
    async testConnection(): Promise<boolean> {
        try {
            await this.request('/api/test');
            return true;
        } catch (error) {
            console.error('API connection test failed:', error);
            return false;
        }
    }
}

export const apiService = new ApiService();