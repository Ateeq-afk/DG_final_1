import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        <p className="text-gray-500 mt-2">Please wait while we set things up</p>
      </div>
    </div>
  );
}