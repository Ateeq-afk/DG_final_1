import React, { useState } from 'react';
import { Search, QrCode, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useBookings } from '@/hooks/useBookings';

interface Props {
  organizationId: string;
  onClose: () => void;
  onLoad: (selectedLRs: string[]) => void;
  selectedLRs: string[];
}

export default function LRSelectionList({ organizationId, onClose, onLoad, selectedLRs }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const { bookings, loading } = useBookings(organizationId);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Only show bookings that are in 'booked' status
  const availableBookings = bookings.filter(booking => booking.status === 'booked');

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedBookings = React.useMemo(() => {
    if (!sortConfig) return availableBookings;
    
    return [...availableBookings].sort((a, b) => {
      if (sortConfig.key === 'lr_number') {
        return sortConfig.direction === 'asc' 
          ? a.lr_number.localeCompare(b.lr_number)
          : b.lr_number.localeCompare(a.lr_number);
      }
      return 0;
    });
  }, [availableBookings, sortConfig]);

  const filteredBookings = sortedBookings.filter(booking =>
    booking.lr_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.sender?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.receiver?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onLoad(filteredBookings.map(b => b.id));
    } else {
      onLoad([]);
    }
  };

  const handleSelectLR = (id: string) => {
    const newSelection = selectedLRs.includes(id)
      ? selectedLRs.filter(lrId => lrId !== id)
      : [...selectedLRs, id];
    onLoad(newSelection);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8">
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[95%] max-w-7xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Select LRs to Load</h2>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search by LR number, sender, or receiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <QrCode className="h-5 w-5" />
              Scan
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedLRs.length === filteredBookings.length}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-gray-600 cursor-pointer"
                  onClick={() => handleSort('lr_number')}
                >
                  <div className="flex items-center gap-2">
                    LR No
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">From</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">To</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sender</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Receiver</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Article</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedLRs.includes(booking.id)}
                      onCheckedChange={() => handleSelectLR(booking.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{booking.lr_number}</td>
                  <td className="px-4 py-3 text-sm">{booking.from_branch?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">{booking.to_branch?.name || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{booking.sender?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{booking.sender?.mobile || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium">{booking.receiver?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-600">{booking.receiver?.mobile || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{booking.article?.name || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm text-right">₹{booking.total_amount.toFixed(2)}</td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Selected: {selectedLRs.length} LRs
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={() => onLoad(selectedLRs)}
                disabled={selectedLRs.length === 0}
              >
                Load Selected
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}