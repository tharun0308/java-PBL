import { Complaint } from './types';
import { formatDate } from './utils';
import { getComplaintSla } from './sla';

export function exportComplaintsToCsv(complaints: Complaint[], filename?: string): void {
  const headers = [
    'Complaint Number',
    'Category',
    'Location',
    'Priority',
    'Status',
    'Assigned To',
    'Reported By',
    'Reporter Email',
    'Submitted On',
    'Last Updated',
    'SLA Status',
    'Rating (1-5)',
    'Resolution Note',
    'Description',
  ];

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = complaints.map((c) => {
    const sla = getComplaintSla(c);
    const formattedId = `#SCMS-${String(c.complaint_number).padStart(4, '0')}`;

    return [
      escapeCsv(formattedId),
      escapeCsv(c.category),
      escapeCsv(c.location),
      escapeCsv(c.priority),
      escapeCsv(c.status),
      escapeCsv(c.assigned_to || 'Unassigned'),
      escapeCsv(c.user?.full_name || 'N/A'),
      escapeCsv(c.user?.email || 'N/A'),
      escapeCsv(formatDate(c.created_at)),
      escapeCsv(formatDate(c.updated_at)),
      escapeCsv(sla.label),
      escapeCsv(c.rating ? `${c.rating} Stars` : 'Unrated'),
      escapeCsv(c.resolution_note || 'None'),
      escapeCsv(c.description),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const dateStr = new Date().toISOString().split('T')[0];
  const downloadName = filename || `scms-complaints-report-${dateStr}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', downloadName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
