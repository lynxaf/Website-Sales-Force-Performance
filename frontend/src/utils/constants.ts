export const SALES_CATEGORIES = {
    Black: { min: 0, max: 1, color: 'bg-gray-800 text-white' },
    Bronze: { min: 2, max: 5, color: 'bg-orange-600 text-white' },
    Silver: { min: 6, max: 10, color: 'bg-gray-400 text-white' },
    Gold: { min: 11, max: 20, color: 'bg-yellow-500 text-white' },
    Platinum: { min: 21, max: 50, color: 'bg-blue-600 text-white' },
    Diamond: { min: 51, max: Infinity, color: 'bg-purple-600 text-white' }
} as const;

export const API_ENDPOINTS = {
    PERFORMANCE: '/api/dashboard/overall',
    METRICS: '/api/dashboard/metrics',
    UPLOAD: '/api/dashboard/upload',
    MONTHLY: '/api/dashboard/monthly',
    TOTAL_PS_PER_MONTH: '/api/dashboard/total-ps-per-month'
} as const;

export const DEFAULT_FILTERS = {
    regional: '',
    branch: '',
    wok: '',
    category: '',
    dateRange: ''
};
