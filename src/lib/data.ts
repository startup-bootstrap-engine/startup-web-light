import { categories, initialAssets } from '../mocks/data';
import { IAsset, IAssetCategory } from '../types';

export function getAssets(): IAsset[] {
  return initialAssets;
}

export function getCategories(): IAssetCategory[] {
  return categories;
}

export function getCategoryById(id: string): IAssetCategory | undefined {
  return categories.find(c => c.id === id);
}

export function getAssetsByCategory(category: string): IAsset[] {
  return initialAssets.filter(asset => asset.category === category);
}
