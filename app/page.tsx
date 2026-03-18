import { Metadata } from 'next';
import { AllocationCharts } from '../src/components/AllocationCharts';
import { Card } from '../src/components/common/Card';
import { PortfolioHeader } from '../src/components/layout/PortfolioHeader';
import { AssetsTable } from '../src/components/tables/AssetsTable';
import { getAssets } from '../src/lib/data';
import { IHistoricalData, IPortfolioStats } from '../src/types';

export const metadata: Metadata = {
  title: 'Portfolio Summary | PixelPerfect',
  description: 'Overview of asset allocation and performance across your entire portfolio',
};

function generateMockHistory(
  currentValue: number,
  points: number = 30,
  volatility: number = 0.02,
  trend: number = 0.3
): IHistoricalData[] {
  const history: IHistoricalData[] = [];
  let value = currentValue * 0.9;
  let momentum = 0;

  for (let i = 0; i < points; i++) {
    const trendForce = (currentValue - value) * trend;
    momentum = momentum * 0.95 + trendForce * 0.05;
    const noise = (Math.random() - 0.5) * volatility * value;
    value = value + momentum + noise;

    if (i === points - 1) {
      value = currentValue;
    }

    history.push({
      value,
      timestamp: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return history;
}

export default function SummaryPage() {
  const assets = getAssets();

  const totalValueCAD = assets.reduce((sum, asset) => sum + asset.valueCAD, 0);
  const totalBTC = assets
    .filter(asset => asset.category === 'crypto' && asset.asset === 'BTC')
    .reduce((sum, asset) => sum + asset.quantity, 0);

  const annualPassiveIncome = assets.reduce(
    (sum, asset) => sum + asset.valueCAD * (asset.apy / 100),
    0
  );
  const monthlyPassiveIncome = annualPassiveIncome / 12;
  const globalYield = (annualPassiveIncome / totalValueCAD) * 100;

  const history = {
    totalValue: generateMockHistory(totalValueCAD, 30, 0.01, 0.2),
    passiveIncome: generateMockHistory(monthlyPassiveIncome, 30, 0.005, 0.3),
    btc: generateMockHistory(totalBTC, 30, 0.015, 0.15),
  };

  const stats: IPortfolioStats = {
    totalValueCAD,
    totalValueBRL: totalValueCAD * 3.75,
    passiveIncome: monthlyPassiveIncome,
    globalYield: Number(globalYield.toFixed(2)),
    totalBTC,
    history,
  };

  return (
    <main className="flex-1">
      <div className="p-6 space-y-10">
        <PortfolioHeader stats={stats} />

        <Card title="Asset Allocation" className="w-full">
          <AllocationCharts assets={assets} />
        </Card>

        <Card title="Assets Overview" className="w-full">
          <AssetsTable assets={assets} />
        </Card>
      </div>
    </main>
  );
}
