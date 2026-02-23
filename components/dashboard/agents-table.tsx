'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getWhatsAppLink } from '@/lib/utils';
import { ExternalLink, MessageCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface Agent {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  propertyTypes: string[];
  isLead: boolean;
  profileUrl?: string | null;
}

interface AgentsTableProps {
  agents: Agent[];
}

export function AgentsTable({ agents }: AgentsTableProps) {
  const [locationFilter, setLocationFilter] = useState('');

  const columns: ColumnDef<Agent>[] = [
    {
      accessorKey: 'name',
      header: 'Agent Name',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        const phone = row.getValue('phone') as string;
        return phone ? (
          <div className="flex items-center gap-2">
            <span>{phone}</span>
            <a
              href={getWhatsAppLink(phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-700"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.getValue('email') || '-',
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => row.getValue('location') || '-',
    },
    {
      accessorKey: 'isLead',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            row.getValue('isLead')
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.getValue('isLead') ? 'Lead' : 'Agent'}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const profileUrl = row.original.profileUrl;
        return profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null;
      },
    },
  ];

  const table = useReactTable({
    data: agents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: locationFilter,
    },
    onGlobalFilterChange: setLocationFilter,
  });

  const exportToCSV = () => {
    const csv = Papa.unparse(agents);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agents-${new Date().toISOString()}.csv`;
    a.click();
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(agents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agents');
    XLSX.writeFile(workbook, `agents-${new Date().toISOString()}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            Export CSV
          </Button>
          <Button onClick={exportToExcel} variant="outline" size="sm">
            Export Excel
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
