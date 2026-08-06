import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#f97316', '#22c55e', '#8b5cf6', '#f59e0b', '#0ea5e9', '#ef4444', '#14b8a6', '#e11d48', '#6366f1'];

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const chartTooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-md)',
  fontSize: 13,
};

const ChartCard = ({ title, subtitle, children, height = 280 }) => (
  <div className="chart-card">
    <div className="chart-header">
      <h4>{title}</h4>
      {subtitle && <span>{subtitle}</span>}
    </div>
    <div style={{ height, width: '100%' }}>{children}</div>
  </div>
);

export const MonthlyPurchaseChart = ({ data }) => (
  <ChartCard title="Monthly Purchase Amount" subtitle="Last 12 months">
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={money} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={70} />
        <Tooltip formatter={(v) => money(v)} cursor={{ fill: '#eff6ff' }} contentStyle={chartTooltipStyle} />
        <Bar dataKey="value" name="Purchase" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const MonthlyOrdersChart = ({ data }) => (
  <ChartCard title="Monthly Orders" subtitle="Order count by month">
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={(v) => Number(v)} cursor={{ fill: '#fff7ed' }} contentStyle={chartTooltipStyle} />
        <Bar dataKey="value" name="Orders" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const MonthlyPointsChart = ({ data }) => (
  <ChartCard title="Monthly Reward Points" subtitle="Points earned by month">
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip formatter={(v) => Number(v)} contentStyle={chartTooltipStyle} />
        <Line type="monotone" dataKey="value" name="Points" stroke="#22c55e" strokeWidth={3} dot={{ r: 3, fill: '#22c55e' }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

export const CategoryPieChart = ({ data }) => (
  <ChartCard title="Product Category Distribution" subtitle="By purchase value">
    {data.length === 0 ? (
      <div className="empty-state compact">No data</div>
    ) : (
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="78%" paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => money(v)} contentStyle={chartTooltipStyle} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    )}
  </ChartCard>
);

export const BrandBarChart = ({ data }) => (
  <ChartCard title="Brand-wise Purchases" subtitle="Top brands by value">
    <ResponsiveContainer>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
        <XAxis type="number" tickFormatter={money} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: '#334155' }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => money(v)} contentStyle={chartTooltipStyle} cursor={{ fill: '#eff6ff' }} />
        <Bar dataKey="value" name="Purchase" fill="#0ea5e9" radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);
