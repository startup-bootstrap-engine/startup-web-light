import { DollarSign, TrendingUp, Wallet, Coins } from 'lucide-react';
import { JSX } from 'react';
import { IPortfolioStats } from '../../types';
import { Sparkline } from '../common/Sparkline';
import { CreditsDisplay } from '../stripe/CreditsDisplay';

interface IProps {
  stats: IPortfolioStats;
}

export function PortfolioHeader({ stats }: IProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0">
      <div className="bg-base-200/30 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-primary/10">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold text-primary">Total Portfolio Value</h2>
          <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold text-base-content">
            CA${Math.round(stats.totalValueCAD).toLocaleString()}
          </p>
          <p className="text-xs md:text-sm text-base-content/60 mt-0.5 md:mt-1">
            R${Math.round(stats.totalValueBRL).toLocaleString()}
          </p>
        </div>
        <div className="mt-3 md:mt-4">
          <Sparkline data={stats.history.totalValue} />
        </div>
      </div>

      <div className="bg-base-200/30 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-primary/10">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold text-primary">
            Monthly Passive Income
          </h2>
          <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold text-base-content">
            CA${Math.round(stats.passiveIncome).toLocaleString()}
          </p>
          <p className="text-xs md:text-sm text-base-content/60 mt-0.5 md:mt-1">
            Annual Yield: {stats.globalYield}%
          </p>
        </div>
        <div className="mt-3 md:mt-4">
          <Sparkline data={stats.history.passiveIncome} />
        </div>
      </div>

      <div className="bg-base-200/30 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-primary/10">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold text-primary">Total BTC</h2>
          <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
            <Wallet className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        </div>
        <div>
          <p className="text-xl md:text-2xl font-bold text-base-content">
            ₿ {stats.totalBTC.toFixed(8)}
          </p>
        </div>
        <div className="mt-3 md:mt-4">
          <Sparkline data={stats.history.btc} />
        </div>
      </div>

      <div className="bg-base-200/30 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-lg border border-primary/10">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold text-primary">Available Credits</h2>
          <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
            <Coins className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        </div>
        <div>
          <CreditsDisplay />
        </div>
        <div className="mt-3 md:mt-4">
          <a href="/pricing" className="btn btn-primary btn-sm w-full">
            Buy Credits
          </a>
        </div>
      </div>
    </div>
  );
}
