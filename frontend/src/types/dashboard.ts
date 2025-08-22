export interface SalesForceData {
    kodeSF: string;
    namaSF: string;
    kodeTL?: string;
    namaTL?: string;
    agency: string;
    area?: string;
    regional: string;
    branch: string;
    wok: string;
    totalPs: number;
    category: 'Black' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
}

export interface MetricsData {
    kodeSF: string;
    namaSF: string;
    WoW: string;
    MoM: string;
    QoQ: string;
    YoY: string;
}

export interface Filters {
    regional: string;
    branch: string;
    wok: string;
    category: string;
    dateRange: string;
}

export interface FilterOptions {
    regional: string[];
    branch: string[];
    wok: string[];
    category: string[];
}

export interface DashboardStats {
    totalSalesForce: number;
    totalPS: number;
    avgPerformance: string;
    topPerformer: SalesForceData | null;
}

export interface CategoryStat {
    category: string;
    count: number;
    percentage: string;
}

export interface UploadResponse {
    success: boolean;
    msg: string;
    totalSkipped?: number;
    data?: {
        totalRecords: number;
        newRecords: number;
        skippedRecords: number;
    };
}