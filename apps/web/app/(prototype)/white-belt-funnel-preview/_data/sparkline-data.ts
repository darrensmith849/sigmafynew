/**
 * Mock 12-point trend series used by KPI tiles and stat cards. Illustrative
 * only — not a real metric history.
 */

export type Series = number[];

export const mockSparklines: Record<string, Series> = {
  kpi_completions: [102, 118, 121, 134, 142, 150, 158, 163, 170, 176, 180, 184],
  kpi_cert_downloads: [88, 94, 102, 110, 118, 124, 132, 138, 144, 149, 153, 157],
  kpi_upgrade_clicks: [42, 45, 49, 51, 54, 56, 59, 61, 63, 65, 66, 68],
  kpi_company_leads: [6, 7, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12],
  kpi_referral_interest: [3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9],
  kpi_remarketing_active: [60, 68, 76, 82, 88, 92, 98, 101, 105, 108, 110, 112],
  kpi_sales_followups: [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7],
  kpi_yb_conversions: [5, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18],

  stat_active: [28, 30, 31, 33, 34, 36, 37, 38, 39, 40, 41, 42],
  stat_savings: [7.4, 8.1, 8.6, 9.2, 9.9, 10.4, 10.9, 11.3, 11.6, 11.9, 12.2, 12.4],
  stat_completion: [78, 80, 82, 83, 84, 84, 85, 85, 86, 86, 87, 87],
  stat_progression: [22, 24, 25, 27, 28, 29, 30, 31, 32, 33, 34, 34],
  stat_company: [3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  stat_roi: [4.5, 4.8, 5.1, 5.4, 5.7, 5.9, 6.1, 6.3, 6.4, 6.6, 6.7, 6.8],

  rev_yb: [22000, 24000, 27000, 30000, 33000, 35000, 37000, 39000, 41000, 42500, 43500, 44160],
  rev_company: [400000, 480000, 560000, 640000, 720000, 800000, 860000, 900000, 940000, 970000, 985000, 993600],
};

/** Compact 5-point series used for inline mini-bars on lead rows etc. */
export const mockMicroSeries: Record<string, Series> = {
  lead_001: [12, 18, 24, 36, 42],
  lead_002: [8, 14, 22, 28, 34],
  lead_003: [10, 14, 18, 22, 28],
  lead_004: [2, 3, 3, 4, 4],
  lead_005: [40, 56, 70, 84, 95],
  lead_006: [12, 16, 20, 24, 28],
  lead_007: [14, 12, 10, 9, 8],
  lead_008: [60, 76, 88, 96, 100],
  lead_009: [4, 6, 6, 7, 8],
};
