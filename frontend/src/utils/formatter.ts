import { SALES_CATEGORIES } from './constants';
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('id-ID').format(num);
};

export const formatPercentage = (value: string | number): string => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return 'N/A';
    return `${numValue.toFixed(2)}%`;
};

export const formatDate = (date: string | Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
};

export const getCategoryColor = (category: string): string => {
    return SALES_CATEGORIES[category as keyof typeof SALES_CATEGORIES]?.color || 'bg-gray-200';
};

export const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};