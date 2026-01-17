import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { getWorkspaceStats } from '../../lib/analytics/tracking';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { Eye, FilePlus, Layers, Activity, Loader2 } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      // Only try to fetch if we actually have a valid workspace ID
      if (currentWorkspace?.id) {
        setLoading(true);
        const data = await getWorkspaceStats(currentWorkspace.id);
        if (isMounted) {
          setStats(data);
          setLoading(false);
        }
      } else {
        // If no workspace, just show empty stats immediately without blocking UI
        setStats([]);
        setLoading(false);
      }
    };
    loadStats();
    return () => { isMounted = false; };
  }, [currentWorkspace?.id]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fbfbfa] dark:bg-[#191919] text-gray-500 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Removed the "No Workspace Selected" return block. 
  // Now it proceeds to render the dashboard with default 0 values if stats is empty.

  // Calculate totals safely
  const totals = stats.reduce((acc, day) => ({
    views: acc.views + (day.pageViews || 0),
    pages: acc.pages + (day.pagesCreated || 0),
    blocks: acc.blocks + (day.blocksCreated || 0),
  }), { views: 0, pages: 0, blocks: 0 });

  return (
    <div className="h-full flex flex-col bg-[#fbfbfa] dark:bg-[#191919] overflow-y-auto">
      {/* Header Area */}
      <div className="px-8 pt-8">
        <div className="mb-8 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Overview for <strong>{currentWorkspace?.name || 'Current Workspace'}</strong>
              </p>
            </div>
        </div>
      </div>
      
      <div className="px-8 pb-8 max-w-7xl w-full space-y-8">
        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.views}</div>
              <p className="text-xs text-muted-foreground text-gray-500">Last 14 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pages Created</CardTitle>
              <FilePlus className="h-4 w-4 text-muted-foreground text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.pages}</div>
              <p className="text-xs text-muted-foreground text-gray-500">New docs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocks Added</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.blocks}</div>
              <p className="text-xs text-muted-foreground text-gray-500">Content volume</p>
            </CardContent>
          </Card>

           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity Score</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(totals.views * 0.5 + totals.blocks * 0.1)}
              </div>
              <p className="text-xs text-muted-foreground text-gray-500">Calculated metric</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Chart 1: Area Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Page Views Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str ? str.substring(5) : ''} 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pageViews" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Bar Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Content Creation</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str ? str.substring(5) : ''} 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                     cursor={{ fill: 'transparent' }}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="pagesCreated" name="Pages" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="blocksCreated" name="Blocks" fill="#ffc658" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};