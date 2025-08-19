import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useAuth } from '../App';
import type { User, StatCardData, StreamingReportItem, PaymentHistoryItem } from '../types';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, ChevronDownIcon, LogoIcon, DownloadIcon, CsvIcon, XlsIcon, SortIcon } from '../components/Icons';


// Mock Data
const MOCK_STATS: StatCardData[] = [
    { title: 'Total Minutes Streamed', value: '1,234,567', change: 12.5, changeType: 'increase' },
    { title: 'Active Titles', value: '8,230', change: 2.1, changeType: 'decrease' },
    { title: 'Total Revenue', value: '$98,765', change: 15.3, changeType: 'increase' }
];

const MOCK_CHART_DATA = [
    { name: 'Jan', minutes: 4000, revenue: 2400 },
    { name: 'Feb', minutes: 3000, revenue: 1398 },
    { name: 'Mar', minutes: 2000, revenue: 9800 },
    { name: 'Apr', minutes: 2780, revenue: 3908 },
    { name: 'May', minutes: 1890, revenue: 4800 },
    { name: 'Jun', minutes: 2390, revenue: 3800 },
    { name: 'Jul', minutes: 3490, revenue: 4300 },
];

const MOCK_STREAMING_REPORT: StreamingReportItem[] = [
    { id: 1, title: 'Album One', timeStreamed: '120,453 min', revenue: 1204.53, trend: [5, 4, 6, 8, 7, 9, 8], published: '2023-01-15', parts: [
        { id: 11, title: 'Track 1.1', timeStreamed: '60,123 min', revenue: 601.23, trend: [4, 3, 5, 6, 5, 7, 6], published: '2023-01-15' },
        { id: 12, title: 'Track 1.2', timeStreamed: '60,330 min', revenue: 603.30, trend: [6, 5, 7, 10, 9, 11, 10], published: '2023-01-15' },
    ]},
    { id: 2, title: 'Album Two', timeStreamed: '98,765 min', revenue: 987.65, trend: [3, 4, 2, 5, 4, 6, 5], published: '2023-02-20' },
    { id: 3, title: 'Single Release', timeStreamed: '88,123 min', revenue: 881.23, trend: [8, 9, 7, 10, 11, 9, 10], published: '2023-03-01' },
];

const MOCK_PAYMENT_HISTORY: PaymentHistoryItem[] = [
    { date: '2023-05-01', amount: 1234.56, method: 'Bank Transfer', status: 'Paid', notes: 'April 2023 Earnings' },
    { date: '2023-04-01', amount: 1123.45, method: 'Bank Transfer', status: 'Paid', notes: 'March 2023 Earnings' },
    { date: '2023-03-01', amount: 987.65, method: 'Bank Transfer', status: 'Pending', notes: 'February 2023 Earnings' },
    { date: '2023-02-01', amount: 876.54, method: 'PayPal', status: 'Failed', notes: 'January 2023 Earnings' },
];

const settingsSchema = yup.object().shape({
    currentPassword: yup.string().required('Current password is required'),
    newPassword: yup.string().min(6, 'New password must be at least 6 characters').required('New password is required'),
});
type SettingsFormData = yup.InferType<typeof settingsSchema>;


// Sub-components defined outside to prevent re-renders
const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
        {children}
    </div>
);

