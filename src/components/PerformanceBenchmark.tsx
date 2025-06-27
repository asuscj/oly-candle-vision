
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gauge, Clock, MemoryStick, Cpu, Zap, ChartLine } from 'lucide-react';

interface BenchmarkResult {
  modelName: string;
  inferenceTime: number;
  memoryUsage: number;
  cpuUsage: number;
  accuracy: number;
  predictions: number;
  timestamp: number;
}

interface PerformanceBenchmarkProps {
  onBenchmarkComplete?: (results: BenchmarkResult[]) => void;
}

const PerformanceBenchmark: React.FC<PerformanceBenchmarkProps> = ({ onBenchmarkComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [currentTest, setCurrentTest] = useState('');
  const [progress, setProgress] = useState(0);

  const models = [
    { name: 'Patrón Rápido', complexity: 'low' },
    { name: 'Análisis Técnico', complexity: 'medium' },
    { name: 'IA Avanzada', complexity: 'high' },
    { name: 'Predicción Neural', complexity: 'ultra' }
  ];

  const runBenchmarks = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      setCurrentTest(`Ejecutando ${model.name}...`);
      
      const startTime = performance.now();
      const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Simular procesamiento del modelo
      await simulateModelProcessing(model.complexity);
      
      const endTime = performance.now();
      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      const result: BenchmarkResult = {
        modelName: model.name,
        inferenceTime: endTime - startTime,
        memoryUsage: Math.max(0, endMemory - startMemory) / 1024 / 1024, // MB
        cpuUsage: Math.random() * 30 + 10, // Simulado
        accuracy: Math.random() * 0.3 + 0.7, // 70-100%
        predictions: Math.floor(Math.random() * 100) + 50,
        timestamp: Date.now()
      };
      
      setResults(prev => [...prev, result]);
      setProgress(((i + 1) / models.length) * 100);
    }

    setCurrentTest('Benchmark completado');
    setIsRunning(false);
    
    if (onBenchmarkComplete) {
      onBenchmarkComplete(results);
    }
  };

  const simulateModelProcessing = (complexity: string): Promise<void> => {
    return new Promise((resolve) => {
      const delays = {
        low: 200,
        medium: 800,
        high: 1500,
        ultra: 2500
      };
      
      // Simular trabajo computacional
      const start = Date.now();
      const delay = delays[complexity as keyof typeof delays] || 500;
      
      const doWork = () => {
        if (Date.now() - start < delay) {
          // Simular carga de CPU
          for (let i = 0; i < 10000; i++) {
            Math.random() * Math.random();
          }
          setTimeout(doWork, 10);
        } else {
          resolve();
        }
      };
      
      doWork();
    });
  };

  const getPerformanceColor = (value: number, metric: string) => {
    if (metric === 'inferenceTime') {
      if (value < 500) return 'text-green-500';
      if (value < 1000) return 'text-yellow-500';
      return 'text-red-500';
    }
    if (metric === 'memoryUsage') {
      if (value < 10) return 'text-green-500';
      if (value < 50) return 'text-yellow-500';
      return 'text-red-500';
    }
    if (metric === 'accuracy') {
      if (value > 0.9) return 'text-green-500';
      if (value > 0.8) return 'text-yellow-500';
      return 'text-red-500';
    }
    return 'text-gray-500';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-500" />
            Benchmarks de Rendimiento IA
            <Button 
              onClick={runBenchmarks} 
              disabled={isRunning}
              size="sm"
              className="ml-auto"
            >
              <Zap className="w-4 h-4 mr-1" />
              {isRunning ? 'Ejecutando...' : 'Ejecutar Benchmarks'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-blue-700 font-medium">{currentTest}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {results.length > 0 && (
            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">{result.modelName}</h4>
                      <Badge variant="outline">
                        {result.predictions} predicciones
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <Clock className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm text-gray-600">Tiempo Inferencia</p>
                        <p className={`text-lg font-bold ${getPerformanceColor(result.inferenceTime, 'inferenceTime')}`}>
                          {result.inferenceTime.toFixed(0)}ms
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <MemoryStick className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm text-gray-600">Memoria</p>
                        <p className={`text-lg font-bold ${getPerformanceColor(result.memoryUsage, 'memoryUsage')}`}>
                          {result.memoryUsage.toFixed(1)}MB
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <Cpu className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm text-gray-600">CPU</p>
                        <p className="text-lg font-bold text-orange-500">
                          {result.cpuUsage.toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <ChartLine className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                        <p className="text-sm text-gray-600">Precisión</p>
                        <p className={`text-lg font-bold ${getPerformanceColor(result.accuracy, 'accuracy')}`}>
                          {(result.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {results.length === 0 && !isRunning && (
            <div className="text-center py-8 text-gray-500">
              <Gauge className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Haz clic en "Ejecutar Benchmarks" para analizar el rendimiento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceBenchmark;
