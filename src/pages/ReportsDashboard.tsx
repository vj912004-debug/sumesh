import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function ReportsDashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string, path: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
    navigate(path);
  };

  const salesData = [
    { month: 'Jan', sales: 40, target: 50 },
    { month: 'Feb', sales: 65, target: 50 },
    { month: 'Mar', sales: 85, target: 60 },
    { month: 'Apr', sales: 55, target: 70 },
    { month: 'May', sales: 90, target: 80 },
    { month: 'Jun', sales: 110, target: 90 },
  ];

  const metricCards = [
    { label: 'Total Revenue (YTD)', value: '₹ 4.2 Cr', sub: '+12% from last year', path: '/sales/invoice-entry' },
    { label: 'Pending Orders', value: '14', sub: 'Worth ₹ 1.1 Cr', path: '/sales/orders' },
    { label: 'Machines in Prod.', value: '8', sub: '3 behind schedule', path: '/production/list' },
    { label: 'Inventory Value', value: '₹ 85 L', sub: 'Raw Materials + FG', path: '/inventory' },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Management Dashboard</h2>
          <p className="text-muted-foreground">High-level insights into Sales, Production, and Inventory.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(card => (
          <button
            key={card.label}
            type="button"
            onClick={() => notify(`Opening ${card.label}`, card.path)}
            className="rounded-xl border bg-card text-card-foreground shadow-sm text-left p-6 cursor-pointer transition-all hover:shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <div className="text-2xl font-bold mt-2">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Performance vs Targets (in Lakhs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" name="Actual Sales" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#94a3b8" name="Target" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
