import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportType, ReportFormat } from './ReportGenerator';
import BookingReport from './types/BookingReport';
import DeliveryReport from './types/DeliveryReport';
import RevenueReport from './types/RevenueReport';
import PerformanceReport from './types/PerformanceReport';

interface Props {
  data: any;
  type: ReportType;
  format: ReportFormat;
  onDownload: () => void;
}

export default function ReportPreview({ data, type, format, onDownload }: Props) {
  const renderReport = () => {
    switch (type) {
      case 'bookings':
        return <BookingReport data={data} />;
      case 'deliveries':
        return <DeliveryReport data={data} />;
      case 'revenue':
        return <RevenueReport data={data} />;
      case 'performance':
        return <PerformanceReport data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Report Preview</h3>
          <Button onClick={onDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download {format.toUpperCase()}
          </Button>
        </div>
      </div>
      <div className="p-6">{renderReport()}</div>
    </div>
  );
}