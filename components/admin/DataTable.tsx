
import React, { useMemo, useState, useEffect } from 'react';
import type { DataItem } from '../../types';
import { CopyIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';

type SortKey = 'newest' | 'oldest' | 'name';
type Status = string;

interface DataTableProps {
  title: string;
  items: DataItem[];
  setItems: (items: DataItem[]) => void;
  statusOptions: readonly Status[];
  statusStyles: { [key in Status]: string };
  brandColorClass: string; // e.g., 'fuchsia' or 'cyan'
  onStatusChange: (id: number, newStatus: Status) => void;
  addToast?: (message: string) => void;
}

const ITEMS_PER_PAGE = 15;

export const DataTable: React.FC<DataTableProps> = ({ title, items, setItems, statusOptions, statusStyles, brandColorClass, onStatusChange, addToast }) => {
  const [sort, setSort] = useState<SortKey>('newest');
  const [filter, setFilter] = useState<Status | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, sort]);

  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter(item => {
          const matchesStatus = filter === 'All' || (item.status || statusOptions[0]) === filter;
          const query = searchQuery.toLowerCase();
          const matchesSearch = 
            (item.name && item.name.toLowerCase().includes(query)) ||
            (item.company && item.company.toLowerCase().includes(query)) ||
            (item.email && item.email.toLowerCase().includes(query));
          
          return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (sort === 'name') return (a.name || a.company!).localeCompare(b.name || b.company!);
        if (sort === 'oldest') return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(); // 'newest'
      });
  }, [items, sort, filter, statusOptions, searchQuery]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredAndSortedItems.slice(startIndex, endIndex);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
        if (addToast) addToast('Email copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy email', err);
        if (addToast) addToast('Failed to copy email');
    });
  };

  const ringColor = `focus:ring-${brandColorClass}-500`;
  const buttonActiveColor = `bg-${brandColorClass}-500`;

  return (
    <section>
      <h2 className="text-3xl font-bold uppercase tracking-widest text-white mb-6">{title}</h2>
      
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 mb-4 space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-500" />
            </div>
            <input 
                type="text" 
                placeholder="Search by name, company, or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-900 placeholder-gray-500 focus:outline-none focus:bg-gray-800 focus:ring-1 ${ringColor} focus:border-${brandColorClass}-500 sm:text-sm text-white transition-colors duration-200`}
            />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor={`${brandColorClass}-sort`} className="text-sm font-medium text-gray-400 whitespace-nowrap">Sort by:</label>
            <select id={`${brandColorClass}-sort`} value={sort} onChange={e => setSort(e.target.value as any)} className={`bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 ${ringColor} w-full sm:w-auto`}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">{title.includes('Bookings') ? 'Name A-Z' : 'Company A-Z'}</option>
            </select>
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
            {(['All', ...statusOptions] as const).map(status => (
                <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${filter === status ? `${buttonActiveColor} text-black` : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}`}>
                {status}
                </button>
            ))}
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {currentItems.length > 0 ? currentItems.map(item => (
          <div key={item.id} className={`bg-gray-800/50 border border-${brandColorClass}-500/20 rounded-lg p-4 animate-fade-in`}>
            <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-lg truncate">{item.name || item.company}</span>
                    <span className="text-gray-400 font-normal text-sm truncate">({item.email})</span>
                    <button 
                        onClick={() => handleCopyEmail(item.email)} 
                        className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-gray-700 flex-shrink-0"
                        title="Copy Email"
                    >
                        <CopyIcon className="w-4 h-4" />
                    </button>
                </div>
                <p className={`text-sm text-${brandColorClass}-300`}>{item.packageTitle || item.projectType}</p>
                <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(item.submittedAt).toLocaleString()}</p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                <select
                  value={item.status || statusOptions[0]}
                  onChange={(e) => onStatusChange(item.id, e.target.value as Status)}
                  className={`text-sm rounded-md px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-transparent w-full sm:w-auto ${statusStyles[item.status || statusOptions[0]]}`}
                >
                  {statusOptions.map(opt => (
                     <option key={opt} value={opt} className="bg-gray-800 text-white">{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700/50">
              {item.date && <p className="text-sm">Date: <span className="font-semibold text-gray-300">{item.date}</span> at <span className="font-semibold text-gray-300">{item.time}</span></p>}
              <p className="text-sm mt-1 text-gray-400 italic">"{item.projectDetails || item.description || 'No details provided.'}"</p>
            </div>
          </div>
        )) : (
          <p className="text-center text-gray-500 italic py-4">
            {searchQuery ? `No matches for "${searchQuery}".` : `No '${filter}' ${title.toLowerCase()} found.`}
          </p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
           <span className="text-sm text-gray-400">
               Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedItems.length)} of {filteredAndSortedItems.length}
           </span>
           <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="flex items-center px-3 py-1 bg-gray-700/50 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  Previous
              </button>
              <div className="flex items-center px-2">
                  <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-1 bg-gray-700/50 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  Next
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
           </div>
        </div>
      )}
    </section>
  );
};
