
import React from 'react';
import { Candle } from '../types/trading';

interface CandlestickChartProps {
  candles: Candle[];
  patterns: any[];
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ candles, patterns }) => {
  const maxPrice = Math.max(...candles.map(c => c.high));
  const minPrice = Math.min(...candles.map(c => c.low));
  const priceRange = maxPrice - minPrice;
  const chartHeight = 300;
  const chartWidth = 800;
  const candleWidth = chartWidth / candles.length - 2;

  const getPriceY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <svg width={chartWidth} height={chartHeight} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={ratio}
            x1={0}
            y1={chartHeight * ratio}
            x2={chartWidth}
            y2={chartHeight * ratio}
            stroke="#374151"
            strokeWidth={0.5}
          />
        ))}
        
        {/* Candles */}
        {candles.map((candle, index) => {
          const x = index * (chartWidth / candles.length);
          const isGreen = candle.close > candle.open;
          const bodyTop = getPriceY(Math.max(candle.open, candle.close));
          const bodyBottom = getPriceY(Math.min(candle.open, candle.close));
          const bodyHeight = bodyBottom - bodyTop;
          
          return (
            <g key={index}>
              {/* Wick */}
              <line
                x1={x + candleWidth / 2}
                y1={getPriceY(candle.high)}
                x2={x + candleWidth / 2}
                y2={getPriceY(candle.low)}
                stroke={isGreen ? "#10b981" : "#ef4444"}
                strokeWidth={1}
              />
              
              {/* Body */}
              <rect
                x={x + 1}
                y={bodyTop}
                width={candleWidth - 2}
                height={Math.max(bodyHeight, 1)}
                fill={isGreen ? "#10b981" : "#ef4444"}
                stroke={isGreen ? "#10b981" : "#ef4444"}
              />
            </g>
          );
        })}
        
        {/* Pattern highlights */}
        {patterns.map((pattern, index) => (
          <rect
            key={index}
            x={pattern.startIndex * (chartWidth / candles.length)}
            y={0}
            width={(pattern.endIndex - pattern.startIndex + 1) * (chartWidth / candles.length)}
            height={chartHeight}
            fill={pattern.type === 'bullish' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
            stroke={pattern.type === 'bullish' ? '#10b981' : '#ef4444'}
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        ))}
      </svg>
    </div>
  );
};

export default CandlestickChart;
