import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { interpretNaturalLanguageSearch } from '../../services/geminiService';
import debounce from 'lodash.debounce';
import Spinner from '../ui/Spinner';

const CommandPalette: React.FC = () => {
    const { 
        customers, 
        isCommandPaletteOpen, 
        closeCommandPalette, 
        openDetailModal, 
        openAddCustomerModal, 
        openAddTaskModal 
    } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [isAiSearching, setIsAiSearching] = useState(false);
    const [aiSearchResults, setAiSearchResults] = useState<string[] | null>(null);

    // General command actions
    const actions = useMemo(() => [
        {
            id: 'action-add-customer',
            name: 'Add New Customer',
            icon: 'fa-user-plus',
            action: () => {
                closeCommandPalette();
                openAddCustomerModal();
            }
        },
        {
            id: 'action-add-task',
            name: 'Add New Task',
            icon: 'fa-tasks',
            action: () => {
                closeCommandPalette();
                openAddTaskModal();
            }
        },
    ], [closeCommandPalette, openAddCustomerModal, openAddTaskModal]);

    const runAiSearch = useCallback(debounce(async (query: string, customerList: any[]) => {
        if (query.split(' ').length < 3) { // Heuristic: only trigger AI for longer queries
             setAiSearchResults(null);
             return;
        }
        setIsAiSearching(true);
        const resultIds = await interpretNaturalLanguageSearch(query, customerList);
        setAiSearchResults(resultIds);
        setIsAiSearching(false);
    }, 1000), [customers]);

    useEffect(() => {
        if (searchTerm) {
            runAiSearch(searchTerm, customers);
        } else {
            setAiSearchResults(null);
            setIsAiSearching(false);
        }
    }, [searchTerm, customers, runAiSearch]);


    const filteredItems = useMemo(() => {
        if (aiSearchResults) {
            const customerMap = new Map(customers.map(c => [c.id, c]));
            return aiSearchResults
                .map(id => customerMap.get(id))
                .filter(Boolean)
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    description: `${c.district}, ${c.state}`,
                    icon: 'fa-user',
                    action: () => {
                        closeCommandPalette();
                        openDetailModal(c);
                    }
                }));
        }

        const searchLower = searchTerm.toLowerCase();

        if (!searchLower) {
            return [...actions];
        }

        const filteredCustomers = customers
            .filter(c => c.name.toLowerCase().includes(searchLower) || c.contact.includes(searchLower))
            .map(c => ({
                id: c.id,
                name: c.name,
                description: `${c.district}, ${c.state}`,
                icon: 'fa-user',
                action: () => {
                    closeCommandPalette();
                    openDetailModal(c);
                }
            }));
        
        const filteredActions = actions.filter(a => a.name.toLowerCase().includes(searchLower));

        return [...filteredActions, ...filteredCustomers];

    }, [searchTerm, customers, actions, closeCommandPalette, openDetailModal, aiSearchResults]);

    useEffect(() => {
        if (!isCommandPaletteOpen) {
            setSearchTerm('');
            setSelectedIndex(0);
            setIsAiSearching(false);
            setAiSearchResults(null);
        }
    }, [isCommandPaletteOpen]);
    
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchTerm, aiSearchResults]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isCommandPaletteOpen) return;

            if (e.key === 'Escape') {
                closeCommandPalette();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    filteredItems[selectedIndex].action();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCommandPaletteOpen, selectedIndex, filteredItems, closeCommandPalette]);


    if (!isCommandPaletteOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-60 backdrop-blur-sm" onClick={closeCommandPalette}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="relative flex items-center">
                    <i className="fas fa-search absolute left-4 text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Search customers or type a command (e.g. 'gold clients in gujarat')..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-b dark:border-gray-700 bg-transparent focus:outline-none"
                        autoFocus
                    />
                    {isAiSearching && <Spinner size="sm" className="mr-4" />}
                </div>
                <ul className="max-h-96 overflow-y-auto p-2">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, index) => (
                            <li
                                key={item.id}
                                onClick={item.action}
                                className={`flex items-center gap-4 p-3 rounded-md cursor-pointer ${selectedIndex === index ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <i className={`fas ${item.icon} w-5 text-center ${selectedIndex === index ? 'text-white' : 'text-gray-500'}`}></i>
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    { (item as any).description && <p className={`text-xs ${selectedIndex === index ? 'text-blue-200' : 'text-gray-500'}`}>{(item as any).description}</p> }
                                </div>
                            </li>
                        ))
                    ) : (
                        <div className="text-center p-6 text-gray-500">
                            <p>No results found.</p>
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default CommandPalette;