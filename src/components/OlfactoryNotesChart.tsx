import React from 'react';
import { Perfume } from '../data/perfumes';

interface OlfactoryNotesChartProps {
  perfume: Perfume;
  variant?: 'full' | 'compact';
}

export const OlfactoryNotesChart: React.FC<OlfactoryNotesChartProps> = ({
  perfume,
  variant = 'compact',
}) => {
  const pyramidRows = [
    {
      tier: 'Top Notes',
      window: '0–30 min',
      items: perfume.notes.top,
      intensity: 58,
    },
    {
      tier: 'Heart Notes',
      window: '1–4 hrs',
      items: perfume.notes.heart,
      intensity: 82,
    },
    {
      tier: 'Base Notes',
      window: '6–12+ hrs',
      items: perfume.notes.base,
      intensity: 96,
    },
  ];

  if (variant === 'compact') {
    return (
      <div
        className="pt-3 mt-1 border-t border-[#ECE2CE] space-y-3"
        aria-label={`Olfactory notes chart for ${perfume.name}`}
      >
        {/* Accord Intensity Bars */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[#6D6254]">
            <span>Main Accords</span>
            <span className="font-mono tabular-nums text-[#8C641E] font-medium">
              {perfume.longevity}
            </span>
          </div>
          <div className="space-y-1.5">
            {perfume.accords.slice(0, 4).map((accord) => (
              <div key={accord.name} className="grid grid-cols-[84px_1fr_32px] sm:grid-cols-[100px_1fr_32px] items-center gap-2">
                <span className="text-[11px] text-[#3A3229] truncate">{accord.name}</span>
                <div className="h-1.5 bg-[#F2ECE0] overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${accord.strength}%`,
                      backgroundColor: accord.toneHex,
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono tabular-nums text-[#6D6254] text-right">
                  {accord.strength}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Olfactory Pyramid Lines */}
        <div className="space-y-1.5 pt-2 border-t border-[#EFE7D6]">
          {pyramidRows.map((row) => (
            <div key={row.tier} className="flex items-baseline justify-between gap-2 text-[11px]">
              <span className="text-[#8C641E] font-medium shrink-0 w-16">
                {row.tier.replace(' Notes', '')}
              </span>
              <span className="text-[#5C5347] text-right truncate">
                {row.items.join(' · ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full Atelier Notes & Accord Chart (Hero & Best Seller Expanded View)
  return (
    <div
      className="bg-[#FAF7F0] border border-[#E3D6BC] p-5 sm:p-6 space-y-6"
      aria-label={`Detailed olfactory notes chart for ${perfume.name}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-[#E5DAC2] pb-3.5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8C641E] font-medium">
            Olfactory Notes Chart
          </p>
          <h3 className="font-display text-2xl text-[#1A1612] mt-0.5">
            {perfume.name} · Architecture
          </h3>
        </div>
        <div className="text-xs text-[#5C5347] flex items-center gap-2">
          <span>
            Longevity: <strong className="text-[#1A1612] font-semibold">{perfume.longevity}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Sillage: <strong className="text-[#1A1612] font-semibold">{perfume.sillage}</strong>
          </span>
        </div>
      </div>

      {/* Main Accords Proportional Chart */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-[#3A3229]">Accord Intensity Profile</div>
        <div className="space-y-2.5">
          {perfume.accords.map((accord) => (
            <div
              key={accord.name}
              className="grid grid-cols-[96px_1fr_38px] sm:grid-cols-[140px_1fr_46px] items-center gap-2.5 sm:gap-3"
            >
              <span className="text-xs text-[#2B241D] truncate">{accord.name}</span>
              <div className="h-2.5 bg-[#EDE5D4] border border-[#DFD1B4] overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${accord.strength}%`,
                    backgroundColor: accord.toneHex,
                  }}
                />
              </div>
              <span className="text-xs font-mono tabular-nums text-[#8C641E] font-medium text-right">
                {accord.strength}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3-Tier Evaporation Pyramid */}
      <div className="space-y-3 pt-4 border-t border-[#E5DAC2]">
        <div className="text-xs font-medium text-[#3A3229]">Evaporation Pyramid</div>
        <div className="divide-y divide-[#E8DEC8] border-y border-[#E8DEC8]">
          {pyramidRows.map((row) => (
            <div
              key={row.tier}
              className="py-3 grid grid-cols-1 sm:grid-cols-[135px_1fr] gap-2 items-center"
            >
              <div>
                <div className="text-xs font-medium text-[#8C641E]">{row.tier}</div>
                <div className="text-[11px] font-mono tabular-nums text-[#7C7162]">
                  {row.window}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-[#1A1612]">
                {row.items.join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
