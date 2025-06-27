
import { Candle, Pattern } from '../types/trading';

export const detectPatterns = (candles: Candle[]): Pattern[] => {
  const patterns: Pattern[] = [];
  
  for (let i = 0; i < candles.length; i++) {
    // Detectar Doji
    const dojiPattern = detectDoji(candles, i);
    if (dojiPattern) patterns.push(dojiPattern);
    
    // Detectar Hammer
    const hammerPattern = detectHammer(candles, i);
    if (hammerPattern) patterns.push(hammerPattern);
    
    // Detectar Shooting Star
    const shootingStarPattern = detectShootingStar(candles, i);
    if (shootingStarPattern) patterns.push(shootingStarPattern);
    
    // Detectar patrones de múltiples velas
    if (i >= 1) {
      const engulfingPattern = detectEngulfing(candles, i);
      if (engulfingPattern) patterns.push(engulfingPattern);
      
      const haramiPattern = detectHarami(candles, i);
      if (haramiPattern) patterns.push(haramiPattern);
    }
    
    // Detectar patrones de tres velas
    if (i >= 2) {
      const morningStarPattern = detectMorningStar(candles, i);
      if (morningStarPattern) patterns.push(morningStarPattern);
      
      const eveningStarPattern = detectEveningStar(candles, i);
      if (eveningStarPattern) patterns.push(eveningStarPattern);
    }
  }
  
  return patterns;
};

const detectDoji = (candles: Candle[], index: number): Pattern | null => {
  const candle = candles[index];
  const bodySize = Math.abs(candle.close - candle.open);
  const totalRange = candle.high - candle.low;
  
  if (totalRange === 0) return null;
  
  const bodyPercentage = bodySize / totalRange;
  
  if (bodyPercentage < 0.1) {
    return {
      name: 'doji',
      type: 'neutral',
      confidence: 1 - bodyPercentage,
      candleIndex: index,
      signal: 'Indecisión del mercado - Posible reversión',
      description: 'Doji indica equilibrio entre compradores y vendedores'
    };
  }
  
  return null;
};

const detectHammer = (candles: Candle[], index: number): Pattern | null => {
  const candle = candles[index];
  const bodySize = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  const totalRange = candle.high - candle.low;
  
  if (totalRange === 0) return null;
  
  // Hammer: cuerpo pequeño, sombra inferior larga, sombra superior pequeña
  const isSmallBody = bodySize / totalRange < 0.3;
  const isLongLowerShadow = lowerShadow > bodySize * 2;
  const isShortUpperShadow = upperShadow < bodySize * 0.5;
  
  if (isSmallBody && isLongLowerShadow && isShortUpperShadow) {
    const confidence = Math.min(lowerShadow / bodySize / 3, 1);
    
    return {
      name: 'hammer',
      type: 'bullish',
      confidence,
      candleIndex: index,
      signal: 'Posible reversión alcista - Considerar compra',
      description: 'Martillo indica rechazo de precios bajos'
    };
  }
  
  return null;
};

const detectShootingStar = (candles: Candle[], index: number): Pattern | null => {
  const candle = candles[index];
  const bodySize = Math.abs(candle.close - candle.open);
  const lowerShadow = Math.min(candle.open, candle.close) - candle.low;
  const upperShadow = candle.high - Math.max(candle.open, candle.close);
  const totalRange = candle.high - candle.low;
  
  if (totalRange === 0) return null;
  
  // Shooting Star: cuerpo pequeño, sombra superior larga, sombra inferior pequeña
  const isSmallBody = bodySize / totalRange < 0.3;
  const isLongUpperShadow = upperShadow > bodySize * 2;
  const isShortLowerShadow = lowerShadow < bodySize * 0.5;
  
  if (isSmallBody && isLongUpperShadow && isShortLowerShadow) {
    const confidence = Math.min(upperShadow / bodySize / 3, 1);
    
    return {
      name: 'shooting_star',
      type: 'bearish',
      confidence,
      candleIndex: index,
      signal: 'Posible reversión bajista - Considerar venta',
      description: 'Estrella fugaz indica rechazo de precios altos'
    };
  }
  
  return null;
};

