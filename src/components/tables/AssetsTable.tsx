'use client';

import { JSX, useState } from 'react';
import { IAsset } from '../../types';
import { InputField } from '../form/InputField';

interface IAssetsTableProps {
  assets: IAsset[];
}

export function AssetsTable({ assets }: IAssetsTableProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = assets.filter(
    asset =>
      asset.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4">
        <InputField
          type="text"
          placeholder="Search assets..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-xs"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Category</th>
              <th>Value (CAD)</th>
              <th>Allocation</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset.id}>
                <td>{asset.asset}</td>
                <td>{asset.category}</td>
                <td>${asset.valueCAD.toLocaleString()}</td>
                <td>{asset.currentAllocation}%</td>
                <td>{asset.targetAllocation}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
