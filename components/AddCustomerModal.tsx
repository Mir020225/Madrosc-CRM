// components/AddCustomerModal.tsx
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { CustomerFormData, CustomerTier } from '../types';
import { indianStatesAndDistricts } from '../data/indianStatesAndDistricts';
import Spinner from './ui/Spinner';

const AddCustomerModal: React.FC = () => {
    const { closeAddCustomerModal, addCustomer } = useApp();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<CustomerFormData>({
        name: '',
        contact: '',
        alternateContact: '',
        state: '',
        district: '',
        tier: 'Bronze',
    });
    const [districts, setDistricts] = useState<string[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (formData.state && indianStatesAndDistricts[formData.state]) {
            setDistricts(indianStatesAndDistricts[formData.state]);
            setFormData(prev => ({ ...prev, district: '' })); // Reset district on state change
        } else {
            setDistricts([]);
        }
    }, [formData.state]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof CustomerFormData]) {
            setErrors(prev => ({...prev, [name]: undefined}));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};
        if (!formData.name.trim()) newErrors.name = "Customer name is required.";
        if (!/^\d{10}$/.test(formData.contact)) newErrors.contact = "Contact must be a valid 10-digit number.";
        if (formData.alternateContact && !/^\d{10}$/.test(formData.alternateContact)) newErrors.alternateContact = "Alternate contact must be a valid 10-digit number.";
        if (!formData.state) newErrors.state = "State is required.";
        if (!formData.district) newErrors.district = "District is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            addToast('Please correct the errors in the form.', 'error');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await addCustomer(formData);
            addToast('Customer added successfully!', 'success');
            closeAddCustomerModal();
        } catch (error) {
            addToast('Failed to add customer. Please try again.', 'error');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={closeAddCustomerModal}>
            <div className="card-base w-full max-w-md modal-content" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-[var(--border-light)] dark:border-[var(--border-dark)] flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Add New Client</h3>
                    <button onClick={closeAddCustomerModal} className="text-[var(--text-secondary-light)] dark:text-[var(--text-secondary-dark)] hover:text-red-500">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-style" required/>
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact (10-digit) <span className="text-red-500">*</span></label>
                            <input type="tel" name="contact" value={formData.contact} onChange={handleChange} className="input-style" maxLength={10} required/>
                            {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Alternate Contact (Optional)</label>
                            <input type="tel" name="alternateContact" value={formData.alternateContact} onChange={handleChange} className="input-style" maxLength={10} />
                            {errors.alternateContact && <p className="text-red-500 text-xs mt-1">{errors.alternateContact}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">State <span className="text-red-500">*</span></label>
                                <select name="state" value={formData.state} onChange={handleChange} className="input-style" required>
                                    <option value="">Select State</option>
                                    {Object.keys(indianStatesAndDistricts).sort().map(state => <option key={state} value={state}>{state}</option>)}
                                </select>
                                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">District <span className="text-red-500">*</span></label>
                                <select name="district" value={formData.district} onChange={handleChange} className="input-style" disabled={!formData.state} required>
                                    <option value="">Select District</option>
                                    {districts.sort().map(district => <option key={district} value={district}>{district}</option>)}
                                </select>
                                {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tier</label>
                            <select name="tier" value={formData.tier} onChange={handleChange} className="input-style">
                                <option value="Bronze">Bronze</option>
                                <option value="Silver">Silver</option>
                                <option value="Gold">Gold</option>
                                <option value="Dead">Dead</option>
                            </select>
                        </div>
                    </div>
                    <div className="p-5 border-t border-[var(--border-light)] dark:border-[var(--border-dark)] flex justify-end gap-3">
                        <button type="button" onClick={closeAddCustomerModal} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center">
                            {isSubmitting && <Spinner size="sm" color="text-white" className="mr-2" />}
                            {isSubmitting ? 'Saving...' : 'Add Client'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                .input-style { 
                  display: block; width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.375rem;
                  background-color: var(--card-bg-light); border: 1px solid var(--border-light);
                  color: var(--text-primary-light);
                  transition: border-color 0.2s, box-shadow 0.2s;
                }
                .dark .input-style { background-color: var(--card-bg-dark); border-color: var(--border-dark); color: var(--text-primary-dark); }
                .input-style:focus { outline: none; border-color: var(--primary-light); box-shadow: 0 0 0 2px var(--primary-light, #0d6efd)30; }
                .dark .input-style:focus { border-color: var(--primary-dark); box-shadow: 0 0 0 2px var(--primary-dark, #2f81f7)30; }

                .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: var(--primary-light, #0d6efd); border-radius: 0.375rem; transition: background-color 0.2s; }
                .dark .btn-primary { background-color: var(--primary-dark, #2f81f7); }
                .btn-primary:hover { background-color: var(--primary-hover-light, #0b5ed7); }
                .dark .btn-primary:hover { background-color: var(--primary-hover-dark, #58a6ff); }
                .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

                .btn-secondary { padding: 0.5rem 1rem; font-weight: 500; border: 1px solid var(--border-light); border-radius: 0.375rem; background-color: var(--card-bg-light); transition: background-color 0.2s, border-color 0.2s; }
                .dark .btn-secondary { border-color: var(--border-dark); background-color: var(--card-bg-dark); }
                .btn-secondary:hover { background-color: #f8f9fa; border-color: #ced4da; }
                .dark .btn-secondary:hover { background-color: #ffffff10; border-color: #484f58; }
            `}</style>
        </div>
    );
};

export default AddCustomerModal;