const Dropdown: React.FC<{ options: string[], selected: string, onSelect: (value: string) => void }> = ({ options, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none" id="menu-button" aria-expanded="true" aria-haspopup="true">
                    {selected}
                    <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" />
                </button>
            </div>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                    <div className="py-1" role="none">
                        {options.map(option => (
                            <a href="#" key={option} onClick={(e) => { e.preventDefault(); onSelect(option); setIsOpen(false); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem" id={`menu-item-${option}`}>{option}</a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Header Component
const Header: React.FC<{ user: User, onLogout: () => void, onSettingsClick: () => void }> = ({ user, onLogout, onSettingsClick }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 cursor-pointer">
                        <LogoIcon />
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
                            <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt="User avatar" />
                            <span className="text-primary-black font-medium">{user.email.split('@')[0]}</span>
                            <ChevronDownIcon />
                        </button>
                        {dropdownOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20">
                                <a href="#" onClick={(e) => { e.preventDefault(); onSettingsClick(); setDropdownOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Switch Publisher</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

// Settings Modal
const SettingsModal: React.FC<{ isOpen: boolean, onClose: () => void, user: User }> = ({ isOpen, onClose, user }) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsFormData>({
        resolver: yupResolver<SettingsFormData>(settingsSchema),
    });

    const onSubmit = (data: SettingsFormData) => {
        return new Promise(resolve => {
            setTimeout(() => {
                alert('Password changed successfully!');
                onClose();
                resolve(true);
            }, 1000);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-primary-black mb-1">Account</h2>
                <p className="text-gray-500 mb-6">Update your account settings.</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" value={user.email} disabled className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input type="password" {...register('currentPassword')} placeholder="Enter your password..." className={`mt-1 block w-full px-3 py-2 border ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-red/50 focus:border-primary-red/50`} />
                        {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input type="password" {...register('newPassword')} placeholder="Enter your new password..." className={`mt-1 block w-full px-3 py-2 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-red/50 focus:border-primary-red/50`} />
                        {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-primary-red border border-transparent rounded-md hover:bg-primary-red/90 disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Overview Section
const Overview: React.FC = () => {
    const [month, setMonth] = useState('June');
    const [year, setYear] = useState('2024');

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary-black">Overview</h3>
                <div className="flex space-x-2">
                    <Dropdown options={['January', 'February', 'March', 'April', 'May', 'June']} selected={month} onSelect={setMonth} />
                    <Dropdown options={['2024', '2023', '2022']} selected={year} onSelect={setYear} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MOCK_STATS.map(stat => (
                    <div key={stat.title} className="p-4 border border-gray-200 rounded-lg">
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <p className="text-3xl font-bold text-primary-black my-2">{stat.value}</p>
                        <div className="flex items-center text-sm">
                            {stat.changeType === 'increase' ? <ArrowUpIcon /> : <ArrowDownIcon />}
                            <span className={`ml-1 font-semibold ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>{stat.change}%</span>
                            <span className="ml-1 text-gray-500">vs last month</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

// Streaming Trends Section
const StreamingTrends: React.FC = () => {
    const [year, setYear] = useState('2024');
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary-black">Streaming Trends</h3>
                <Dropdown options={['2024', '2023', '2022']} selected={year} onSelect={setYear} />
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(255, 81, 118)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="rgb(255, 81, 118)" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(102, 51, 153)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="rgb(102, 51, 153)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ededed" />
                        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #ededed', borderRadius: '0.5rem' }} />
                        <Legend />
                        <Area type="monotone" dataKey="minutes" name="Minutes Streamed" stroke="rgb(255, 81, 118)" fill="url(#colorMinutes)" strokeWidth={2} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="rgb(102, 51, 153)" fill="url(#colorRevenue)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

// Mini Trend Chart for table
const TrendSparkline: React.FC<{data: number[]}> = ({data}) => (
    <div className="w-24 h-8">
        <ResponsiveContainer>
            <LineChart data={data.map(v => ({value: v}))}>
                <Line type="monotone" dataKey="value" stroke="rgb(255, 81, 118)" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
);


// Audio Streaming Report Section
const AudioStreamingReport: React.FC = () => {
    const [month, setMonth] = useState('June');
    const [year, setYear] = useState('2024');
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const toggleRow = (id: number) => {
        setExpandedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    const renderRow = (item: StreamingReportItem, isChild: boolean = false) => (
        <Fragment key={item.id}>
            <tr className={isChild ? "bg-gray-50" : "bg-white"}>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isChild ? 'pl-10' : ''} ${item.parts ? 'cursor-pointer' : ''}`} onClick={() => item.parts && toggleRow(item.id)}>
                    <div className="flex items-center">
                        {item.parts && <ChevronDownIcon className={`h-4 w-4 mr-2 transform transition-transform ${expandedRows.includes(item.id) ? 'rotate-180' : ''}`} />}
                        {item.title}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.timeStreamed}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.revenue.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"><TrendSparkline data={item.trend} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.published}</td>
            </tr>
            {item.parts && expandedRows.includes(item.id) && item.parts.map(part => renderRow(part, true))}
        </Fragment>
    );

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-primary-black">Audio Streaming Report</h3>
                    <Dropdown options={['January', 'February', 'March', 'April', 'May', 'June']} selected={month} onSelect={setMonth} />
                    <Dropdown options={['2024', '2023', '2022']} selected={year} onSelect={setYear} />
                </div>
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-red rounded-md hover:bg-primary-red/90">
                    <CsvIcon />
                    Download CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Title', 'Time Streamed', 'Revenue', 'Trend', 'Published'].map(header => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">{header} <SortIcon/></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {MOCK_STREAMING_REPORT.map(item => renderRow(item))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

// Payment History Section
const PaymentHistory: React.FC = () => {
    const [month, setMonth] = useState('June');
    const [year, setYear] = useState('2024');

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-primary-black">Payment History</h3>
                     <Dropdown options={['January', 'February', 'March', 'April', 'May', 'June']} selected={month} onSelect={setMonth} />
                    <Dropdown options={['2024', '2023', '2022']} selected={year} onSelect={setYear} />
                </div>
                 <Dropdown options={['Download CSV', 'Download XLS']} selected="Download" onSelect={() => {}} />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {['Date', 'Amount', 'Method', 'Status', 'Notes'].map(header => (
                                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center">{header} <SortIcon/></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {MOCK_PAYMENT_HISTORY.map((item, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.method}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.notes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};


// Main Dashboard Component
const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    if (!user) return null; // or a loading spinner

    return (
        <div className="min-h-screen bg-gray-100">
            <Header user={user} onLogout={logout} onSettingsClick={() => setIsSettingsOpen(true)} />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="space-y-6">
                        <Overview />
                        <StreamingTrends />
                        <AudioStreamingReport />
                        <PaymentHistory />
                    </div>
                </div>
            </main>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />
        </div>
    );
};

export default Dashboard;
