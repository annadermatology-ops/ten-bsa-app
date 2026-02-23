'use client';

import { useTranslations } from 'next-intl';

interface DataPoint {
  date: string;
  tbsa: number;
  dbsa: number;
}

interface TrendChartProps {
  data: DataPoint[];
}

/**
 * Hand-rolled SVG line chart for TBSA/DBSA trends.
 * Zero external dependencies.
 */
export function TrendChart({ data }: TrendChartProps) {
  const t = useTranslations();

  if (data.length < 2) return null;

  // Chart dimensions
  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Calculate scales
  const maxY = Math.max(
    ...data.map((d) => Math.max(d.tbsa, d.dbsa)),
    10, // minimum 10%
  );
  const yMax = Math.ceil(maxY / 10) * 10; // Round up to nearest 10

  const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartW;
  const yScale = (v: number) => padding.top + chartH - (v / yMax) * chartH;

  // Build path strings
  const tbsaPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.tbsa)}`)
    .join(' ');
  const dbsaPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.dbsa)}`)
    .join(' ');

  // Y-axis ticks
  const yTicks = [];
  const yStep = yMax <= 20 ? 5 : 10;
  for (let v = 0; v <= yMax; v += yStep) {
    yTicks.push(v);
  }

  // Format date for X-axis labels
  function formatShortDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  return (
    <div className="bg-white rounded-xl border border-[#d0d0c8] p-4">
      <h3 className="text-sm font-semibold text-[#555] mb-3">
        {t('patientDetail.trendChart')}
      </h3>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-2 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-[#c95a8a] rounded" />
          <span className="text-[#666]">{t('patientDetail.tbsa')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-[#636e72] rounded" />
          <span className="text-[#666]">{t('patientDetail.dbsa')}</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: '220px' }}
      >
        {/* Grid lines */}
        {yTicks.map((v) => (
          <line
            key={v}
            x1={padding.left}
            y1={yScale(v)}
            x2={width - padding.right}
            y2={yScale(v)}
            stroke="#e8e8e0"
            strokeWidth="0.5"
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((v) => (
          <text
            key={v}
            x={padding.left - 8}
            y={yScale(v) + 3}
            textAnchor="end"
            className="fill-[#999]"
            fontSize="10"
          >
            {v}%
          </text>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={xScale(i)}
            y={height - padding.bottom + 16}
            textAnchor="middle"
            className="fill-[#999]"
            fontSize="9"
          >
            {formatShortDate(d.date)}
          </text>
        ))}

        {/* TBSA line */}
        <path
          d={tbsaPath}
          fill="none"
          stroke="#c95a8a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* DBSA line */}
        <path
          d={dbsaPath}
          fill="none"
          stroke="#636e72"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* TBSA dots */}
        {data.map((d, i) => (
          <circle
            key={`tbsa-${i}`}
            cx={xScale(i)}
            cy={yScale(d.tbsa)}
            r="3.5"
            fill="#c95a8a"
            stroke="white"
            strokeWidth="1.5"
          />
        ))}

        {/* DBSA dots */}
        {data.map((d, i) => (
          <circle
            key={`dbsa-${i}`}
            cx={xScale(i)}
            cy={yScale(d.dbsa)}
            r="3.5"
            fill="#636e72"
            stroke="white"
            strokeWidth="1.5"
          />
        ))}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#d0d0c8"
          strokeWidth="1"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#d0d0c8"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
