
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Play, Pause, RotateCcw, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface DataPoint {
  timestamp: number;
  price: number;
  volume: number;
  prediction?: number;
  confidence?: number;
  pattern?: string;
}

interface RealTimeChartProps {
  symbol?: string;
  onDataUpdate?: (data: DataPoint[]) => void;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({ 
  symbol = 'EUR/USD', 
  onDataUpdate 
}) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(1.0850);
  const [priceChange, setPriceChange] = useState(0);
  const [volume, setVolume] = useState(0);
  const [latestPattern, setLatestPattern] = useState<string>('');
  
  const intervalRef = useRef<number | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Inicializar con datos históricos
    initializeData();
    
    return () => {
      stopStreaming();
    };
  }, []);

  const initializeData = () => {
    const initialData: DataPoint[] = [];
    const basePrice = 1.0850;
    const now = Date.now();
    
    for (let i = 60; i >= 0; i--) {
      const price = basePrice + (Math.random() - 0.5) * 0.01;
      const volume = Math.random() * 1000 + 100;
      
      initialData.push({
        timestamp: now - (i * 1000),
        price: price,
        volume: volume,
        prediction: Math.random() > 0.7 ? price + (Math.random() - 0.5) * 0.005 : undefined,
        confidence: Math.random() > 0.7 ? Math.random() * 0.4 + 0.6 : undefined
      });
    }
    
    setData(initialData);
    setCurrentPrice(initialData[initialData.length - 1].price);
  };

  const startStreaming = () => {
    if (isStreaming) return;
    
    setIsStreaming(true);
    
    // Simular WebSocket connection
    simulateWebSocket();
    
    // Generar datos en tiempo real
    intervalRef.current = window.setInterval(() => {
      generateNewDataPoint();
    }, 1000);
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  const simulateWebSocket = () => {
    // Simular conexión WebSocket
    console.log(`Conectando a WebSocket para ${symbol}...`);
    
    // En una implementación real, esto sería:
    // websocketRef.current = new WebSocket('wss://api.example.com/stream');
    // websocketRef.current.onmessage = (event) => {
    //   const newData = JSON.parse(event.data);
    //   processRealTimeData(newData);
    // };
  };

  const generateNewDataPoint = () => {
    const now = Date.now();
    const lastPrice = currentPrice;
    
    // Generar variación de precio más realista
    const volatility = 0.0001;
    const trend = Math.sin(now / 10000) * 0.0005; // Tendencia suave
    const noise = (Math.random() - 0.5) * volatility;
    const newPrice = lastPrice + trend + noise;
    
    // Detectar patrón ocasionalmente
    const patterns = ['Bullish Engulfing', 'Bearish Engulfing', 'Doji', 'Hammer', 'Shooting Star'];
    const detectedPattern = Math.random() > 0.9 ? patterns[Math.floor(Math.random() * patterns.length)] : '';
    
    if (detectedPattern) {
      setLatestPattern(detectedPattern);
    }
    
    const newVolume = Math.random() * 1000 + 100;
    const change = newPrice - lastPrice;
    
    setCurrentPrice(newPrice);
    setPriceChange(change);
    setVolume(newVolume);
    
    const newDataPoint: DataPoint = {
      timestamp: now,
      price: newPrice,
      volume: newVolume,
      prediction: Math.random() > 0.8 ? newPrice + (Math.random() - 0.5) * 0.002 : undefined,
      confidence: Math.random() > 0.8 ? Math.random() * 0.4 + 0.6 : undefined,
      pattern: detectedPattern || undefined
    };
    
    setData(prevData => {
      const newData = [...prevData, newDataPoint];
      // Mantener solo los últimos 60 puntos
      const trimmedData = newData.slice(-60);
      
      if (onDataUpdate) {
        onDataUpdate(trimmedData);
      }
      
      return trimmedData;
    });
  };

  const resetChart = () => {
    stopStreaming();
    initializeData();
    setLatestPattern('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatPrice = (price: number) => {
    return price.toFixed(5);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{formatTime(label)}</p>
          <p className="text-blue-600">
            Precio: {formatPrice(data.price)}
          </p>
          <p className="text-gray-600">
            Volumen: {Math.round(data.volume)}
          </p>
          {data.prediction && (
            <p className="text-purple-600">
              Predicción: {formatPrice(data.prediction)}
            </p>
          )}
          {data.confidence && (
            <p className="text-green-600">
              Confianza: {Math.round(data.confidence * 100)}%
            </p>
          )}
          {data.pattern && (
            <p className="text-orange-600 font-medium">
              Patrón: {data.pattern}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Gráfico en Tiempo Real - {symbol}
              {isStreaming && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Badge variant="default" className="text-xs">LIVE</Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatPrice(currentPrice)}
                </p>
                <p className={`text-sm ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange >= 0 ? '+' : ''}{(priceChange * 10000).toFixed(1)} pips
                </p>
              </div>
              
              {priceChange >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-500" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-500" />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              {!isStreaming ? (
                <Button onClick={startStreaming} className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Iniciar Stream
                </Button>
              ) : (
                <Button onClick={stopStreaming} variant="destructive" className="flex items-center gap-2">
                  <Pause className="w-4 h-4" />
                  Pausar Stream
                </Button>
              )}
              
              <Button onClick={resetChart} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-gray-600">Volumen: </span>
                <span className="font-medium">{Math.round(volume)}</span>
              </div>
              
              {latestPattern && (
                <Badge variant="outline" className="text-orange-600">
                  {latestPattern}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatTime}
                  domain={['dataMin', 'dataMax']}
                />
                <YAxis 
                  domain={['dataMin - 0.001', 'dataMax + 0.001']}
                  tickFormatter={formatPrice}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Línea de precio principal */}
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={false}
                  connectNulls={false}
                />
                
                {/* Línea de predicción */}
                <Line 
                  type="monotone" 
                  dataKey="prediction" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                  connectNulls={false}
                />
                
                {/* Línea de referencia para precio actual */}
                <ReferenceLine 
                  y={currentPrice} 
                  stroke="#ef4444" 
                  strokeDasharray="2 2" 
                  label={{ value: "Actual", position: "insideTopRight" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span>Precio Real</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-purple-500 border-dashed"></div>
              <span>Predicción IA</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500 border-dashed"></div>
              <span>Nivel Actual</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeChart;
