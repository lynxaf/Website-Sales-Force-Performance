// import React from 'react';
// import { Filter, RefreshCw } from 'lucide-react';
// import { Card } from '../ui/Card';
// import { Select } from '../ui/Select';
// import { Button } from '../ui/Button';
// import { Filters, FilterOptions } from '../../types/dashboard';

// interface FilterControlsProps {
//     filters: Filters;
//     filterOptions: Partial<FilterOptions>; // ubah ke Partial supaya boleh kosong
//     onFilterChange: (filters: Partial<Filters>) => void;
//     onReset: () => void;
//     loading?: boolean;
// }

// export const FilterControls: React.FC<FilterControlsProps> = ({
//     filters,
//     filterOptions,
//     onFilterChange,
//     onReset,
//     loading
// }) => {
//     const handleSelectChange = (key: keyof Filters, value: string) => {
//         onFilterChange({ [key]: value });
//     };

//     // kasih fallback default []
//     const selectOptions = {
//         regional: [
//             { value: '', label: 'All Regional' },
//             ...(filterOptions.regional ?? []).map(option => ({ value: option, label: option }))
//         ],
//         branch: [
//             { value: '', label: 'All Branch' },
//             ...(filterOptions.branch ?? []).map(option => ({ value: option, label: option }))
//         ],
//         wok: [
//             { value: '', label: 'All WOK' },
//             ...(filterOptions.wok ?? []).map(option => ({ value: option, label: option }))
//         ],
//         category: [
//             { value: '', label: 'All Categories' },
//             ...(filterOptions.category ?? []).map(option => ({ value: option, label: option }))
//         ]
//     };

//     return (
//         <Card>
//             <div className="flex items-center gap-2 mb-4">
//                 <Filter className="w-5 h-5 text-gray-600" />
//                 <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
//                 <div className="ml-auto">
//                     <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={onReset}
//                         disabled={loading}
//                         icon={RefreshCw}
//                     >
//                         Reset
//                     </Button>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <Select
//                     label="Regional"
//                     value={filters.regional}
//                     onChange={(e) => handleSelectChange('regional', e.target.value)}
//                     options={selectOptions.regional}
//                     disabled={loading}
//                 />

//                 <Select
//                     label="Branch"
//                     value={filters.branch}
//                     onChange={(e) => handleSelectChange('branch', e.target.value)}
//                     options={selectOptions.branch}
//                     disabled={loading}
//                 />

//                 <Select
//                     label="WOK (Wilayah Operasional Kerja)"
//                     value={filters.wok}
//                     onChange={(e) => handleSelectChange('wok', e.target.value)}
//                     options={selectOptions.wok}
//                     disabled={loading}
//                 />

//                 <Select
//                     label="Category"
//                     value={filters.category}
//                     onChange={(e) => handleSelectChange('category', e.target.value)}
//                     options={selectOptions.category}
//                     disabled={loading}
//                 />
//             </div>
//         </Card>
//     );
// };