const detectEngulfing = (candles: Candle[], index: number): Pattern | null => {
  if (index < 1) return null;
  
  const current = candles[index];
  const previous = candles[index - 1];
  
  const currentIsBullish = current.close > current.open;
  const previousIsBullish = previous.close > previous.open;
  
  // Patrón envolvente alcista
  if (!previousIsBullish && currentIsBullish) {
    if (current.open < previous.close && current.close > previous.open) {
      return {
        name: 'engulfing',
        type: 'bullish',
        confidence: 0.8,
        candleIndex: index,
        startIndex: index - 1,
        endIndex: index,
        signal: 'Patrón envolvente alcista - Señal de compra fuerte',
        description: 'Vela alcista envuelve completamente a la bajista anterior'
      };
    }
  }
  
  // Patrón envolvente bajista
  if (previousIsBullish && !currentIsBullish) {
    if (current.open > previous.close && current.close < previous.open) {
      return {
        name: 'engulfing',
        type: 'bearish',
        confidence: 0.8,
        candleIndex: index,
        startIndex: index - 1,
        endIndex: index,
        signal: 'Patrón envolvente bajista - Señal de venta fuerte',
        description: 'Vela bajista envuelve completamente a la alcista anterior'
      };
    }
  }
  
  return null;
};

const detectHarami = (candles: Candle[], index: number): Pattern | null => {
  if (index < 1) return null;
  
  const current = candles[index];
  const previous = candles[index - 1];
  
  const currentBody = Math.abs(current.close - current.open);
  const previousBody = Math.abs(previous.close - previous.open);
  
  // La vela actual debe estar dentro del cuerpo de la anterior
  const isInsidePrevious = 
    Math.max(current.open, current.close) < Math.max(previous.open, previous.close) &&
    Math.min(current.open, current.close) > Math.min(previous.open, previous.close);
  
  // La vela actual debe ser más pequeña
  const isSmallerBody = currentBody < previousBody * 0.7;
  
  if (isInsidePrevious && isSmallerBody) {
    const previousIsBullish = previous.close > previous.open;
    
    return {
      name: 'harami',
      type: previousIsBullish ? 'bearish' : 'bullish',
      confidence: 0.6,
      candleIndex: index,
      startIndex: index - 1,
      endIndex: index,
      signal: previousIsBullish ? 
        'Harami bajista - Posible debilitamiento alcista' :
        'Harami alcista - Posible debilitamiento bajista',
      description: 'Vela pequeña dentro del cuerpo de la vela anterior'
    };
  }
  
  return null;
};

const detectMorningStar = (candles: Candle[], index: number): Pattern | null => {
  if (index < 2) return null;
  
  const third = candles[index];
  const second = candles[index - 1];
  const first = candles[index - 2];
  
  // Primera vela: bajista y grande
  const firstIsBearish = first.close < first.open;
  const firstBody = Math.abs(first.close - first.open);
  
  // Segunda vela: pequeña (doji o spinning top)
  const secondBody = Math.abs(second.close - second.open);
  const secondIsSmall = secondBody < firstBody * 0.5;
  
  // Tercera vela: alcista y grande
  const thirdIsBullish = third.close > third.open;
  const thirdBody = Math.abs(third.close - third.open);
  
  if (firstIsBearish && secondIsSmall && thirdIsBullish && thirdBody > firstBody * 0.5) {
    return {
      name: 'morning_star',
      type: 'bullish',
      confidence: 0.9,
      candleIndex: index,
      startIndex: index - 2,
      endIndex: index,
      signal: 'Estrella matutina - Fuerte señal de compra',
      description: 'Patrón de reversión alcista de tres velas'
    };
  }
  
  return null;
};

const detectEveningStar = (candles: Candle[], index: number): Pattern | null => {
  if (index < 2) return null;
  
  const third = candles[index];
  const second = candles[index - 1];
  const first = candles[index - 2];
  
  // Primera vela: alcista y grande
  const firstIsBullish = first.close > first.open;
  const firstBody = Math.abs(first.close - first.open);
  
  // Segunda vela: pequeña (doji o spinning top)
  const secondBody = Math.abs(second.close - second.open);
  const secondIsSmall = secondBody < firstBody * 0.5;
  
  // Tercera vela: bajista y grande
  const thirdIsBearish = third.close < third.open;
  const thirdBody = Math.abs(third.close - third.open);
  
  if (firstIsBullish && secondIsSmall && thirdIsBearish && thirdBody > firstBody * 0.5) {
    return {
      name: 'evening_star',
      type: 'bearish',
      confidence: 0.9,
      candleIndex: index,
      startIndex: index - 2,
      endIndex: index,
      signal: 'Estrella vespertina - Fuerte señal de venta',
      description: 'Patrón de reversión bajista de tres velas'
    };
  }
  
  return null;
};
