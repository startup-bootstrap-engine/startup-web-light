'use client';

import { JSX } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { IAsset } from '../types';

interface IAllocationChartProps {
  assets: IAsset[];
}

interface IChartData {
  name: string;
  category: string;
  value: number;
  targetValue: number;
}

export function AllocationChart({ assets }: IAllocationChartProps): JSX.Element {
  const COLORS = {
    crypto: '#4ade80', // primary (mint green)
    stocks: '#ea580c', // orange
    'real-estate': '#e879f9', // purple
    bonds: '#2dd4bf', // cyan
    cash: '#fbbf24', // yellow
  };

  const data = assets.map(asset => ({
    name: asset.asset,
    category: asset.category,
    value: asset.currentAllocation,
    targetValue: asset.targetAllocation,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.category as keyof typeof COLORS]}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          <Pie
            data={data}
            dataKey="targetValue"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={85}
            outerRadius={95}
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-target-${index}`}
                fill={COLORS[entry.category as keyof typeof COLORS]}
                opacity={0.3}
                className="hover:opacity-50 transition-opacity"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as IChartData;
                return (
                  <div className="bg-base-200 p-2 rounded-lg shadow-lg border border-base-300">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm">Current: {data.value.toFixed(1)}%</p>
                    <p className="text-sm">Target: {data.targetValue.toFixed(1)}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => <span className="text-base-content">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
