import { PersonalizedSolarInsights } from "@/components/PersonalizedSolarInsights";

/**
 * Example component demonstrating usage of PersonalizedSolarInsights
 */
export function PersonalizedSolarInsightsExample() {
  // Example solar data from Google Solar API
  const exampleSolarData = {
    solarPotential: {
      maxArrayPanelsCount: 42,
      maxArrayAreaMeters2: 156.8,
      maxSunshineHoursPerYear: 1654,
      carbonOffsetFactorKgPerMwh: 428.9,
      panelCapacityWatts: 400,
      panelHeightMeters: 1.7,
      panelWidthMeters: 1.0,
      panelLifetimeYears: 25,
    },
    financialAnalyses: [
      {
        monthlyBill: {
          units: 250,
          currencyCode: "GBP"
        },
        panelConfigIndex: 0,
        financialDetails: {
          initialAcKwhPerYear: 15600,
          remainingLifetimeUtilityBill: {
            units: 85000,
            currencyCode: "GBP"
          },
          federalIncentive: {
            units: 0,
            currencyCode: "GBP"
          },
          stateIncentive: {
            units: 0,
            currencyCode: "GBP"
          },
          utilityIncentive: {
            units: 0,
            currencyCode: "GBP"
          },
          lifetimeSrecTotal: {
            units: 0,
            currencyCode: "GBP"
          },
          costOfElectricityWithoutSolar: {
            units: 95000,
            currencyCode: "GBP"
          },
          netMeteringAllowed: true,
          solarPercentage: 85,
          percentageExportedToGrid: 15
        },
        leasingSavings: {
          leasesAllowed: true,
          leasesSupported: true,
          annualLeasingCost: {
            units: 1200,
            currencyCode: "GBP"
          },
          savings: {
            savingsYear1: {
              units: 800,
              currencyCode: "GBP"
            },
            savingsYear20: {
              units: 16000,
              currencyCode: "GBP"
            },
            presentValueOfSavingsYear20: {
              units: 12000,
              currencyCode: "GBP"
            },
            financiallyViable: true,
            savingsLifetime: {
              units: 25000,
              currencyCode: "GBP"
            },
            presentValueOfSavingsLifetime: {
              units: 18000,
              currencyCode: "GBP"
            }
          }
        },
        cashPurchaseSavings: {
          outOfPocketCost: {
            units: 15000,
            currencyCode: "GBP"
          },
          upfrontCost: {
            units: 15000,
            currencyCode: "GBP"
          },
          rebateValue: {
            units: 0,
            currencyCode: "GBP"
          },
          paybackYears: 12,
          savings: {
            savingsYear1: {
              units: 1200,
              currencyCode: "GBP"
            },
            savingsYear20: {
              units: 24000,
              currencyCode: "GBP"
            },
            presentValueOfSavingsYear20: {
              units: 18000,
              currencyCode: "GBP"
            },
            financiallyViable: true,
            savingsLifetime: {
              units: 35000,
              currencyCode: "GBP"
            },
            presentValueOfSavingsLifetime: {
              units: 25000,
              currencyCode: "GBP"
            }
          }
        },
        financedPurchaseSavings: {
          annualLoanPayment: {
            units: 1500,
            currencyCode: "GBP"
          },
          rebateValue: {
            units: 0,
            currencyCode: "GBP"
          },
          loanInterestRate: 0.045,
          savings: {
            savingsYear1: {
              units: 500,
              currencyCode: "GBP"
            },
            savingsYear20: {
              units: 20000,
              currencyCode: "GBP"
            },
            presentValueOfSavingsYear20: {
              units: 15000,
              currencyCode: "GBP"
            },
            financiallyViable: true,
            savingsLifetime: {
              units: 30000,
              currencyCode: "GBP"
            },
            presentValueOfSavingsLifetime: {
              units: 22000,
              currencyCode: "GBP"
            }
          }
        }
      }
    ],
    roofSegmentStats: [
      {
        pitchDegrees: 30,
        azimuthDegrees: 180,
        stats: {
          areaMeters2: 156.8,
          sunshineQuantiles: [800, 1200, 1654, 2000, 2200],
          groundAreaMeters2: 135.7
        },
        center: {
          latitude: 51.5074,
          longitude: -0.1278
        },
        boundingBox: {
          sw: { latitude: 51.5072, longitude: -0.1280 },
          ne: { latitude: 51.5076, longitude: -0.1276 }
        },
        planeHeightAtCenterMeters: 8.5
      }
    ],
    solarPanelConfigs: [
      {
        panelsCount: 42,
        yearlyEnergyDcKwh: 16800,
        roofSegmentSummaries: [
          {
            pitchDegrees: 30,
            azimuthDegrees: 180,
            panelsCount: 42,
            yearlyEnergyDcKwh: 16800,
            segmentIndex: 0
          }
        ]
      }
    ]
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Personalized Solar Insights Example</h1>
        <p className="text-muted-foreground">
          Demonstrating the PersonalizedSolarInsights component with example data
        </p>
      </div>

      <PersonalizedSolarInsights solarData={exampleSolarData} />

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">About This Example</h2>
        <p className="text-sm text-gray-700">
          This component displays personalized solar insights based on Google Solar API data.
          It includes:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700 space-y-1">
          <li>System size recommendations</li>
          <li>Energy production estimates</li>
          <li>Financial analysis (cash purchase, financing, leasing)</li>
          <li>Carbon offset calculations</li>
          <li>Payback period analysis</li>
          <li>Roof segment analysis</li>
        </ul>
      </div>
    </div>
  );
}

