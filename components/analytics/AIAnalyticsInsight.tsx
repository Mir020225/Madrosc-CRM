// components/analytics/AIAnalyticsInsight.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { generateAIAnalyticsSummary } from '../../services/geminiService';
import Spinner from '../ui/Spinner';
import MarkdownRenderer from '../ui/MarkdownRenderer';

const AIAnalyticsInsight: React.FC = () => {
    const { customers, tasks } = useApp();
    const [insight, setInsight] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const generateInsight = async () => {
        if (!customers || customers.length === 0) return;
        setIsLoading(true);
        try {
            const summary = await generateAIAnalyticsSummary(customers, tasks);
            setInsight(summary);
        } catch(e) {
            console.error(e);
            setInsight("Error generating insights.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        // Debounce or prevent re-fetching on minor updates if necessary
        if(customers.length > 0) {
            generateInsight();
        }
    }, [customers, tasks]);
    
    return (
         <div className="bg-blue-50 dark:bg-gray-900/50 p-4 rounded-lg h-full">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold flex items-center"><i className="fas fa-brain mr-2 text-blue-500"></i> AI-Powered Insights</h4>
                <button onClick={generateInsight} disabled={isLoading} className="text-xs text-blue-600 hover:underline disabled:opacity-50">Regenerate</button>
            </div>
             {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48">
                    <Spinner />
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Analyzing data...</p>
                </div>
            ) : (
                <MarkdownRenderer content={insight} />
            )}
        </div>
    );
};

export default AIAnalyticsInsight;
