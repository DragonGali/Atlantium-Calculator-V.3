/**
 * SimpleChart.jsx
 *
 * A reusable chart component using Chart.js for line or bar charts.
 * 
 * Props:
 * - labels: Array of X-axis labels
 * - datasets: Array of { label, data } for each series
 * - type: 'line' or 'bar'
 * - title: Chart title
 * - xTitle: X-axis label
 * - yTitle: Y-axis label
 *
 * Features:
 * - Uses CSS variables for colors
 * - Supports multiple datasets with auto-assigned colors
 * - Responsive and non-animated for fast updates
 */


import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import '../Styles/SimpleChart.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

// Helper to read CSS variables
const getCSSVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Simple Chart Component
 *
 * @param {Array} labels - X-axis labels
 * @param {Array} datasets - Array of { label, data } objects
 * @param {string} type - Chart type ('line' or 'bar')
 * @param {string} title - Chart title
 * @param {string} xTitle - X-axis title
 * @param {string} yTitle - Y-axis title
 */
const SimpleChart = ({
  labels,
  datasets = [],
  type = 'line',
  title = '',
  xTitle = '',
  yTitle = ''
}) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !labels || !datasets.length) return;

    // Resolve CSS colors (palette)
    const highlight = getCSSVar('--highlight');
    const primary = getCSSVar('--primary');
    const greyBlue = getCSSVar('--grey-blue');
    const red = 'red'; // explicit red
    const green = 'green'
    const altColors = [highlight, green, red];

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');

    // Map datasets with colors
    const chartData = {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: altColors[i % altColors.length],
        backgroundColor:
          type === 'line' ? 'transparent' : altColors[i % altColors.length],
        pointBackgroundColor: altColors[i % altColors.length],
        pointBorderColor: getCSSVar('--white'),
        pointBorderWidth: 2,
        borderWidth: 2,
        fill: false
      }))
    };

    // Chart options
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animations: false,
      plugins: {
        title: {
          display: !!title,
          text: title,
          color: getCSSVar('--text'),
          font: { size: 16, weight: 'bold' }
        },
        legend: {
          display: true,
          labels: {
            color: getCSSVar('--text')
          }
        },
        tooltip: {
          backgroundColor: getCSSVar('--white'),
          titleColor: getCSSVar('--text'),
          bodyColor: getCSSVar('--text'),
          borderColor: getCSSVar('--grey-blue'),
          borderWidth: 1
        }
      },
      scales: {
        x: {
          title: {
            display: !!xTitle,
            text: xTitle,
            color: getCSSVar('--highlight'),
            font: { size: 14, weight: 'bold' }
          },
          ticks: { color: getCSSVar('--blue-text') },
          grid: { color: getCSSVar('--grey-blue') }
        },
        y: {
          title: {
            display: !!yTitle,
            text: yTitle,
            color: getCSSVar('--highlight'),
            font: { size: 14, weight: 'bold' }
          },
          ticks: { color: getCSSVar('--blue-text') },
          grid: { color: getCSSVar('--grey-blue') }
        }
      },
      elements: {
        point: { radius: type === 'line' ? 4 : 0 }
      }
    };

    // Create chart
    chartRef.current = new ChartJS(ctx, {
      type,
      data: chartData,
      options
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [labels, datasets, type, title, xTitle, yTitle]);

  return (
    <div className="chart-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default SimpleChart;
