// components/analytics/DateRangePicker.tsx
import React, { useState } from 'react';

const DateRangePicker: React.FC = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    return (
        <div className="flex items-center gap-2">
            <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-style-sm"
            />
            <span className="text-gray-500">to</span>
             <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-style-sm"
            />
            <style>{`
                .input-style-sm { 
                    padding: 0.25rem 0.5rem; 
                    border: 1px solid #D1D5DB; 
                    border-radius: 0.375rem; 
                    background-color: white; 
                }
                .dark .input-style-sm { 
                    background-color: #374151; 
                    border-color: #4B5563; 
                    color: #F9FAFB; 
                }
            `}</style>
        </div>
    );
};

export default DateRangePicker;
