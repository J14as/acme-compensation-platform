import React from 'react';
import { Filter } from 'lucide-react';

export default function BonusGauge({ totalBonus = 12000, bonusPortion = 7500, incentivePortion = 4500 }) {
  // SVG Semi-circular gauge parameters
  // Outer radius: 100, Inner radius: 76
  return (
    <div className="dribbble-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-dark)', margin: 0 }}>
          Bonuses & Incentives
        </h3>
        <button style={{
          background: 'transparent',
          border: '1px solid var(--border-card)',
          borderRadius: '8px',
          padding: '6px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Filter size={16} />
        </button>
      </div>

      {/* Semi-circular concentric arc chart */}
      <div style={{ position: 'relative', width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
        <svg viewBox="0 0 240 140" style={{ width: '100%', maxWidth: '280px', height: '140px', overflow: 'visible' }}>
          {/* Outer Arc Track (Grey) */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Outer Arc (Deep Blue - Bonus) */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#0284c7"
            strokeWidth="14"
            strokeDasharray="314"
            strokeDashoffset="75"
            strokeLinecap="round"
          />

          {/* Inner Arc Track (Grey) */}
          <path
            d="M 45 120 A 75 75 0 0 1 195 120"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Inner Arc (Cyan/Teal - Incentive) */}
          <path
            d="M 45 120 A 75 75 0 0 1 195 120"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="12"
            strokeDasharray="235"
            strokeDashoffset="70"
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text inside the arc */}
        <div style={{
          position: 'absolute',
          bottom: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>
            Total
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-dark)', marginTop: '2px' }} className="tabular-nums">
            ${Number(totalBonus).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Legend below the arc */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>
            Bonus ${Number(bonusPortion).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
          <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-dark)' }}>
            Incentive ${Number(incentivePortion).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}
