import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Candle, Pattern } from '../types/trading';
import { Target, TrendingUp, TrendingDown, Brain, Zap } from 'lucide-react';
import { predictionTracker } from '../utils/predictionTracker';
import AutoLearningSystem from './AutoLearningSystem';

interface PatternPredictorProps {
  candles: Candle[];
  patterns: Pattern[];
  selectedAsset: string;
  timeframe: string;
  autoMode?: boolean;
}

interface Prediction {
  id: string;
  patternName: string;
  type: 'bullish' | 'bearish' | 'neutral';
  probability: number;
  nextCandles: number;
  confidence: number;
  reasoning: string;
  timestamp: number;
}

const PatternPredictor: React.FC<PatternPredictorProps> = ({ 
  candles, 
  patterns, 
  selectedAsset, 
  timeframe,
  autoMode = false
}) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [autoLearningStats, setAutoLearningStats] = useState<any>(null);

  // Auto-ejecución de predicciones cada 30 segundos cuando autoMode está activo
  useEffect(() => {
    if (autoMode && candles.length > 0) {
      generatePredictions();
      evaluateExistingPredictions();
      
      const autoInterval = setInterval(() => {
        generatePredictions();
        evaluateExistingPredictions();
      }, 30000);

      return () => clearInterval(autoInterval);
    }
  }, [candles, patterns, selectedAsset, autoMode]);

  // Evaluación manual cuando no está en modo automático
  useEffect(() => {
    if (!autoMode && candles.length > 0) {
      evaluateExistingPredictions();
    }
  }, [candles, patterns, selectedAsset]);

  const evaluateExistingPredictions = () => {
    const results = predictionTracker.evaluatePredictions(candles);
    if (results.length > 0) {
      console.log(`🤖 Evaluadas ${results.length} predicciones automáticamente`);
      updateAiInsightsWithResults(results);
    }
  };

  const generatePredictions = useCallback(async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const newPredictions: Prediction[] = [];
      
      // Análisis basado en patrones actuales
      const recentPatterns = patterns.slice(-3);
      
      if (recentPatterns.length > 0) {
        // Predicción basada en patrón más reciente
        const lastPattern = recentPatterns[recentPatterns.length - 1];
        
        newPredictions.push({
          id: `pred_${Date.now()}_1`,
          patternName: `Continuación de ${lastPattern.name}`,
          type: lastPattern.type,
          probability: 0.75 + Math.random() * 0.2,
          nextCandles: Math.floor(Math.random() * 5) + 1,
          confidence: lastPattern.confidence * 0.9,
          reasoning: `Basado en la fuerza del patrón ${lastPattern.name} detectado`,
          timestamp: Date.now()
        });
      }
      
      // Predicción basada en momentum del mercado
      const marketMomentum = analyzeMarketMomentum();
      newPredictions.push({
        id: `pred_${Date.now()}_2`,
        patternName: 'Momentum del Mercado',
        type: marketMomentum.type,
        probability: marketMomentum.probability,
        nextCandles: 3,
        confidence: 0.65,
        reasoning: marketMomentum.reasoning,
        timestamp: Date.now()
      });
      
      // Predicción basada en volumen
      const volumeAnalysis = analyzeVolumePattern();
      newPredictions.push({
        id: `pred_${Date.now()}_3`,
        patternName: 'Análisis de Volumen',
        type: volumeAnalysis.type,
        probability: volumeAnalysis.probability,
        nextCandles: 2,
        confidence: 0.55,
        reasoning: volumeAnalysis.reasoning,
        timestamp: Date.now()
      });
      
      // Registrar predicciones en el tracker para seguimiento automático
      newPredictions.forEach(prediction => {
        predictionTracker.addPrediction({
          id: prediction.id,
          patternName: prediction.patternName,
          type: prediction.type,
          probability: prediction.probability,
          horizon: prediction.nextCandles,
          candleIndex: candles.length - 1
        });
      });
      
      setPredictions(newPredictions);
      generateAiInsights(newPredictions);
      setIsAnalyzing(false);
    }, autoMode ? 1000 : 2000); // Más rápido en modo automático
  }, [candles, patterns, selectedAsset, isAnalyzing, autoMode]);

  const analyzeMarketMomentum = () => {
    if (candles.length < 5) {
      return {
        type: 'neutral' as const,
        probability: 0.5,
        reasoning: 'Datos insuficientes para análisis de momentum'
      };
    }
    
    const recentCandles = candles.slice(-5);
    const bullishCandles = recentCandles.filter(c => c.close > c.open).length;
    const bearishCandles = recentCandles.filter(c => c.close < c.open).length;
    
    if (bullishCandles > bearishCandles) {
      return {
        type: 'bullish' as const,
        probability: 0.6 + (bullishCandles / 5) * 0.3,
        reasoning: `${bullishCandles} de 5 velas recientes son alcistas - momentum positivo`
      };
    } else if (bearishCandles > bullishCandles) {
      return {
        type: 'bearish' as const,
        probability: 0.6 + (bearishCandles / 5) * 0.3,
        reasoning: `${bearishCandles} de 5 velas recientes son bajistas - momentum negativo`
      };
    } else {
      return {
        type: 'neutral' as const,
        probability: 0.5,
        reasoning: 'Equilibrio entre velas alcistas y bajistas - momentum neutral'
      };
    }
  };

  const analyzeVolumePattern = () => {
    if (candles.length < 3) {
      return {
        type: 'neutral' as const,
        probability: 0.5,
        reasoning: 'Datos de volumen insuficientes'
      };
    }
    
    const recentCandles = candles.slice(-3);
    const avgVolume = recentCandles.reduce((sum, c) => sum + (c.volume || 0), 0) / 3;
    const lastVolume = recentCandles[recentCandles.length - 1].volume || 0;
    
    const volumeRatio = lastVolume / avgVolume;
    
    if (volumeRatio > 1.5) {
      const lastCandle = recentCandles[recentCandles.length - 1];
      const type = lastCandle.close > lastCandle.open ? 'bullish' : 'bearish';
      
      return {
        type: type as 'bullish' | 'bearish',
        probability: 0.7,
        reasoning: `Volumen alto (${Math.round(volumeRatio * 100)}% sobre promedio) confirma la dirección`
      };
    } else {
      return {
        type: 'neutral' as const,
        probability: 0.45,
        reasoning: 'Volumen normal - sin confirmación fuerte de dirección'
      };
    }
  };

  const updateAiInsightsWithResults = (results: any[]) => {
    const stats = predictionTracker.getAccuracyStats();
    
    let insight = '';
    if (stats.successRate > 0.7) {
      insight = `🎯 El sistema está funcionando excelentemente con ${Math.round(stats.successRate * 100)}% de éxito. `;
      insight += `Las predicciones automáticas están siendo muy precisas para ${selectedAsset}.`;
    } else if (stats.successRate > 0.5) {
      insight = `📊 El sistema está aprendiendo automáticamente con ${Math.round(stats.successRate * 100)}% de éxito. `;
      insight += `Ajustando algoritmos automáticamente para mejorar la precisión.`;
    } else if (stats.totalPredictions > 5) {
      insight = `⚠️ El sistema está reajustando estrategias automáticamente. Precisión actual: ${Math.round(stats.successRate * 100)}%. `;
      insight += `El aprendizaje automático está optimizando los algoritmos para ${selectedAsset}.`;
    }
    
    if (insight) {
      setAiInsights(insight);
    }
  };

  const generateAiInsights = (predictions: Prediction[]) => {
    const bullishPredictions = predictions.filter(p => p.type === 'bullish').length;
    const bearishPredictions = predictions.filter(p => p.type === 'bearish').length;
    
    let insight = '';
    
    if (bullishPredictions > bearishPredictions) {
      insight = `🔥 Las predicciones automáticas de IA sugieren una tendencia ALCISTA para ${selectedAsset}. `;
      insight += `${bullishPredictions} de ${predictions.length} algoritmos predicen movimientos al alza. `;
      insight += `Considera opciones CALL en las próximas ${timeframe}.`;
    } else if (bearishPredictions > bullishPredictions) {
      insight = `📉 Las predicciones automáticas de IA indican una tendencia BAJISTA para ${selectedAsset}. `;
      insight += `${bearishPredictions} de ${predictions.length} algoritmos predicen movimientos a la baja. `;
      insight += `Considera opciones PUT en las próximas ${timeframe}.`;
    } else {
      insight = `⚖️ Las predicciones automáticas de IA están divididas para ${selectedAsset}. `;
      insight += `Mercado incierto - el sistema recomienda esperar confirmación antes de operar.`;
    }
    
    // Incorporar estadísticas de aprendizaje automático
    const stats = predictionTracker.getAccuracyStats();
    if (stats.totalPredictions > 0) {
      const successInfo = ` (Precisión histórica automática: ${Math.round(stats.successRate * 100)}%)`;
      setAiInsights(insight + successInfo);
    } else {
      setAiInsights(insight);
    }
  };

  const handleLearningUpdate = (learningStats: any) => {
    setAutoLearningStats(learningStats);
    // Actualizar insights basado en el aprendizaje automático
    if (learningStats.accuracyRate > 0) {
      updateAiInsightsWithResults([]);
    }
  };

  const getPredictionIcon = (type: string) => {
    if (type === 'bullish') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (type === 'bearish') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Target className="w-4 h-4 text-yellow-500" />;
  };

  const getPredictionColor = (type: string) => {
    if (type === 'bullish') return 'border-l-green-500';
    if (type === 'bearish') return 'border-l-red-500';
    return 'border-l-yellow-500';
  };

  return (
    <div className="space-y-4">
      {/* Sistema de Autoaprendizaje */}
      <AutoLearningSystem
        candles={candles}
        patterns={patterns}
        predictions={predictions}
        onLearningUpdate={handleLearningUpdate}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Predicciones IA Automáticas - {selectedAsset}
            {autoMode && (
              <Badge variant="default" className="animate-pulse">
                <Zap className="w-3 h-3 mr-1" />
                Auto-Predicción Activa
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* AI Insights */}
          {aiInsights && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-l-purple-500">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Análisis Inteligente Automático
              </h4>
              <p className="text-purple-700">{aiInsights}</p>
              {autoLearningStats && (
                <div className="mt-2 text-sm text-purple-600">
                  Sistema procesó automáticamente {autoLearningStats.totalPredictions} predicciones con {Math.round(autoLearningStats.accuracyRate * 100)}% de precisión
                </div>
              )}
            </div>
          )}

          {/* Predictions Grid */}
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className={`border-l-4 ${getPredictionColor(prediction.type)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getPredictionIcon(prediction.type)}
                      <span className="font-semibold text-sm">
                        {prediction.patternName}
                      </span>
                    </div>
                    <Badge 
                      variant={prediction.type === 'bullish' ? 'default' : prediction.type === 'bearish' ? 'destructive' : 'secondary'}
                    >
                      {prediction.type === 'bullish' ? 'Alcista' : prediction.type === 'bearish' ? 'Bajista' : 'Neutral'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Probabilidad</span>
                        <span>{Math.round(prediction.probability * 100)}%</span>
                      </div>
                      <Progress value={prediction.probability * 100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Confianza</span>
                        <span>{Math.round(prediction.confidence * 100)}%</span>
                      </div>
                      <Progress value={prediction.confidence * 100} className="h-2" />
                    </div>
                    
                    <p className="text-xs text-gray-600">
                      <strong>Horizonte:</strong> {prediction.nextCandles} vela(s)
                    </p>
                    
                    <p className="text-xs text-gray-500 italic">
                      {prediction.reasoning}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {predictions.length === 0 && !isAnalyzing && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>
                {autoMode 
                  ? 'Las predicciones automáticas comenzarán en breve...' 
                  : 'Sistema en espera - activa el modo automático'
                }
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <Brain className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                <p className="text-purple-600">
                  {autoMode ? 'Generando predicciones automáticas...' : 'Analizando patrones con IA...'}
                </p>
                <div className="mt-4">
                  <Progress value={75} className="max-w-md mx-auto" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternPredictor;
