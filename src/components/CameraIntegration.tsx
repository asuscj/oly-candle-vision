
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, Video, VideoOff, Play, Square, AlertCircle } from 'lucide-react';

interface CameraIntegrationProps {
  onPatternDetected?: (pattern: string) => void;
}

const CameraIntegration: React.FC<CameraIntegrationProps> = ({ onPatternDetected }) => {
  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>('');
  const [detectedPatterns, setDetectedPatterns] = useState<string[]>([]);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analysisInterval = useRef<number | null>(null);

  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (err) {
      console.log('No se pudo verificar permisos de cámara');
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        setCameraPermission('granted');
        
        // Iniciar análisis de patrones simulado
        startPatternAnalysis();
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
      setCameraPermission('denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (analysisInterval.current) {
      clearInterval(analysisInterval.current);
      analysisInterval.current = null;
    }
    
    setIsActive(false);
    setIsRecording(false);
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Aquí se podría procesar o guardar el video
          console.log('Datos de video disponibles:', event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error al iniciar grabación:', err);
      setError('No se pudo iniciar la grabación');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startPatternAnalysis = () => {
    // Simular análisis de patrones en tiempo real
    analysisInterval.current = window.setInterval(() => {
      const patterns = ['Triángulo', 'Cabeza y Hombros', 'Bandera', 'Cuña', 'Canal'];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      
      if (Math.random() > 0.7) { // 30% de probabilidad
        setDetectedPatterns(prev => {
          const newPatterns = [...prev, `${randomPattern} - ${new Date().toLocaleTimeString()}`];
          return newPatterns.slice(-5); // Mantener solo los últimos 5
        });
        
        if (onPatternDetected) {
          onPatternDetected(randomPattern);
        }
      }
    }, 3000);
  };

  const getStatusColor = () => {
    if (isRecording) return 'bg-red-500';
    if (isActive) return 'bg-green-500';
    return 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-500" />
            Análisis Visual en Tiempo Real
            <div className="ml-auto flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isRecording ? 'Grabando' : isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Video Feed */}
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {!isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="text-center text-white">
                      <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-semibold mb-2">Cámara Desactivada</p>
                      <p className="text-sm text-gray-300">Haz clic en "Iniciar Cámara" para comenzar</p>
                    </div>
                  </div>
                )}
                
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">REC</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isActive ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Iniciar Cámara
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="destructive" className="flex-1">
                    <CameraOff className="w-4 h-4 mr-2" />
                    Detener Cámara
                  </Button>
                )}
                
                {isActive && (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    variant={isRecording ? "destructive" : "default"}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        Parar
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 mr-2" />
                        Grabar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Pattern Detection */}
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Patrones Detectados
                </h4>
                
                {detectedPatterns.length > 0 ? (
                  <div className="space-y-2">
                    {detectedPatterns.map((pattern, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-green-50 rounded border-l-4 border-l-green-500"
                      >
                        <span className="text-sm font-medium text-green-800">
                          {pattern}
                        </span>
                        <Badge variant="default" className="text-xs">
                          Nuevo
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {isActive ? 'Analizando imagen...' : 'Inicia la cámara para detectar patrones'}
                  </p>
                )}
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">Estado del Sistema</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Permisos de Cámara:</span>
                    <Badge variant={cameraPermission === 'granted' ? 'default' : 'destructive'}>
                      {cameraPermission === 'granted' ? 'Concedido' : 
                       cameraPermission === 'denied' ? 'Denegado' : 'Pendiente'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Análisis en Tiempo Real:</span>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Patrones Detectados:</span>
                    <Badge variant="outline">
                      {detectedPatterns.length}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CameraIntegration;
