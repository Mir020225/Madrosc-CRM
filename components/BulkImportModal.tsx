// components/BulkImportModal.tsx
import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Customer, CustomerTier } from '../types';
import Spinner from './ui/Spinner';

type ParsedCustomer = Omit<Customer, 'id' | 'avatar' | 'lastUpdated'>;

const BulkImportModal: React.FC = () => {
    const { closeBulkImportModal, bulkAddCustomers } = useApp();
    const { addToast } = useToast();
    
    const [parsedCustomers, setParsedCustomers] = useState<ParsedCustomer[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const TEMPLATE_HEADERS = "name,contact,alternateContact,state,district,tier,salesThisMonth,avg6MoSales,outstandingBalance,daysSinceLastOrder";
    const TEMPLATE_EXAMPLE = "Amit Kumar,9988776655,8877665544,Maharashtra,Pune,Silver,5000,8000,2500,30";

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8," + TEMPLATE_HEADERS + "\n" + TEMPLATE_EXAMPLE;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "customer_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processCsvData = (data: string) => {
        setIsParsing(true);
        try {
            const lines = data.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Basic header validation
            const requiredHeaders = ["name", "contact", "state", "district", "tier"];
            if(!requiredHeaders.every(h => headers.includes(h))) {
                 addToast("CSV headers are missing required columns (name, contact, state, district, tier).", 'error');
                 setParsedCustomers([]);
                 setIsParsing(false);
                 return;
            }

            const customers: ParsedCustomer[] = [];
            
            for(let i = 1; i < lines.length; i++) {
                if(!lines[i].trim()) continue; // Skip empty lines
                const values = lines[i].split(',');
                if(values.length < headers.length) continue;

                const customer: any = {};
                headers.forEach((header, index) => {
                    customer[header] = values[index]?.trim() || '';
                });
                
                customers.push({
                    name: customer.name || 'Unnamed',
                    contact: customer.contact || '0000000000',
                    alternateContact: customer.alternateContact || '',
                    state: customer.state || 'Unknown',
                    district: customer.district || 'Unknown',
                    tier: (['Gold', 'Silver', 'Bronze', 'Dead'].includes(customer.tier) ? customer.tier as CustomerTier : 'Bronze'),
                    salesThisMonth: Number(customer.salesThisMonth) || 0,
                    avg6MoSales: Number(customer.avg6MoSales) || 0,
                    outstandingBalance: Number(customer.outstandingBalance) || 0,
                    daysSinceLastOrder: Number(customer.daysSinceLastOrder) || 0,
                });
            }
            setParsedCustomers(customers);
             if(customers.length > 0) {
                 addToast(`${customers.length} customers parsed successfully.`, 'success');
            } else {
                 addToast(`No customer data found in the file.`, 'info');
            }
        } catch (e) {
            addToast("Error parsing CSV file. Please check the format.", 'error');
            setParsedCustomers([]);
        } finally {
            setIsParsing(false);
        }
    }

    const handleFileSelect = (file: File | null) => {
        if (!file) return;

        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            addToast('Invalid file type. Please upload a CSV file.', 'error');
            return;
        }

        setSelectedFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            processCsvData(text);
        };
        reader.readAsText(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files ? e.target.files[0] : null);
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFileSelect(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
    };
    
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setParsedCustomers([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleImport = async () => {
        if(parsedCustomers.length === 0) {
            addToast("No valid customers to import.", 'info');
            return;
        }
        setIsImporting(true);
        try {
            await bulkAddCustomers(parsedCustomers);
            addToast(`${parsedCustomers.length} customers imported successfully!`, 'success');
            closeBulkImportModal();
        } catch(e) {
             addToast("Failed to import customers.", 'error');
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm" onClick={closeBulkImportModal}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Bulk Import Customers</h3>
                    <button onClick={closeBulkImportModal}><i className="fas fa-times"></i></button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm">Upload a CSV file with customer data. Ensure the file's first row contains headers matching the template.</p>
                    <button onClick={downloadTemplate} className="btn-secondary"><i className="fas fa-download mr-2"></i>Download CSV Template</button>
                    
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                    />

                    { !selectedFile ? (
                         <div 
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <i className="fas fa-upload text-3xl text-gray-400 mb-3"></i>
                            <p className="font-semibold">Drag & drop your CSV file here</p>
                            <p className="text-sm text-gray-500">or click to browse</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                             <div className="flex items-center gap-3">
                                <i className="fas fa-file-csv text-3xl text-green-500"></i>
                                <div>
                                    <p className="font-semibold">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                             </div>
                             <button onClick={handleRemoveFile} className="text-red-500 hover:text-red-700 text-lg font-bold">&times;</button>
                        </div>
                    )}

                    {isParsing && <Spinner />}

                    {parsedCustomers.length > 0 && (
                        <div>
                            <h4 className="font-semibold">Preview ({parsedCustomers.length} customers found)</h4>
                            <div className="max-h-32 overflow-y-auto text-xs mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border dark:border-gray-700">
                                <ul className="list-disc pl-5">
                                    {parsedCustomers.slice(0,5).map((c, i) => <li key={i}>{c.name} - {c.state}</li>)}
                                    {parsedCustomers.length > 5 && <li>... and {parsedCustomers.length - 5} more.</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-5 border-t dark:border-gray-700 flex justify-end gap-3">
                    <button onClick={closeBulkImportModal} className="btn-secondary">Cancel</button>
                    <button onClick={handleImport} disabled={isImporting || parsedCustomers.length === 0} className="btn-primary flex items-center">
                        {isImporting && <Spinner size="sm" className="mr-2" />}
                        {isImporting ? 'Importing...' : `Import ${parsedCustomers.length} Customers`}
                    </button>
                </div>
                 <style>{`
                    .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #2563EB; border-radius: 0.375rem; }
                    .btn-primary:hover { background-color: #1D4ED8; }
                    .btn-primary:disabled { background-color: #93C5FD; cursor: not-allowed; }
                    .btn-secondary { padding: 0.5rem 1rem; font-weight: 500; border: 1px solid #D1D5DB; border-radius: 0.375rem; }
                    .dark .btn-secondary { border-color: #4B5563; background-color: #374151; }
                 `}</style>
            </div>
        </div>
    );
};

export default BulkImportModal;