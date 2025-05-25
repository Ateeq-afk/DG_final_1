import React, { useState } from 'react';
import { Calendar, FileText, Download, Filter, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import ReportPreview from './ReportPreview';
import { generateReport } from '@/lib/reports';

export type ReportType = 'bookings' | 'deliveries' | 'revenue' | 'performance';
export type ReportPeriod = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';
export type ReportFormat = 'pdf' | 'excel' | 'csv';

interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string[];
  branch?: string[];
  paymentType?: string[];
}

export default function ReportGenerator() {
  const [reportType, setReportType] = useState<ReportType>('bookings');
  const [period, setPeriod] = useState<ReportPeriod>('this_month');
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filters, setFilters] = useState<ReportFilters>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const { user } = useAuth();
  const { organizations } = useOrganizations();
  const organizationId = organizations[0]?.id;
  const { bookings } = useBookings(organizationId);

  const handleGenerateReport = async () => {
    if (!organizationId) {
      setError('Please select an organization first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await generateReport({
        type: reportType,
        period,
        format,
        filters: {
          startDate,
          endDate,
          ...filters
        },
        bookings,
        organizationId
      });

      setReportData(data);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  if (!organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Organization Selected</h3>
          <p className="text-gray-600 mt-1">Please select or create an organization first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-600 mt-1">Generate and analyze detailed reports</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Report Type */}
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bookings">Booking Report</SelectItem>
                  <SelectItem value="deliveries">Delivery Report</SelectItem>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Period */}
            <div>
              <Label>Time Period</Label>
              <Select value={period} onValueChange={(value) => setPeriod(value as ReportPeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="last_week">Last Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Format */}
            <div>
              <Label>Format</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as ReportFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label>Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>

        {reportData && (
          <div className="mt-8">
            <ReportPreview 
              data={reportData}
              type={reportType}
              format={format}
              onDownload={() => {
                // Handle download based on format
                console.log('Downloading report in', format, 'format');
              }}
            />
          </div>
        )}

        {/* Recent Reports */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Booking Report</h4>
                  <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}