/*
 Copyright 2023 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import type { SolarPanelConfig } from './solar';

/**
 * Helper function to format numbers with thousand separators
 */
export function showNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Find the solar config that covers the yearly energy consumption.
 * From Google's original implementation
 */
export function findSolarConfig(
  solarPanelConfigs: SolarPanelConfig[],
  yearlyKwhEnergyConsumption: number,
  panelCapacityRatio: number,
  dcToAcDerate: number,
): number {
  // Find the first config that produces enough energy
  // to cover the given yearly consumption
  for (let configId = 0; configId < solarPanelConfigs.length; configId++) {
    const config = solarPanelConfigs[configId];
    const yearlyEnergyDcKwh = config.yearlyEnergyDcKwh * panelCapacityRatio;
    const yearlyEnergyAcKwh = yearlyEnergyDcKwh * dcToAcDerate;
    
    if (yearlyEnergyAcKwh >= yearlyKwhEnergyConsumption) {
      return configId;
    }
  }
  
  // If no config produces enough energy, return the last one (maximum panels)
  return solarPanelConfigs.length - 1;
}

