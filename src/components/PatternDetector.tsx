
import React, { useState, useEffect } from 'react';
import { Candle, Pattern } from '../types/trading';
import { detectPatterns } from '../utils/patternAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface PatternDetectorProps {
  candles: Candle[];
}

const PatternDetector: React.FC<PatternDetectorProps> = ({ candles }) => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<string>('all');

  useEffect(() => {
    if (candles.length > 0) {
      const detectedPatterns = detectPatterns(candles);
      setPatterns(detectedPatterns);
    }
  }, [candles]);

  const patternTypes = [
    'all', 'doji', 'hammer', 'hanging_man', 'shooting_star', 
    'engulfing', 'harami', 'morning_star', 'evening_star'
  ];

  const filteredPatterns = selectedPattern === 'all' 
    ? patterns 
    : patterns.filter(p => p.name === selectedPattern);

  const getPatternIcon = (type: string) => {
    if (type === 'bullish') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (type === 'bearish') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  };

  const getPatternDescription = (pattern: Pattern) => {
    const descriptions: { [key: string]: string } = {
      doji: "Indecisión del mercado. Precio de apertura y cierre muy similares.",
      hammer: "Patrón alcista. Cuerpo pequeño con sombra inferior larga.",
      hanging_man: "Patrón bajista. Similar al martillo pero en tendencia alcista.",
      shooting_star: "Patrón bajista. Cuerpo pequeño con sombra superior larga.",
      engulfing: "Un patrón de reversión donde una vela envuelve completamente a la anterior.",
      harami: "Patrón de indecisión donde una vela pequeña está dentro del rango de la anterior.",
      morning_star: "Patrón alcista de tres velas que indica reversión de tendencia bajista.",
      evening_star: "Patrón bajista de tres velas que indica reversión de tendencia alcista."
    };
    return descriptions[pattern.name] || "Patrón detectado";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Detector de Patrones - OlympTrade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {patternTypes.map(type => (
              <Button
                key={type}
                variant={selectedPattern === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPattern(type)}
                className="capitalize"
              >
                {type.replace('_', ' ')}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatterns.map((pattern, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPatternIcon(pattern.type)}
                      <span className="font-semibold capitalize">
                        {pattern.name.replace('_', ' ')}
                      </span>
                    </div>
                    <Badge 
                      variant={pattern.type === 'bullish' ? 'default' : pattern.type === 'bearish' ? 'destructive' : 'secondary'}
                    >
                      {pattern.type === 'bullish' ? 'Alcista' : pattern.type === 'bearish' ? 'Bajista' : 'Neutral'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {getPatternDescription(pattern)}
                  </p>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Confianza: {Math.round(pattern.confidence * 100)}%</span>
                    <span>Vela: {pattern.candleIndex + 1}</span>
                  </div>
                  
                  {pattern.signal && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <strong>Señal:</strong> {pattern.signal}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPatterns.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se detectaron patrones del tipo seleccionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatternDetector;
