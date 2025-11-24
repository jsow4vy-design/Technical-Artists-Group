import React, { useMemo, useState } from 'react';
import type { DataItem } from '../../types';

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
}

export const DataTable: React.FC<DataTableProps> = ({ title, items, setItems, statusOptions, statusStyles, brandColorClass, onStatusChange }) => {
  const [sort, setSort] = useState<SortKey>('newest');
  const [filter, setFilter] = useState<Status | 'All'>('All');

  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter(item => filter === 'All' || (item.status || statusOptions[0]) === filter)
      .sort((a, b) => {
        if (sort === 'name') return (a.name || a.company!).localeCompare(b.name || b.company!);
        if (sort === 'oldest') return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(); // 'newest'
      });
  }, [items, sort, filter, statusOptions]);

  const ringColor = `focus:ring-${brandColorClass}-500`;
  const buttonActiveColor = `bg-${brandColorClass}-500`;

  return (
    <section>
      <h2 className="text-3xl font-bold uppercase tracking-widest text-white mb-6">{title}</h2>
      <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700/50 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor={`${brandColorClass}-sort`} className="text-sm font-medium text-gray-400">Sort by:</label>
          <select id={`${brandColorClass}-sort`} value={sort} onChange={e => setSort(e.target.value as any)} className={`bg-gray-700/50 border border-gray-600 rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-2 ${ringColor}`}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">{title.includes('Bookings') ? 'Name A-Z' : 'Company A-Z'}</option>
          </select>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['All', ...statusOptions] as const).map(status => (
            <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${filter === status ? `${buttonActiveColor} text-black` : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {filteredAndSortedItems.length > 0 ? filteredAndSortedItems.map(item => (
          <div key={item.id} className={`bg-gray-800/50 border border-${brandColorClass}-500/20 rounded-lg p-4`}>
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-bold">{item.name || item.company} <span className="text-gray-400 font-normal">({item.email})</span></p>
                <p className={`text-sm text-${brandColorClass}-300`}>{item.packageTitle || item.projectType}</p>
                <p className="text-xs text-gray-500 mt-1">Submitted: {new Date(item.submittedAt).toLocaleString()}</p>
              </div>
              <div className="flex-shrink-0">
                <select
                  value={item.status || statusOptions[0]}
                  onChange={(e) => onStatusChange(item.id, e.target.value as Status)}
                  className={`text-sm rounded-md px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-transparent ${statusStyles[item.status || statusOptions[0]]}`}
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
          <p className="text-center text-gray-500 italic py-4">No '{filter}' {title.toLowerCase()} found.</p>
        )}
      </div>
    </section>
  );
};
