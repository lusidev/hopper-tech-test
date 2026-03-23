import { EnrichedCallRecord } from './call-record.i';

/**
 * Options for generating a call summary image.
 */
export interface CallSummaryImageOptions {
  /** Image width in pixels (default: 800) */
  width?: number;
  /** Image height in pixels (default: 500) */
  height?: number;
  /** Chart title (default: 'Call Batch Summary') */
  title?: string;
}

/**
 * Result of image generation including the content and MIME type.
 */
export interface GeneratedImage {
  /** SVG image content as a string */
  content: string;
  /** MIME type of the generated image */
  mimeType: 'image/svg+xml';
}

/**
 * Generates an SVG image summarising a batch of enriched call records.
 *
 * The image shows:
 *  - A bar chart of voice vs. video call counts
 *  - Key statistics: total calls, average duration, and total estimated cost
 *
 * @param records - Enriched call records to visualise
 * @param options - Optional configuration for image dimensions and title
 * @returns A GeneratedImage containing the SVG content string and its MIME type
 */
export function generateCallSummaryImage(
  records: EnrichedCallRecord[],
  options: CallSummaryImageOptions = {}
): GeneratedImage {
  const width = options.width ?? 800;
  const height = options.height ?? 500;
  const title = options.title ?? 'Call Batch Summary';

  const svg = buildSvg(records, width, height, title);
  return {
    content: svg,
    mimeType: 'image/svg+xml',
  };
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function esc(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildSvg(
  records: EnrichedCallRecord[],
  width: number,
  height: number,
  title: string
): string {
  const voiceCount = records.filter(r => r.callType === 'voice').length;
  const videoCount = records.filter(r => r.callType === 'video').length;
  const totalCount = records.length;

  const totalDuration = records.reduce((sum, r) => sum + (r.duration ?? 0), 0);
  const avgDuration = totalCount > 0 ? totalDuration / totalCount : 0;

  const totalCost = records.reduce((sum, r) => sum + (r.estimatedCost ?? 0), 0);

  const padding = { top: 70, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom - 100; // leave room for stats

  const maxCount = Math.max(voiceCount, videoCount, 1);
  const barWidth = Math.min(120, chartWidth / 4);
  const barGap = 60;
  const chartStartX = padding.left + (chartWidth - barWidth * 2 - barGap) / 2;

  const voiceBarHeight = (voiceCount / maxCount) * chartHeight;
  const videoBarHeight = (videoCount / maxCount) * chartHeight;

  const chartBaseY = padding.top + chartHeight;

  // Colours
  const VOICE_COLOUR = '#4a90d9';
  const VIDEO_COLOUR = '#7ed321';
  const BG_COLOUR = '#f8f9fa';
  const GRID_COLOUR = '#e0e0e0';
  const TEXT_COLOUR = '#333333';
  const TITLE_COLOUR = '#1a1a2e';
  const STAT_BG = '#ffffff';
  const BORDER_COLOUR = '#d0d0d0';

  const statsY = chartBaseY + 30;
  const statsBoxHeight = 60;
  const statsBoxWidth = (width - padding.left - padding.right - 20) / 3;

  const lines: string[] = [];

  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
  );

  // Background
  lines.push(`  <rect width="${width}" height="${height}" fill="${BG_COLOUR}" rx="8"/>`);

  // Border
  lines.push(
    `  <rect width="${width}" height="${height}" fill="none" stroke="${BORDER_COLOUR}" stroke-width="1" rx="8"/>`
  );

  // Title
  lines.push(
    `  <text x="${width / 2}" y="40" font-family="Arial, sans-serif" font-size="20" font-weight="bold" ` +
      `fill="${TITLE_COLOUR}" text-anchor="middle">${esc(title)}</text>`
  );

  // Subtitle: record count
  lines.push(
    `  <text x="${width / 2}" y="60" font-family="Arial, sans-serif" font-size="12" ` +
      `fill="#666666" text-anchor="middle">${esc(totalCount)} record${totalCount !== 1 ? 's' : ''}</text>`
  );

  // Chart area background
  lines.push(
    `  <rect x="${padding.left}" y="${padding.top}" width="${chartWidth}" height="${chartHeight}" ` +
      `fill="${STAT_BG}" stroke="${GRID_COLOUR}" stroke-width="1" rx="4"/>`
  );

  // Horizontal grid lines (4 lines)
  for (let i = 1; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    const gridValue = Math.round((maxCount / 4) * (4 - i));
    lines.push(
      `  <line x1="${padding.left}" y1="${y}" x2="${padding.left + chartWidth}" y2="${y}" ` +
        `stroke="${GRID_COLOUR}" stroke-width="1" stroke-dasharray="4,4"/>`
    );
    lines.push(
      `  <text x="${padding.left - 8}" y="${y + 4}" font-family="Arial, sans-serif" font-size="11" ` +
        `fill="#888888" text-anchor="end">${esc(gridValue)}</text>`
    );
  }

  // Y-axis label (max value)
  lines.push(
    `  <text x="${padding.left - 8}" y="${padding.top + 4}" font-family="Arial, sans-serif" font-size="11" ` +
      `fill="#888888" text-anchor="end">${esc(maxCount)}</text>`
  );

  if (totalCount > 0) {
    // Voice bar
    const voiceX = chartStartX;
    const voiceY = chartBaseY - voiceBarHeight;
    lines.push(
      `  <rect x="${voiceX}" y="${voiceY}" width="${barWidth}" height="${voiceBarHeight}" ` +
        `fill="${VOICE_COLOUR}" rx="4" opacity="0.9"/>`
    );
    lines.push(
      `  <text x="${voiceX + barWidth / 2}" y="${voiceY - 6}" font-family="Arial, sans-serif" ` +
        `font-size="13" font-weight="bold" fill="${VOICE_COLOUR}" text-anchor="middle">${esc(voiceCount)}</text>`
    );

    // Video bar
    const videoX = chartStartX + barWidth + barGap;
    const videoY = chartBaseY - videoBarHeight;
    lines.push(
      `  <rect x="${videoX}" y="${videoY}" width="${barWidth}" height="${videoBarHeight}" ` +
        `fill="${VIDEO_COLOUR}" rx="4" opacity="0.9"/>`
    );
    lines.push(
      `  <text x="${videoX + barWidth / 2}" y="${videoY - 6}" font-family="Arial, sans-serif" ` +
        `font-size="13" font-weight="bold" fill="${VIDEO_COLOUR}" text-anchor="middle">${esc(videoCount)}</text>`
    );

    // Bar labels (X axis)
    lines.push(
      `  <text x="${voiceX + barWidth / 2}" y="${chartBaseY + 20}" font-family="Arial, sans-serif" ` +
        `font-size="13" fill="${TEXT_COLOUR}" text-anchor="middle">Voice</text>`
    );
    lines.push(
      `  <text x="${chartStartX + barWidth + barGap + barWidth / 2}" y="${chartBaseY + 20}" ` +
        `font-family="Arial, sans-serif" font-size="13" fill="${TEXT_COLOUR}" text-anchor="middle">Video</text>`
    );
  } else {
    // Empty state message
    lines.push(
      `  <text x="${padding.left + chartWidth / 2}" y="${padding.top + chartHeight / 2}" ` +
        `font-family="Arial, sans-serif" font-size="14" fill="#aaaaaa" text-anchor="middle">No records</text>`
    );
  }

  // Statistics boxes
  const statBoxes: Array<{ label: string; value: string }> = [
    { label: 'Total Calls', value: String(totalCount) },
    {
      label: 'Avg Duration',
      value: totalCount > 0 ? formatDuration(avgDuration) : '—',
    },
    {
      label: 'Total Est. Cost',
      value: totalCount > 0 ? `$${totalCost.toFixed(2)}` : '—',
    },
  ];

  statBoxes.forEach((box, i) => {
    const bx = padding.left + i * (statsBoxWidth + 10);
    const by = statsY;

    lines.push(
      `  <rect x="${bx}" y="${by}" width="${statsBoxWidth}" height="${statsBoxHeight}" ` +
        `fill="${STAT_BG}" stroke="${BORDER_COLOUR}" stroke-width="1" rx="6"/>`
    );
    lines.push(
      `  <text x="${bx + statsBoxWidth / 2}" y="${by + 22}" font-family="Arial, sans-serif" ` +
        `font-size="11" fill="#888888" text-anchor="middle">${esc(box.label)}</text>`
    );
    lines.push(
      `  <text x="${bx + statsBoxWidth / 2}" y="${by + 44}" font-family="Arial, sans-serif" ` +
        `font-size="18" font-weight="bold" fill="${TITLE_COLOUR}" text-anchor="middle">${esc(box.value)}</text>`
    );
  });

  lines.push('</svg>');

  return lines.join('\n');
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
}
