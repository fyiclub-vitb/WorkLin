import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FileText, Download, Filter } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { auth } from '../../lib/firebase/config';
import { logExport } from '../../lib/security/audit';
import { useToast } from '../../hooks/use-toast';
export const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterAction, setFilterAction] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const logsPerPage = 50;
    const { toast } = useToast();
    useEffect(() => {
        loadLogs();
    }, [filterAction, filterStatus, dateFrom, dateTo, currentPage]);
    const loadLogs = async () => {
        const user = auth.currentUser;
        if (!user)
            return;
        setLoading(true);
        try {
            let q = query(collection(db, 'auditLogs'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(logsPerPage * currentPage));
            // Note: Firestore doesn't support multiple where clauses with different fields easily
            // For production, consider using composite indexes or filtering client-side
            const snapshot = await getDocs(q);
            let filteredLogs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Client-side filtering
            if (filterAction !== 'all') {
                filteredLogs = filteredLogs.filter((log) => log.action === filterAction);
            }
            if (filterStatus !== 'all') {
                filteredLogs = filteredLogs.filter((log) => log.status === filterStatus);
            }
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                filteredLogs = filteredLogs.filter((log) => log.timestamp.toMillis() >= fromDate.getTime());
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                filteredLogs = filteredLogs.filter((log) => log.timestamp.toMillis() <= toDate.getTime());
            }
            setLogs(filteredLogs);
            setHasMore(snapshot.docs.length === logsPerPage * currentPage);
        }
        catch (error) {
            console.error('Error loading audit logs:', error);
            toast({
                title: 'Error',
                description: 'Failed to load audit logs',
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
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
            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            // Log the export action
            await logExport('CSV', logs.length);
            toast({
                title: 'Export Successful',
                description: `Exported ${logs.length} audit log entries`,
            });
        }
        catch (error) {
            toast({
                title: 'Export Failed',
                description: error.message || 'Failed to export audit logs',
                variant: 'destructive',
            });
        }
    };
    const getStatusColor = (status) => {
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
    const formatDate = (timestamp) => {
        return new Date(timestamp.toMillis()).toLocaleString();
    };
    const actionOptions = [
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
    return (_jsxs("div", { className: "container mx-auto p-6 space-y-6 max-w-7xl", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [_jsx(FileText, { className: "h-8 w-8" }), "Audit Log"] }), _jsxs(Button, { onClick: handleExport, disabled: logs.length === 0, children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export CSV"] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "h-5 w-5" }), "Filters"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Action" }), _jsxs("select", { className: "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", value: filterAction, onChange: (e) => {
                                                setFilterAction(e.target.value);
                                                setCurrentPage(1);
                                            }, children: [_jsx("option", { value: "all", children: "All Actions" }), actionOptions.map((action) => (_jsx("option", { value: action, children: action }, action)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Status" }), _jsxs("select", { className: "w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm", value: filterStatus, onChange: (e) => {
                                                setFilterStatus(e.target.value);
                                                setCurrentPage(1);
                                            }, children: [_jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "SUCCESS", children: "Success" }), _jsx("option", { value: "FAILED", children: "Failed" }), _jsx("option", { value: "FAIL", children: "Fail" }), _jsx("option", { value: "BLOCKED", children: "Blocked" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "From Date" }), _jsx(Input, { type: "date", value: dateFrom, onChange: (e) => {
                                                setDateFrom(e.target.value);
                                                setCurrentPage(1);
                                            } })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "To Date" }), _jsx(Input, { type: "date", value: dateTo, onChange: (e) => {
                                                setDateTo(e.target.value);
                                                setCurrentPage(1);
                                            } })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Audit Log Entries" }), _jsxs(CardDescription, { children: ["Showing ", logs.length, " ", logs.length === 1 ? 'entry' : 'entries'] })] }), _jsxs(CardContent, { children: [loading ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Loading..." })) : logs.length === 0 ? (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No audit logs found" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b", children: [_jsx("th", { className: "text-left p-3 text-sm font-medium", children: "Timestamp" }), _jsx("th", { className: "text-left p-3 text-sm font-medium", children: "Action" }), _jsx("th", { className: "text-left p-3 text-sm font-medium", children: "Status" }), _jsx("th", { className: "text-left p-3 text-sm font-medium", children: "IP" }), _jsx("th", { className: "text-left p-3 text-sm font-medium", children: "User Agent" }), _jsx("th", { className: "text-left p-3 text-sm font-medium", children: "Metadata" })] }) }), _jsx("tbody", { children: logs.map((log) => (_jsxs("tr", { className: "border-b hover:bg-muted/50", children: [_jsx("td", { className: "p-3 text-sm", children: formatDate(log.timestamp) }), _jsx("td", { className: "p-3 text-sm font-medium", children: log.action }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`, children: log.status }) }), _jsx("td", { className: "p-3 text-sm font-mono text-xs", children: log.ip }), _jsx("td", { className: "p-3 text-sm text-muted-foreground max-w-xs truncate", children: log.userAgent || '-' }), _jsx("td", { className: "p-3 text-sm", children: log.metadata ? (_jsxs("details", { className: "cursor-pointer", children: [_jsx("summary", { className: "text-muted-foreground hover:text-foreground", children: "View" }), _jsx("pre", { className: "mt-2 text-xs bg-muted p-2 rounded overflow-auto max-w-md", children: JSON.stringify(log.metadata, null, 2) })] })) : ('-') })] }, log.id))) })] }) })), logs.length > 0 && (_jsxs("div", { className: "flex items-center justify-between mt-4", children: [_jsx(Button, { variant: "outline", onClick: () => setCurrentPage((p) => Math.max(1, p - 1)), disabled: currentPage === 1 || loading, children: "Previous" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["Page ", currentPage] }), _jsx(Button, { variant: "outline", onClick: () => setCurrentPage((p) => p + 1), disabled: !hasMore || loading, children: "Next" })] }))] })] })] }));
};
