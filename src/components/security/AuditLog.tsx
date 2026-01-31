import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FileText, Download, Filter, Search } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { auth } from '../../lib/firebase/config';
import { logExport, AuditAction, AuditStatus } from '../../lib/security/audit';
import { useToast } from '../../hooks/use-toast';

interface AuditLogEntry {
  id: string;
  userId: string;
  actorRole: 'user' | 'admin' | 'system';
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  status: AuditStatus;
  ip: string;
  userAgent?: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

// This component shows a log of all security-related events
// Like login attempts, password changes, data exports, etc.
export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const logsPerPage = 50;
  const { toast } = useToast();

  // Load logs whenever filters change
  useEffect(() => {
    loadLogs();
  }, [filterAction, filterStatus, dateFrom, dateTo, currentPage]);

  // Fetch audit logs from Firestore
  const loadLogs = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      let q = query(
        collection(db, 'auditLogs'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(logsPerPage * currentPage)
      );

      const snapshot = await getDocs(q);
      let filteredLogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuditLogEntry[];

      // Apply filters on the client side
      // (Firestore doesn't support complex queries well)
      if (filterAction !== 'all') {
        filteredLogs = filteredLogs.filter((log) => log.action === filterAction);
      }
      if (filterStatus !== 'all') {
        filteredLogs = filteredLogs.filter((log) => log.status === filterStatus);
      }
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp.toMillis() >= fromDate.getTime()
        );
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filteredLogs = filteredLogs.filter(
          (log) => log.timestamp.toMillis() <= toDate.getTime()
        );
      }

      setLogs(filteredLogs);
      setHasMore(snapshot.docs.length === logsPerPage * currentPage);
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Export logs to CSV file
  const handleExport = async () => {
    try {
      // Create CSV content
      const headers = ['Timestamp', 'Action', 'Status', 'IP', 'User Agent', 'Metadata'];
      const rows = logs.map((log) => [
        new Date(log.timestamp.toMillis()).toISOString(),
        log.action,
        log.status,
        log.ip,
        log.userAgent || '',
        JSON.stringify(log.metadata || {}),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log this export action to the audit log
      await logExport('CSV', logs.length);

      toast({
        title: 'Export Successful',
        description: `Exported ${logs.length} audit log entries`,
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export audit logs',
        variant: 'destructive',
      });
    }
  };

  // Color code based on status (success, failed, blocked)
  const getStatusColor = (status: AuditStatus) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'FAILED':
      case 'FAIL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'BLOCKED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Format Firestore timestamp to readable string
  const formatDate = (timestamp: Timestamp) => {
    return new Date(timestamp.toMillis()).toLocaleString();
  };

  // All possible audit actions
  const actionOptions: AuditAction[] = [
    'LOGIN',
    'LOGOUT',
    'PASSWORD_CHANGE',
    'PROFILE_UPDATE',
    'DATA_EXPORT',
    '2FA_ENABLE',
    '2FA_DISABLE',
    '2FA_VERIFY',
    'SECURITY_SETTINGS_UPDATE',
    'SECURITY_ALERT_CREATED',
  ];

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Audit Log
        </h1>
        <Button onClick={handleExport} disabled={logs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filter controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Action filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Action</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Actions</option>
                {actionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="FAIL">Fail</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
            
            {/* Date range filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit log table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>
            Showing {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Timestamp</th>
                    <th className="text-left p-3 text-sm font-medium">Action</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">IP</th>
                    <th className="text-left p-3 text-sm font-medium">User Agent</th>
                    <th className="text-left p-3 text-sm font-medium">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{formatDate(log.timestamp)}</td>
                      <td className="p-3 text-sm font-medium">{log.action}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-sm font-mono text-xs">{log.ip}</td>
                      <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                        {log.userAgent || '-'}
                      </td>
                      <td className="p-3 text-sm">
                        {log.metadata ? (
                          <details className="cursor-pointer">
                            <summary className="text-muted-foreground hover:text-foreground">
                              View
                            </summary>
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-md">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination controls */}
          {logs.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {currentPage}</span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!hasMore || loading}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
