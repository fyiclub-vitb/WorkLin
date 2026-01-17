import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Props that both chart components need
interface ChartProps {
  data: any[];
  title: string;
  description?: string;
  className?: string;
}

// This component shows page views over time as a nice gradient area chart
export const GrowthChart: React.FC<ChartProps> = ({ data, title, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {/* ResponsiveContainer makes the chart adapt to screen size */}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {/* This creates that cool gradient effect on the chart */}
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              {/* X-axis shows dates in a readable format (MM/DD) */}
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              
              {/* Y-axis for the numbers */}
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              
              {/* Those horizontal grid lines in the background */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              
              {/* Tooltip that shows up when you hover over the chart */}
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--background)', 
                  borderColor: 'var(--border)',
                  borderRadius: '6px'
                }}
              />
              
              {/* The actual area that gets filled with the gradient */}
              <Area 
                type="monotone" 
                dataKey="pageViews" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorViews)" 
                name="Page Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// This one shows pages and blocks created as bars - good for comparing two things
export const ActivityBarChart: React.FC<ChartProps> = ({ data, title, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              {/* Same date formatting as the area chart */}
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => {
                  const date = new Date(str);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              
              {/* Tooltip with a subtle highlight when you hover */}
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ 
                  backgroundColor: 'var(--background)', 
                  borderColor: 'var(--border)',
                  borderRadius: '6px'
                }}
              />
              
              {/* Legend shows which color means what */}
              <Legend />
              
              {/* Green bars for pages created */}
              <Bar dataKey="pagesCreated" name="Pages Created" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              
              {/* Yellow bars for blocks created */}
              <Bar dataKey="blocksCreated" name="Blocks Created" fill="#ffc658" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};