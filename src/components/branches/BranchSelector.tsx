import React, { useState, useEffect } from 'react';
import { Building2, ChevronDown, Check, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBranches } from '@/hooks/useBranches';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface BranchSelectorProps {
  value: string | null;
  onChange: (branchId: string) => void;
  className?: string;
}

export default function BranchSelector({ value, onChange, className = '' }: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { branches, loading } = useBranches();
  const { getCurrentUserBranch } = useAuth();
  const userBranch = getCurrentUserBranch();
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.branch-selector')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get selected branch details
  const selectedBranch = branches.find(branch => branch.id === value);
  
  // Filter branches based on search
  const filteredBranches = branches.filter(branch => 
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelect = (branchId: string) => {
    onChange(branchId);
    setIsOpen(false);
    setSearchQuery('');
  };
  
  return (
    <div className={`relative branch-selector ${className}`}>
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          {selectedBranch ? (
            <span>{selectedBranch.name} - {selectedBranch.city}</span>
          ) : loading ? (
            <span>Loading branches...</span>
          ) : (
            <span>Select Branch</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search branches..."
                  className="pl-8 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading branches...
                </div>
              ) : filteredBranches.length > 0 ? (
                <div className="py-1">
                  {filteredBranches.map((branch) => (
                    <div
                      key={branch.id}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                        branch.id === value ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelect(branch.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            branch.id === userBranch?.id 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{branch.name}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              <span>{branch.city}, {branch.state}</span>
                            </div>
                          </div>
                        </div>
                        {branch.id === value && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No branches found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}