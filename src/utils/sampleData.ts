
import { Candle } from '../types/trading';

export const generateSampleCandles = (): Candle[] => {
  const candles: Candle[] = [];
  let basePrice = 100;
  
  // Generar datos de muestra que incluyen patrones conocidos
  const patterns = [
    // Tendencia bajista inicial
    { open: 105, high: 106, low: 98, close: 99 },
    { open: 99, high: 100, low: 95, close: 96 },
    { open: 96, high: 97, low: 92, close: 93 },
    
    // Doji
    { open: 93, high: 95, low: 91, close: 93.2 },
    
    // Hammer (patrón alcista)
    { open: 92, high: 93, low: 88, close: 92.5 },
    
    // Tendencia alcista
    { open: 92.5, high: 96, low: 92, close: 95 },
    { open: 95, high: 98, low: 94, close: 97 },
    { open: 97, high: 101, low: 96, close: 100 },
    
    // Shooting Star (patrón bajista)
    { open: 100, high: 105, low: 99, close: 100.5 },
    
    // Patrón envolvente bajista
    { open: 100, high: 102, low: 99, close: 101 },
    { open: 102, high: 103, low: 96, close: 97 },
    
    // Estrella matutina (patrón alcista de 3 velas)
    { open: 97, high: 98, low: 92, close: 93 },
    { open: 93, high: 94, low: 92, close: 93.5 },
    { open: 94, high: 99, low: 93, close: 98 },
    
    // Más velas para análisis
    { open: 98, high: 102, low: 97, close: 101 },
    { open: 101, high: 104, low: 100, close: 103 },
    { open: 103, high: 106, low: 102, close: 104 },
    
    // Estrella vespertina (patrón bajista de 3 velas)
    { open: 104, high: 107, low: 103, close: 106 },
    { open: 106, high: 107, low: 105, close: 106.2 },
    { open: 106, high: 107, low: 101, close: 102 },
    
    // Continuación bajista
    { open: 102, high: 103, low: 98, close: 99 },
    { open: 99, high: 100, low: 95, close: 96 }
  ];
  
  patterns.forEach((pattern, index) => {
    candles.push({
      ...pattern,
      timestamp: Date.now() - (patterns.length - index) * 60 * 60 * 1000, // 1 hora entre velas
      volume: Math.floor(Math.random() * 10000) + 5000
    });
  });
  
  return candles;
};

export const olympTradeAssets = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
  'USD/CHF', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY',
  'Gold', 'Silver', 'Oil', 'Bitcoin', 'Ethereum'
];
