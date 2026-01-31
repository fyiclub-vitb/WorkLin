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
  // Get the current workspace from our global state
  const { currentWorkspace } = useWorkspaceStore();
  
  // Store the stats we fetch from the backend
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch stats whenever the workspace changes
  useEffect(() => {
    let isMounted = true; // This prevents updating state if component unmounts
    
    const loadStats = async () => {
      // Only fetch if we actually have a workspace
      if (currentWorkspace?.id) {
        setLoading(true);
        const data = await getWorkspaceStats(currentWorkspace.id);
        
        // Only update if the component is still on screen
        if (isMounted) {
          setStats(data);
          setLoading(false);
        }
      } else {
        // No workspace selected, just show empty stats
        setStats([]);
        setLoading(false);
      }
    };
    
    loadStats();
    
    // Cleanup function runs when component unmounts
    return () => { isMounted = false; };
  }, [currentWorkspace?.id]);

  // Show a loading spinner while we fetch data
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fbfbfa] dark:bg-[#191919] text-gray-500 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Add up all the numbers from our stats to show totals
  const totals = stats.reduce((acc, day) => ({
    views: acc.views + (day.pageViews || 0),
    pages: acc.pages + (day.pagesCreated || 0),
    blocks: acc.blocks + (day.blocksCreated || 0),
  }), { views: 0, pages: 0, blocks: 0 });

  return (
    <div className="h-full flex flex-col bg-[#fbfbfa] dark:bg-[#191919] overflow-y-auto">
      {/* Top section with the title and workspace name */}
      <div className="px-8 pt-8">
        <div className="mb-8 flex items-center gap-3">
          {/* Icon with a nice blue background */}
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
        {/* Four metric cards showing quick stats */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* Total page views card */}
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
          
          {/* Pages created card */}
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

          {/* Blocks added card */}
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

          {/* Activity score - just a calculated metric based on views and blocks */}
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

        {/* Two charts side by side */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Area chart showing page views over time */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Page Views Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats}>
                  {/* Gradient definition for the blue fill */}
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  
                  {/* Show dates on X-axis, cutting off the year part */}
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str ? str.substring(5) : ''} 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  
                  {/* Nice rounded tooltip that pops up on hover */}
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  
                  {/* The blue area showing page views */}
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

          {/* Bar chart comparing pages vs blocks created */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Content Creation</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  
                  {/* Same date formatting as the area chart */}
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => str ? str.substring(5) : ''} 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  
                  {/* Transparent cursor so it doesn't block the bars */}
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  
                  <Legend />
                  
                  {/* Green bars for pages, yellow bars for blocks */}
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