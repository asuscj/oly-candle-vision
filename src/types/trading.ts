
export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
  volume?: number;
}

export interface Pattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  candleIndex: number;
  startIndex?: number;
  endIndex?: number;
  signal?: string;
  description?: string;
}

export interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  strength: number;
  reason: string;
  timestamp: number;
}
