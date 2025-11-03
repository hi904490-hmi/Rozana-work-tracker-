import React, { useMemo, useState, useEffect } from 'react';
import EntryForm from './components/EntryForm';
import RecordsTable from './components/RecordsTable';
import SummaryCard from './components/SummaryCard';
import DownloadCodeModal from './components/DownloadCodeModal';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DailyRecord } from './types';

const App: React.FC = () => {
    const [records, setRecords] = useLocalStorage<DailyRecord[]>('rozanaDeliveryData', []);
    const [editingRecord, setEditingRecord] = useState<DailyRecord | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    });
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [theme]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleAddOrUpdateRecord = (newRecord: DailyRecord) => {
        const existingRecordIndex = records.findIndex(r => r.id === newRecord.id);

        let updatedRecords;
        if (existingRecordIndex > -1) {
            updatedRecords = [...records];
            updatedRecords[existingRecordIndex] = newRecord;
        } else {
            updatedRecords = [...records, newRecord];
        }
        
        updatedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecords(updatedRecords);
        setEditingRecord(null);
    };
    
    const handleEdit = (recordId: string) => {
        const recordToEdit = records.find(r => r.id === recordId);
        if (recordToEdit) {
            setEditingRecord(recordToEdit);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleDelete = (recordId: string) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            setRecords(records.filter(r => r.id !== recordId));
        }
    };

    const monthlyData = useMemo(() => {
        const monthlyRecords = records.filter(r => r.date.startsWith(selectedMonth));
        const totalOrders = monthlyRecords.reduce((acc, r) => acc + r.orders, 0);
        const totalBonus = monthlyRecords.reduce((acc, r) => acc + r.orderBonus + r.peakBonus + r.weekendBonus + r.activityReward, 0);
        const attendanceDays = monthlyRecords.length;
        const totalIncome = monthlyRecords.reduce((acc, r) => acc + r.totalIncome, 0);
        const totalExpense = monthlyRecords.reduce((acc, r) => acc + r.totalExpense, 0);
        const netProfit = totalIncome - totalExpense;
        return { monthlyRecords, totalOrders, totalBonus, attendanceDays, netProfit };
    }, [records, selectedMonth]);

    const exportToCSV = () => {
        if (records.length === 0) {
            alert('No records to export.');
            return;
        }
        let csvContent = 'Date,Orders,TotalIncome,TotalExpense,Net\n';
        records.forEach(r => {
            const net = r.totalIncome - r.totalExpense;
            csvContent += `${r.date},${r.orders},${r.totalIncome.toFixed(2)},${r.totalExpense.toFixed(2)},${net.toFixed(2)}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'rozana_delivery_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedMonth(event.target.value);
    };

    const formattedMonth = useMemo(() => {
        if (!selectedMonth) return "This Month's";
        const [year, month] = selectedMonth.split('-');
        const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 2));
        return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });
    }, [selectedMonth]);
    
    return (
        <main className="min-h-screen p-4 sm:p-6 md:p-8">
            <div className="container max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 sm:p-8">
                <header className="mb-8">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100">Rozana Delivery Tracker</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Track your daily income and expenses with ease.</p>
                        </div>
                         <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => setIsDownloadModalOpen(true)}
                                className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition duration-300 flex items-center space-x-2 text-sm"
                                aria-label="Download source code"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                <span>Download Code</span>
                            </button>
                            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle dark mode">
                                {theme === 'light' ? 
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> :
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                }
                            </button>
                        </div>
                    </div>
                </header>
                {/* ... rest of the app JSX ... */}
            </div>
            {isDownloadModalOpen && <DownloadCodeModal onClose={() => setIsDownloadModalOpen(false)} />}
        </main>
    );
};
              
