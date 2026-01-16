import { analyticsService } from './analytics-service';
import { z } from 'zod';

const exportSchema = z.object({
  format: z.enum(['csv', 'json']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.number().min(1).max(365).default(30)
});

export class AnalyticsExportService {
  // Export analytics data
  async exportData(params: z.infer<typeof exportSchema>): Promise<{ data: string; filename: string; mimeType: string }> {
    const validated = exportSchema.parse(params);
    
    const overview = await analyticsService.getOverview({ days: validated.days });
    
    if (validated.format === 'csv') {
      return this.exportCSV(overview, validated.days);
    } else {
      return this.exportJSON(overview, validated.days);
    }
  }

  // Export as CSV
  private exportCSV(data: any, days: number): { data: string; filename: string; mimeType: string } {
    const headers = [
      'Date',
      'Page Views',
      'Unique Visitors',
      'Sessions',
      'Bounce Rate (%)',
      'Avg Session Duration (s)'
    ];

    const rows = data.chartData.map((item: any) => [
      item.date,
      item.pageViews,
      item.visitors,
      data.totalSessions,
      data.bounceRate,
      data.avgSessionDuration
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n');

    return {
      data: csvContent,
      filename: `analytics-${days}days-${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv'
    };
  }

  // Export as JSON
  private exportJSON(data: any, days: number): { data: string; filename: string; mimeType: string } {
    const exportData = {
      exportDate: new Date().toISOString(),
      period: `${days} days`,
      summary: {
        totalPageViews: data.totalPageViews,
        uniqueVisitors: data.uniqueVisitors,
        totalSessions: data.totalSessions,
        bounceRate: data.bounceRate,
        avgSessionDuration: data.avgSessionDuration
      },
      topPages: data.topPages,
      topReferrers: data.topReferrers,
      deviceStats: data.deviceStats,
      countryStats: data.countryStats,
      chartData: data.chartData
    };

    return {
      data: JSON.stringify(exportData, null, 2),
      filename: `analytics-${days}days-${new Date().toISOString().split('T')[0]}.json`,
      mimeType: 'application/json'
    };
  }
}

export const analyticsExport = new AnalyticsExportService();