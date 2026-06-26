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

const getCSSVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const SimpleChart = ({ chartData }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartData || !chartData.data) return;

    const {
      chart_type,
      x_label,
      y_label,
      data: { x_axis, curves }
    } = chartData;

    const labels = x_axis;
    const datasets = Object.values(curves).map((curve) => ({
      label: curve.label || curve.flow || 'Dataset',
      data: curve.data
    }));

    // Calculate dynamic axis ranges
    const calculateAxisRanges = () => {
      const isValidNumber = (val) => {
        if (val === null || val === undefined) return false;
        const num = parseFloat(val);
        return !isNaN(num) && isFinite(num);
      };

      const validXValues = [];
      const validYValues = [];

      x_axis.forEach((xVal, index) => {
        const hasValidY = datasets.some(ds => isValidNumber(ds.data[index]));
        if (hasValidY && isValidNumber(xVal)) {
          validXValues.push(parseFloat(xVal));
          datasets.forEach(ds => {
            if (isValidNumber(ds.data[index])) {
              validYValues.push(parseFloat(ds.data[index]));
            }
          });
        }
      });

      if (!validXValues.length || !validYValues.length) {
        return { xMin: undefined, xMax: undefined, yMin: undefined, yMax: undefined };
      }

      const xMin = Math.min(...validXValues);
      const xMax = Math.max(...validXValues);
      const yMin = Math.min(...validYValues);
      const yMax = Math.max(...validYValues);
      const xRange = xMax - xMin;
      const yRange = yMax - yMin;
      const xMargin = xRange > 0 ? xRange * 0.01 : 0.01;
      const yMargin = yRange > 0 ? yRange * 0.01 : 0.01;

      return {
        xMin: xMin - xMargin,
        xMax: xMax + xMargin,
        yMin: yMin - yMargin,
        yMax: yMax + yMargin
      };
    };

    const axisRanges = calculateAxisRanges();

    // Colors
    const highlight = getCSSVar('--highlight');
    const primary = getCSSVar('--primary');
    const greyBlue = getCSSVar('--grey-blue');
    const red = 'red';
    const green = 'green';
    const altColors = [highlight, green, red, primary, greyBlue];

    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext('2d');

    const chartConfig = {
      labels,
      datasets: datasets.map((ds, i) => ({
        label: ds.label,
        data: ds.data,
        borderColor: altColors[i % altColors.length],
        borderWidth: 3,
        pointRadius: 2,
        tension: 0.4,
        cubicInterpolationMode: 'monotone',
        fill: false
      }))
    };

    // --- Responsive Floating Legend Plugin ---
    const floatingLegend = {
      id: 'floatingLegend',
      afterDraw(chart, args, opts) {
        const { ctx, chartArea } = chart;
        const { left, top, right } = chartArea;
        const { backgroundColor, borderColor, borderWidth, textColor } = opts;

        const items = chart.data.datasets.map((ds) => ({
          text: `${ds.label} ${chart_type === 'RED vs UVT₂₅₄' ? `(${curves[ds.label].flow}[m³/h])` : ''}`,
          color: ds.borderColor
        }));

        // Dynamic scaling factor
        const scale = Math.max(0.6, Math.min(1, chart.width / 800));
        const fontSize = 12 * scale;
        const paddingX = 10 * scale;
        const paddingY = 8 * scale;
        const lineHeight = 18 * scale;

        ctx.save();
        ctx.font = `${fontSize}px sans-serif`;

        const textWidths = items.map(item => ctx.measureText(item.text).width);
        const boxWidth = Math.max(...textWidths) + 40 * scale;
        const boxHeight = items.length * lineHeight + paddingY * 2;

        const isFlowChart = chart_type && chart_type.toLowerCase().includes('flow');
        const boxX = isFlowChart ? right - boxWidth - 10 * scale : left + 10 * scale;
        const boxY = top + 10 * scale;

        ctx.fillStyle = backgroundColor;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.textBaseline = 'middle';
        items.forEach((item, idx) => {
          const y = boxY + paddingY + idx * lineHeight + lineHeight / 2;
          ctx.fillStyle = item.color;
          ctx.fillRect(boxX + paddingX, y - 5 * scale, 12 * scale, 10 * scale);
          ctx.fillStyle = textColor;
          ctx.fillText(item.text, boxX + paddingX + 20 * scale, y);
        });

        ctx.restore();
      }
    };

    // --- Crosshair Plugin ---
    const crosshairPlugin = {
      id: 'crosshair',
      afterInit(chart) {
        chart.crosshair = { x: 0, y: 0, show: false };
      },
      afterEvent(chart, args) {
        const { x, y } = args.event;
        const { left, right, top, bottom } = chart.chartArea || {};
        const inside = left && right && top && bottom && x >= left && x <= right && y >= top && y <= bottom;
        chart.crosshair = { x, y, show: inside };
        chart.draw();
      },
      afterDraw(chart, args, opts) {
        if (!chart.crosshair || !chart.crosshair.show) return;
        const { ctx, chartArea, scales } = chart;
        const { left, right, top, bottom } = chartArea;
        const { x, y } = chart.crosshair;

        ctx.save();
        ctx.strokeStyle = opts.lineColor || '#888';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
        ctx.stroke();

        ctx.setLineDash([]);

        const xValue = scales.x.getValueForPixel(x);
        const yValue = scales.y.getValueForPixel(y);
        if (xValue === null || yValue === null) return;

        const xLabel = xValue.toFixed(2);
        const yLabel = yValue.toFixed(2);
        ctx.font = '11px sans-serif';

        // X label
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const xLabelWidth = ctx.measureText(xLabel).width + 8;
        const xLabelX = Math.max(left + xLabelWidth / 2, Math.min(x, right - xLabelWidth / 2));
        ctx.fillStyle = opts.labelBg || getCSSVar('--highlight');
        ctx.fillRect(xLabelX - xLabelWidth / 2, bottom + 5, xLabelWidth, 18);
        ctx.fillStyle = opts.labelText || '#fff';
        ctx.fillText(xLabel, xLabelX, bottom + 8);

        // Y label
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const yLabelWidth = ctx.measureText(yLabel).width + 8;
        const yLabelY = Math.max(top + 9, Math.min(y, bottom - 9));
        ctx.fillStyle = opts.labelBg || getCSSVar('--highlight');
        ctx.fillRect(left - yLabelWidth - 5, yLabelY - 9, yLabelWidth, 18);
        ctx.fillStyle = opts.labelText || '#fff';
        ctx.fillText(yLabel, left - 9, yLabelY);
        ctx.restore();
      }
    };

    const options = {
      responsive: true,
      resizeDelay: 0,
      animations: false,
      maintainAspectRatio: false,
      layout: { padding: { top: 10, left: 20 } },
      plugins: {
        title: {
          display: !!chart_type,
          text: chart_type,
          color: getCSSVar('--text'),
          font: { size: 18, weight: 'bold' }
        },
        legend: { display: false },
        tooltip: { enabled: false },
        floatingLegend: {
          backgroundColor: 'rgba(255,255,255,0.85)',
          borderColor: getCSSVar('--grey-blue'),
          borderWidth: 1,
          textColor: getCSSVar('--text')
        },
        crosshair: {
          lineColor: getCSSVar('--grey-blue'),
          labelBg: getCSSVar('--highlight'),
          labelText: '#fff'
        }
      },
      scales: {
        x: {
          type: 'linear',
          min: axisRanges.xMin,
          max: axisRanges.xMax,
          title: {
            display: !!x_label,
            text: x_label,
            color: getCSSVar('--highlight'),
            font: { size: 14, weight: 'bold' }
          },
          ticks: { color: getCSSVar('--blue-text') },
          grid: { color: getCSSVar('--grey-blue'), drawBorder: false, borderDash: [4, 4] }
        },
        y: {
          min: axisRanges.yMin,
          max: axisRanges.yMax,
          title: {
            display: !!y_label,
            text: y_label,
            color: getCSSVar('--highlight'),
            font: { size: 14, weight: 'bold' }
          },
          ticks: { color: getCSSVar('--blue-text') },
          grid: { color: getCSSVar('--grey-blue'), drawBorder: false, borderDash: [4, 4] }
        }
      },
      elements: {
        point: {
          radius: 2,
          hoverRadius: 4,
          backgroundColor: getCSSVar('--white'),
          borderWidth: 2
        }
      }
    };

    chartRef.current = new ChartJS(ctx, {
      type: 'line',
      data: chartConfig,
      options,
      plugins: [floatingLegend, crosshairPlugin]
    });

    return () => chartRef.current?.destroy();
  }, [chartData]);

  return (
    <div className="chart-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default SimpleChart;
