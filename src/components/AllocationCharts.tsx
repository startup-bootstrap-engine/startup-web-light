'use client';

import { JSX } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { categories } from '../mocks/data';
import { IAsset } from '../types';
import { AllocationChart } from './AllocationChart';

interface IAllocationChartsProps {
  assets: IAsset[];
}

interface ICategoryData {
  name: string;
  current: number;
  target: number;
  difference: string;
}

export function AllocationCharts({ assets }: IAllocationChartsProps): JSX.Element {
  const categoryData = categories.map(category => {
    const categoryAssets = assets.filter(asset => asset.category === category.id);
    const currentTotal = categoryAssets.reduce((sum, asset) => sum + asset.currentAllocation, 0);
    const targetTotal = categoryAssets.reduce((sum, asset) => sum + asset.targetAllocation, 0);

    return {
      name: category.name,
      current: currentTotal,
      target: targetTotal,
      difference: (currentTotal - targetTotal).toFixed(2),
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-base-content">Asset Allocation</h2>
          <AllocationChart assets={assets} />
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-base-content">Category Allocation</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-base-content/20" />
                <XAxis
                  dataKey="name"
                  className="text-base-content/80"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-base-content/80" tickFormatter={value => `${value}%`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ICategoryData;
                      return (
                        <div className="bg-base-200 p-2 rounded-lg shadow-lg border border-base-300">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm">Current: {data.current.toFixed(1)}%</p>
                          <p className="text-sm">Target: {data.target.toFixed(1)}%</p>
                          <p className="text-sm">Difference: {data.difference}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="current"
                  fill="#4ade80"
                  name="Current"
                  className="hover:opacity-80 transition-opacity"
                />
                <Bar
                  dataKey="target"
                  fill="#4ade80"
                  name="Target"
                  opacity={0.3}
                  className="hover:opacity-50 transition-opacity"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
