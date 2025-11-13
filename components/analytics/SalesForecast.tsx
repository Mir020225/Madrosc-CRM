// components/analytics/SalesForecast.tsx
import React, { useState, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { generateSalesForecast } from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const SalesForecast: React.FC = () => {
    const { getAllSales } = useApp();
    const [forecast, setForecast] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setForecast('');
        try {
            const allSales = await getAllSales();
            if (allSales.length === 0) {
                setForecast("### No Data\nNot enough sales data to generate a forecast.");
                return;
            }
            const summary = await generateSalesForecast(allSales);
            setForecast(summary);
        } catch(e) {
            console.error(e);
            setForecast("### Error\nCould not generate forecast at this time.");
        } finally {
            setIsLoading(false);
        }
    }, [getAllSales]);
    
    return (
         <div className="bg-purple-50 dark:bg-gray-900/50 p-4 rounded-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold flex items-center"><i className="fas fa-chart-line mr-2 text-purple-500"></i> Sales Forecast</h4>
                <button onClick={handleGenerate} disabled={isLoading} className="text-xs text-purple-600 hover:underline disabled:opacity-50">Generate</button>
            </div>
            <div className="flex-grow overflow-y-auto">
                 {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48">
                        <Spinner color="text-purple-600" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Forecasting next quarter...</p>
                    </div>
                ) : forecast ? (
                    <MarkdownRenderer content={forecast} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <i className="fas fa-magic text-3xl mb-2"></i>
                        <p>Generate an AI-powered sales forecast for the next quarter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesForecast;