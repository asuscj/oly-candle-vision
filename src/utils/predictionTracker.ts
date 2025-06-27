
interface TrackedPrediction {
  id: string;
  timestamp: number;
  candleIndex: number;
  patternName: string;
  type: 'bullish' | 'bearish' | 'neutral';
  probability: number;
  horizon: number;
  evaluated: boolean;
}

interface PredictionResult {
  predictionId: string;
  success: boolean;
  actualOutcome: 'bullish' | 'bearish' | 'neutral';
  accuracy: number;
  evaluatedAt: number;
}

class PredictionTracker {
  private predictions: TrackedPrediction[] = [];
  private results: PredictionResult[] = [];

  addPrediction(prediction: {
    id: string;
    patternName: string;
    type: 'bullish' | 'bearish' | 'neutral';
    probability: number;
    horizon: number;
    candleIndex: number;
  }) {
    const tracked: TrackedPrediction = {
      ...prediction,
      timestamp: Date.now(),
      evaluated: false
    };
    
    this.predictions.push(tracked);
    this.cleanOldPredictions();
  }

  evaluatePredictions(candles: any[]): PredictionResult[] {
    const newResults: PredictionResult[] = [];
    
    this.predictions.forEach(prediction => {
      if (prediction.evaluated) return;
      
      // Verificar si ha pasado suficiente tiempo para evaluar
      const targetCandleIndex = prediction.candleIndex + prediction.horizon;
      if (candles.length <= targetCandleIndex) return;
      
      const startCandle = candles[prediction.candleIndex];
      const endCandle = candles[targetCandleIndex];
      
      if (!startCandle || !endCandle) return;
      
      const actualOutcome = this.determineOutcome(startCandle, endCandle);
      const success = prediction.type === actualOutcome;
      const accuracy = success ? prediction.probability : 1 - prediction.probability;
      
      const result: PredictionResult = {
        predictionId: prediction.id,
        success,
        actualOutcome,
        accuracy,
        evaluatedAt: Date.now()
      };
      
      this.results.push(result);
      newResults.push(result);
      prediction.evaluated = true;
    });
    
    return newResults;
  }

  private determineOutcome(startCandle: any, endCandle: any): 'bullish' | 'bearish' | 'neutral' {
    const priceChange = (endCandle.close - startCandle.close) / startCandle.close;
    
    if (priceChange > 0.015) return 'bullish'; // >1.5% subida
    if (priceChange < -0.015) return 'bearish'; // >1.5% bajada
    return 'neutral';
  }

  getAccuracyStats() {
    if (this.results.length === 0) {
      return {
        totalPredictions: 0,
        successRate: 0,
        averageAccuracy: 0,
        patternStats: {}
      };
    }
    
    const successful = this.results.filter(r => r.success).length;
    const successRate = successful / this.results.length;
    const averageAccuracy = this.results.reduce((sum, r) => sum + r.accuracy, 0) / this.results.length;
    
    // Estadísticas por patrón
    const patternStats: { [key: string]: { total: number; success: number; accuracy: number } } = {};
    
    this.predictions.forEach(pred => {
      const result = this.results.find(r => r.predictionId === pred.id);
      if (!result) return;
      
      if (!patternStats[pred.patternName]) {
        patternStats[pred.patternName] = { total: 0, success: 0, accuracy: 0 };
      }
      
      patternStats[pred.patternName].total++;
      if (result.success) {
        patternStats[pred.patternName].success++;
      }
      patternStats[pred.patternName].accuracy += result.accuracy;
    });
    
    // Calcular promedios
    Object.keys(patternStats).forEach(pattern => {
      const stats = patternStats[pattern];
      stats.accuracy = stats.accuracy / stats.total;
    });
    
    return {
      totalPredictions: this.results.length,
      successRate,
      averageAccuracy,
      patternStats
    };
  }

  private cleanOldPredictions() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.predictions = this.predictions.filter(p => p.timestamp > oneHourAgo);
    this.results = this.results.filter(r => r.evaluatedAt > oneHourAgo);
  }

  getRecentResults(count: number = 10): PredictionResult[] {
    return this.results
      .sort((a, b) => b.evaluatedAt - a.evaluatedAt)
      .slice(0, count);
  }
}

export const predictionTracker = new PredictionTracker();
export type { TrackedPrediction, PredictionResult };
