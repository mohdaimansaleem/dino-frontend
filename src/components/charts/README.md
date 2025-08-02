# Dashboard Charts

This directory contains chart components built with Chart.js and react-chartjs-2.

## Components

### WeeklyRevenueChart
- **Type**: Bar Chart with dual Y-axis
- **Purpose**: Shows weekly revenue and order trends
- **Data**: `{ day: string, revenue: number, orders: number }[]`

### StatusPieChart
- **Type**: Pie Chart
- **Purpose**: Shows status distribution (tables, orders, etc.)
- **Data**: `{ name: string, value: number, color: string }[]`

### SimpleBarChart
- **Type**: Bar Chart
- **Purpose**: Shows simple categorical data
- **Data**: `{ name: string, value: number, color: string }[]`

## Usage

```tsx
import { WeeklyRevenueChart, StatusPieChart, SimpleBarChart } from '../charts/ChartComponents';

// Weekly Revenue Chart
<WeeklyRevenueChart data={weeklyData} height={300} />

// Pie Chart
<StatusPieChart data={statusData} height={250} />

// Simple Bar Chart
<SimpleBarChart data={categoryData} height={200} />
```

## Features

- ✅ Responsive design
- ✅ Interactive tooltips
- ✅ Custom colors
- ✅ Dual Y-axis support (revenue chart)
- ✅ Percentage calculations (pie charts)
- ✅ Professional styling
- ✅ TypeScript support