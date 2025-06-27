
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Candle, Pattern } from '../types/trading';
import { Brain, CheckCircle, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';

interface PredictionOutcome {
  id: string;
  patternName: string;
  predictedType: 'bullish' | 'bearish' | 'neutral';
  actualOutcome: 'bullish' | 'bearish' | 'neutral';
  accuracy: number;
  timestamp: number;
  candleIndex: number;
  success: boolean;
}

interface AutoLearningStats {
  totalPredictions: number;
  successfulPredictions: number;
  accuracyRate: number;
  patternAccuracy: { [key: string]: number };
  recentImprovements: string[];
  learningProgress: number;
}

interface AutoLearningSystemProps {
  candles: Candle[];
  patterns: Pattern[];
  predictions: any[];
  onLearningUpdate?: (stats: AutoLearningStats) => void;
}

const AutoLearningSystem: React.FC<AutoLearningSystemProps> = ({ 
  candles, 
  patterns, 
  predictions,
  onLearningUpdate 
}) => {
  const [outcomes, setOutcomes] = useState<PredictionOutcome[]>([]);
  const [stats, setStats] = useState<AutoLearningStats>({
    totalPredictions: 0,
    successfulPredictions: 0,
    accuracyRate: 0,
    patternAccuracy: {},
    recentImprovements: [],
    learningProgress: 0
  });
  const [isLearning, setIsLearning] = useState(false);

  // Monitorear nuevas predicciones automáticamente
  useEffect(() => {
    if (predictions.length > 0) {
      monitorPredictions();
    }
  }, [predictions, candles]);

  // Evaluación automática cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (outcomes.length > 0) {
        automaticLearning();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [outcomes]);

  const monitorPredictions = useCallback(() => {
    if (candles.length < 5) return;

    predictions.forEach(prediction => {
      // Verificar si ya evaluamos esta predicción
      const existingOutcome = outcomes.find(o => o.id === prediction.id);
      if (existingOutcome) return;

      // Evaluar predicción después del horizonte temporal
      const predictionCandle = candles[candles.length - prediction.nextCandles];
      if (!predictionCandle) return;

      const currentCandle = candles[candles.length - 1];
      const actualOutcome = evaluateActualOutcome(predictionCandle, currentCandle);
      
      const outcome: PredictionOutcome = {
        id: prediction.id,
        patternName: prediction.patternName,
        predictedType: prediction.type,
        actualOutcome,
        accuracy: calculateAccuracy(prediction.type, actualOutcome, prediction.probability),
        timestamp: Date.now(),
        candleIndex: candles.length - 1,
        success: prediction.type === actualOutcome
      };

      setOutcomes(prev => [...prev, outcome]);
    });
  }, [candles, predictions, outcomes]);

  const evaluateActualOutcome = (startCandle: Candle, endCandle: Candle): 'bullish' | 'bearish' | 'neutral' => {
    const priceChange = (endCandle.close - startCandle.close) / startCandle.close;
    
    if (priceChange > 0.01) return 'bullish'; // >1% subida
    if (priceChange < -0.01) return 'bearish'; // >1% bajada
    return 'neutral';
  };

  const calculateAccuracy = (predicted: string, actual: string, probability: number): number => {
    if (predicted === actual) {
      return probability; // Precisión basada en la confianza original
    } else {
      return 1 - probability; // Penalización por predicción incorrecta
    }
  };

  const automaticLearning = useCallback(async () => {
    if (isLearning) return;
    
    setIsLearning(true);
    
    // Calcular estadísticas actualizadas
    const totalPredictions = outcomes.length;
    const successfulPredictions = outcomes.filter(o => o.success).length;
    const accuracyRate = totalPredictions > 0 ? successfulPredictions / totalPredictions : 0;
    
    // Analizar precisión por patrón
    const patternAccuracy: { [key: string]: number } = {};
    const patternCounts: { [key: string]: { success: number; total: number } } = {};
    
    outcomes.forEach(outcome => {
      if (!patternCounts[outcome.patternName]) {
        patternCounts[outcome.patternName] = { success: 0, total: 0 };
      }
      patternCounts[outcome.patternName].total++;
      if (outcome.success) {
        patternCounts[outcome.patternName].success++;
      }
    });
    
    Object.keys(patternCounts).forEach(pattern => {
      const counts = patternCounts[pattern];
      patternAccuracy[pattern] = counts.total > 0 ? counts.success / counts.total : 0;
    });
    
    // Identificar mejoras recientes
    const recentOutcomes = outcomes.slice(-10);
    const recentAccuracy = recentOutcomes.length > 0 ? 
      recentOutcomes.filter(o => o.success).length / recentOutcomes.length : 0;
    
    const improvements: string[] = [];
    if (recentAccuracy > accuracyRate + 0.1) {
      improvements.push('Mejora significativa en predicciones recientes');
    }
    
    // Detectar patrones con baja precisión para ajuste
    Object.entries(patternAccuracy).forEach(([pattern, accuracy]) => {
      if (accuracy < 0.4 && patternCounts[pattern].total >= 3) {
        improvements.push(`Ajustando algoritmo para patrón ${pattern} (precisión baja: ${Math.round(accuracy * 100)}%)`);
      } else if (accuracy > 0.8 && patternCounts[pattern].total >= 5) {
        improvements.push(`Patrón ${pattern} optimizado exitosamente (precisión: ${Math.round(accuracy * 100)}%)`);
      }
    });
    
    const newStats: AutoLearningStats = {
      totalPredictions,
      successfulPredictions,
      accuracyRate,
      patternAccuracy,
      recentImprovements: improvements.slice(0, 3),
      learningProgress: Math.min(totalPredictions * 2, 100)
    };
    
    setStats(newStats);
    
    if (onLearningUpdate) {
      onLearningUpdate(newStats);
    }
    
    // Simular tiempo de procesamiento de aprendizaje
    setTimeout(() => {
      setIsLearning(false);
    }, 2000);
  }, [outcomes, isLearning, onLearningUpdate]);

  const getOutcomeIcon = (outcome: PredictionOutcome) => {
    if (outcome.success) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy > 0.7) return 'text-green-600';
    if (accuracy > 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Sistema de Autoaprendizaje
            {isLearning && (
              <Badge variant="outline" className="animate-pulse">
                <Brain className="w-3 h-3 mr-1" />
                Aprendiendo...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Estadísticas de Aprendizaje */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalPredictions}
              </div>
              <div className="text-sm text-gray-500">Predicciones Totales</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.successfulPredictions}
              </div>
              <div className="text-sm text-gray-500">Exitosas</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getAccuracyColor(stats.accuracyRate)}`}>
                {Math.round(stats.accuracyRate * 100)}%
              </div>
              <div className="text-sm text-gray-500">Precisión General</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(stats.learningProgress)}%
              </div>
              <div className="text-sm text-gray-500">Progreso IA</div>
            </div>
          </div>

          {/* Progreso de Aprendizaje */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso de Autoaprendizaje</span>
              <span>{Math.round(stats.learningProgress)}%</span>
            </div>
            <Progress value={stats.learningProgress} className="h-3" />
          </div>

          {/* Mejoras Recientes */}
          {stats.recentImprovements.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Mejoras Automáticas Recientes
              </h4>
              <div className="space-y-2">
                {stats.recentImprovements.map((improvement, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Precisión por Patrón */}
          {Object.keys(stats.patternAccuracy).length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Precisión por Patrón (Automática)</h4>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(stats.patternAccuracy).map(([pattern, accuracy]) => (
                  <div key={pattern} className="p-3 border rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">
                        {pattern.replace('_', ' ')}
                      </span>
                      <Badge variant={accuracy > 0.7 ? 'default' : accuracy > 0.5 ? 'secondary' : 'destructive'}>
                        {Math.round(accuracy * 100)}%
                      </Badge>
                    </div>
                    <Progress value={accuracy * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados Recientes */}
          {outcomes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Evaluaciones Automáticas Recientes</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {outcomes.slice(-5).reverse().map((outcome, index) => (
                  <div key={outcome.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getOutcomeIcon(outcome)}
                      <span className="font-medium text-sm capitalize">
                        {outcome.patternName.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        Predicho: {outcome.predictedType} | Real: {outcome.actualOutcome}
                      </span>
                      <Badge variant={outcome.success ? 'default' : 'destructive'} className="text-xs">
                        {Math.round(outcome.accuracy * 100)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {outcomes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>El sistema comenzará a aprender automáticamente cuando se generen predicciones</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoLearningSystem;
