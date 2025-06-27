import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import CandlestickChart from './CandlestickChart';
import PatternDetector from './PatternDetector';
import PatternPredictor from './PatternPredictor';
import LearningEngine from './LearningEngine';
import PerformanceBenchmark from './PerformanceBenchmark';
import CameraIntegration from './CameraIntegration';
import RealTimeChart from './RealTimeChart';
import { Candle, Pattern } from '../types/trading';
import { generateSampleCandles, olympTradeAssets } from '../utils/sampleData';
import { detectPatterns } from '../utils/patternAnalysis';
import { BarChart3, TrendingUp, TrendingDown, AlertCircle, RefreshCw, Brain, Target, Gauge, Camera, Activity } from 'lucide-react';

const TradingDashboard: React.FC = () => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedAsset, setSelectedAsset] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1H');
  const [isLoading, setIsLoading] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [learningData, setLearningData] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const [showBenchmarks, setShowBenchmarks] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showRealTime, setShowRealTime] = useState(false);

  useEffect(() => {
    loadCandleData();
  }, [selectedAsset, timeframe]);

  const loadCandleData = async () => {
    setIsLoading(true);
    
    // Simular carga de datos
    setTimeout(() => {
      const sampleData = generateSampleCandles();
      setCandles(sampleData);
      
      const detectedPatterns = detectPatterns(sampleData);
      setPatterns(detectedPatterns);
      
      setIsLoading(false);
    }, 1000);
  };

  const getMarketSentiment = () => {
    const bullishPatterns = patterns.filter(p => p.type === 'bullish').length;
    const bearishPatterns = patterns.filter(p => p.type === 'bearish').length;
    
    if (bullishPatterns > bearishPatterns) return { sentiment: 'Alcista', color: 'text-green-500', icon: TrendingUp };
    if (bearishPatterns > bullishPatterns) return { sentiment: 'Bajista', color: 'text-red-500', icon: TrendingDown };
    return { sentiment: 'Neutral', color: 'text-yellow-500', icon: AlertCircle };
  };

  const getLastPrice = () => {
    if (candles.length === 0) return 0;
    return candles[candles.length - 1].close;
  };

  const getPriceChange = () => {
    if (candles.length < 2) return { change: 0, percentage: 0 };
    const current = candles[candles.length - 1].close;
    const previous = candles[candles.length - 2].close;
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return { change, percentage };
  };

  const marketSentiment = getMarketSentiment();
  const SentimentIcon = marketSentiment.icon;
  const priceChange = getPriceChange();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🤖 Detector de Patrones IA - OlympTrade Pro
              </h1>
              <p className="text-gray-600">
                Análisis avanzado con predicción, autoaprendizaje, benchmarks y cámaras en tiempo real
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Activo" />
                </SelectTrigger>
                <SelectContent>
                  {olympTradeAssets.map(asset => (
                    <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Tiempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1M">1M</SelectItem>
                  <SelectItem value="5M">5M</SelectItem>
                  <SelectItem value="15M">15M</SelectItem>
                  <SelectItem value="1H">1H</SelectItem>
                  <SelectItem value="4H">4H</SelectItem>
                  <SelectItem value="1D">1D</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={loadCandleData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced AI Controls */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setShowPredictions(!showPredictions)}
            variant={showPredictions ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Predicciones IA
          </Button>
          
          <Button 
            onClick={() => setShowLearning(!showLearning)}
            variant={showLearning ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Autoaprendizaje
          </Button>
          
          <Button 
            onClick={() => setShowBenchmarks(!showBenchmarks)}
            variant={showBenchmarks ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Gauge className="w-4 h-4" />
            Benchmarks
          </Button>
          
          <Button 
            onClick={() => setShowCamera(!showCamera)}
            variant={showCamera ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Camera className="w-4 h-4" />
            Cámara IA
          </Button>
          
          <Button 
            onClick={() => setShowRealTime(!showRealTime)}
            variant={showRealTime ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Tiempo Real
          </Button>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Precio Actual</p>
                  <p className="text-2xl font-bold">${getLastPrice().toFixed(4)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cambio</p>
                  <p className={`text-2xl font-bold ${priceChange.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange.change >= 0 ? '+' : ''}{priceChange.change.toFixed(4)}
                  </p>
                  <p className={`text-sm ${priceChange.percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange.percentage >= 0 ? '+' : ''}{priceChange.percentage.toFixed(2)}%
                  </p>
                </div>
                {priceChange.change >= 0 ? 
                  <TrendingUp className="w-8 h-8 text-green-500" /> : 
                  <TrendingDown className="w-8 h-8 text-red-500" />
                }
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sentimiento</p>
                  <p className={`text-2xl font-bold ${marketSentiment.color}`}>
                    {marketSentiment.sentiment}
                  </p>
                </div>
                <SentimentIcon className={`w-8 h-8 ${marketSentiment.color}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Patrones</p>
                  <p className="text-2xl font-bold">{patterns.length}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="default" className="text-xs">
                      {patterns.filter(p => p.type === 'bullish').length} ↑
                    </Badge>
                    <Badge variant="destructive" className="text-xs">
                      {patterns.filter(p => p.type === 'bearish').length} ↓
                    </Badge>
                  </div>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced AI Panels */}
        {showPredictions && (
          <PatternPredictor 
            candles={candles} 
            patterns={patterns}
            selectedAsset={selectedAsset}
            timeframe={timeframe}
          />
        )}

        {showLearning && (
          <LearningEngine 
            candles={candles} 
            patterns={patterns}
            selectedAsset={selectedAsset}
          />
        )}

        {showBenchmarks && (
          <PerformanceBenchmark 
            onBenchmarkComplete={(results) => {
              console.log('Benchmarks completados:', results);
            }}
          />
        )}

        {showCamera && (
          <CameraIntegration 
            onPatternDetected={(pattern) => {
              console.log('Patrón detectado por cámara:', pattern);
            }}
          />
        )}

        {showRealTime && (
          <RealTimeChart 
            symbol={selectedAsset}
            onDataUpdate={(data) => {
              console.log('Datos actualizados:', data.length);
            }}
          />
        )}

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Gráfico de Velas - {selectedAsset} ({timeframe})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Cargando datos...</span>
              </div>
            ) : (
              <CandlestickChart candles={candles} patterns={patterns} />
            )}
          </CardContent>
        </Card>

        {/* Pattern Analysis */}
        <PatternDetector candles={candles} />

        {/* Enhanced Trading Tips */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Consejos para OlympTrade Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Patrones Alcistas</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• <strong>Hammer:</strong> Ideal para opciones CALL después de tendencia bajista</li>
                  <li>• <strong>Engulfing Alcista:</strong> Señal fuerte de reversión al alza</li>
                  <li>• <strong>Morning Star:</strong> Patrón de 3 velas muy confiable para CALL</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Patrones Bajistas</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• <strong>Shooting Star:</strong> Perfecto para opciones PUT en resistencias</li>
                  <li>• <strong>Engulfing Bajista:</strong> Fuerte señal de reversión a la baja</li>
                  <li>• <strong>Evening Star:</strong> Patrón de 3 velas confiable para PUT</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🤖 Nuevas Capacidades IA Pro</h4>
              <ul className="text-sm space-y-1 text-blue-700">
                <li>• <strong>Benchmarks:</strong> Analiza el rendimiento de diferentes modelos IA</li>
                <li>• <strong>Cámara IA:</strong> Detecta patrones visuales en tiempo real</li>
                <li>• <strong>Gráficos Live:</strong> Datos en tiempo real con predicciones</li>
                <li>• <strong>Autoaprendizaje:</strong> Mejora automática basada en resultados</li>
                <li>• <strong>Análisis Integral:</strong> Combina múltiples fuentes de datos</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradingDashboard;
