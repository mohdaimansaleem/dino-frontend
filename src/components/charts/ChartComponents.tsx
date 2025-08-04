import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { getConfigValue } from '../../config/runtime';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface BarChartProps {
  data: Array<{ day: string; revenue: number; orders: number }>;
  height?: number;
}

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number;
}

export const WeeklyRevenueChart: React.FC<BarChartProps> = ({ data, height = 300 }) => {
  const [animationKey, setAnimationKey] = useState(0);

  // Auto-refresh animation every configured interval
  useEffect(() => {
    if (!getConfigValue('CHART_ANIMATIONS_ENABLED')) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, getConfigValue('CHART_ANIMATION_INTERVAL'));

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: data.map(item => item.day),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: data.map(item => item.revenue),
        backgroundColor: 'rgba(76, 175, 80, 0.8)', // Green
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        label: 'Orders',
        data: data.map(item => item.orders),
        backgroundColor: 'rgba(33, 150, 243, 0.8)', // Blue
        borderColor: 'rgba(33, 150, 243, 1)',
        borderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: getConfigValue('CHART_ANIMATION_DURATION'),
      easing: getConfigValue('CHART_ANIMATION_EASING') as any,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#333333',
          font: {
            weight: 'bold' as const,
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            if (context.datasetIndex === 0) {
              return `Revenue: ₹${context.parsed.y.toLocaleString()}`;
            } else {
              return `Orders: ${context.parsed.y}`;
            }
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Revenue (₹)',
          color: '#666666',
          font: {
            weight: 'bold' as const,
          }
        },
        ticks: {
          color: '#666666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Orders',
          color: '#666666',
          font: {
            weight: 'bold' as const,
          }
        },
        ticks: {
          color: '#666666',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        ticks: {
          color: '#666666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar key={animationKey} data={chartData} options={options} />
    </div>
  );
};

export const StatusPieChart: React.FC<PieChartProps> = ({ data, height = 250 }) => {
  const [animationKey, setAnimationKey] = useState(0);
  
  // Auto-refresh animation every configured interval
  useEffect(() => {
    if (!getConfigValue('CHART_ANIMATIONS_ENABLED')) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, getConfigValue('CHART_ANIMATION_INTERVAL'));

    return () => clearInterval(interval);
  }, []);

  // Light color palette for pie charts
  const lightColors = [
    '#FFAB91', // Light Orange
    '#A5D6A7', // Light Green
    '#FFE082', // Light Yellow
    '#CE93D8', // Light Purple
    '#F8BBD9', // Light Pink
    '#80DEEA', // Light Cyan
  ];

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color || lightColors[data.indexOf(item) % lightColors.length]),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: getConfigValue('CHART_ANIMATION_DURATION'),
      easing: getConfigValue('CHART_ANIMATION_EASING') as any,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#333333',
          font: {
            weight: 'bold' as const,
          },
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Pie key={animationKey} data={chartData} options={options} />
    </div>
  );
};

export const DonutChart: React.FC<PieChartProps> = ({ data, height = 250 }) => {
  const [animationKey, setAnimationKey] = useState(0);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Auto-refresh animation every configured interval
  useEffect(() => {
    if (!getConfigValue('CHART_ANIMATIONS_ENABLED')) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, getConfigValue('CHART_ANIMATION_INTERVAL'));

    return () => clearInterval(interval);
  }, []);
  
  // Light colorful palette for donut chart
  const colors = [
    '#81C784', // Light Green
    '#64B5F6', // Light Blue
    '#FFB74D', // Light Orange
    '#BA68C8', // Light Purple
    '#F06292', // Light Pink
    '#4DD0E1', // Light Cyan
  ];

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map((item, index) => colors[index % colors.length]),
        borderColor: '#ffffff',
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%', // This makes it a donut chart
    animation: {
      duration: getConfigValue('CHART_ANIMATION_DURATION'),
      easing: getConfigValue('CHART_ANIMATION_EASING') as any,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#333333',
          font: {
            weight: 'bold' as const,
          },
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <Pie key={animationKey} data={chartData} options={options} />
      {/* Center text showing total */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none',
        zIndex: 10
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#333333',
          lineHeight: '1.2'
        }}>
          {total}
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#666666',
          marginTop: '4px'
        }}>
          Total Orders
        </div>
      </div>
    </div>
  );
};

export const SimpleBarChart: React.FC<{ data: Array<{ name: string; value: number; color: string }>, height?: number }> = ({ data, height = 200 }) => {
  const [animationKey, setAnimationKey] = useState(0);

  // Auto-refresh animation every configured interval
  useEffect(() => {
    if (!getConfigValue('CHART_ANIMATIONS_ENABLED')) return;

    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, getConfigValue('CHART_ANIMATION_INTERVAL'));

    return () => clearInterval(interval);
  }, []);

  // Colorful palette for better visual appeal
  const colors = [
    'rgba(76, 175, 80, 0.8)',   // Green
    'rgba(33, 150, 243, 0.8)',  // Blue
    'rgba(255, 152, 0, 0.8)',   // Orange
    'rgba(156, 39, 176, 0.8)',  // Purple
    'rgba(244, 67, 54, 0.8)',   // Red
  ];

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Count',
        data: data.map(item => item.value),
        backgroundColor: data.map((item, index) => colors[index % colors.length]),
        borderColor: data.map((item, index) => colors[index % colors.length].replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: getConfigValue('CHART_ANIMATION_DURATION'),
      easing: getConfigValue('CHART_ANIMATION_EASING') as any,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#cccccc',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#666666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'Count',
          color: '#666666',
          font: {
            weight: 'bold' as const,
          }
        }
      },
      x: {
        ticks: {
          color: '#666666',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      }
    },
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Bar key={animationKey} data={chartData} options={options} />
    </div>
  );
};