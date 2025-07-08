import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonRange,
} from '@ionic/react';

Chart.register(ChartDataLabels);

type ChartComponentProps = {
  data: Record<string, number>;
  colorMap?: Record<string, string>;
  selectedCategory: string;
  categoryOptions: string[];
  onCategoryChange: (category: string) => void;
};

const Chartcom: React.FC<ChartcomProps> = ({
  data,
  colorMap = {},
  selectedCategory,
  categoryOptions,
  onCategoryChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const [chartSize, setChartSize] = useState<number>(400);
  const [colors, setColors] = useState<string[]>([]);

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);

  const generateColor = () =>
    `rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(
      Math.random() * 200
    )}, ${Math.floor(Math.random() * 200)})`;

    const computeColors = () =>
    Object.keys(data).map((key) => {
      const color = colorMap[key];
      return color ? color : generateColor();
    });

  const createChart = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) chartRef.current.destroy();

    const generatedColors = computeColors();
    setColors(generatedColors);

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor: generatedColors,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          datalabels: {
            formatter: (value: number) =>
              `${((value / total) * 100).toFixed(1)}%`,
            color: '#fff',
            font: { weight: 'bold' },
          },
          legend: { display: false },
        },
      },
      plugins: [ChartDataLabels],
    });
  };

  useEffect(() => {
    createChart();
  }, [data, chartSize]);

  return (
    <div className="view-section">
    <h3 className="view-title">Chart Canvas</h3>      
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Category Selector */}
      <IonItem>
        <IonLabel>Select Category</IonLabel>
        <IonSelect
          value={selectedCategory}
          onIonChange={(e) => onCategoryChange(e.detail.value)}
        >
          {categoryOptions.map((cat) => (
            <IonSelectOption key={cat} value={cat}>
              {cat}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>

      {/* Chart + Legend */}
      <div style={{ display: 'flex', gap: 30 }}>
        <div style={{ width: chartSize, height: chartSize }}>
          <canvas ref={canvasRef}></canvas>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(data).map(([key, value], idx) => (
            <div
              key={key}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <div
                style={{
                  backgroundColor: colors[idx],
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                }}
              ></div>
              <div>
                {key} - {value} ({((value / total) * 100).toFixed(1)}%)
              </div>
            </div>
          ))}
          <strong>Total: {total}</strong>
        </div>
      </div>

      {/* Size Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IonLabel>Size</IonLabel>
        <IonRange
          min={150}
          max={900}
          step={10}
          value={chartSize}
          onIonChange={(e) => setChartSize(e.detail.value as number)}
          style={{ width: 200 }}
        />
        <IonLabel>{chartSize}px</IonLabel>
      </div>
    </div>
    </div>
  );
};

export default Chartcom;
