import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { QrCode, Loader2, Download, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export default function QRCode3D() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [depth, setDepth] = useState([3]);
  const [size, setSize] = useState([100]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Generate QR Code
  const generateQR = async () => {
    if (!url) {
      toast.error("Digite uma URL ou texto para gerar o QR Code");
      return;
    }

    setGenerating(true);
    
    try {
      // Use QR Code API to generate
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size[0]}x${size[0]}&data=${encodeURIComponent(url)}`;
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = qrApiUrl;
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        canvas.width = size[0];
        canvas.height = size[0];
        
        ctx.drawImage(img, 0, 0, size[0], size[0]);
        setQrGenerated(true);
        setGenerating(false);
        toast.success("QR Code gerado com sucesso!");
      };
      
      img.onerror = () => {
        setGenerating(false);
        toast.error("Erro ao gerar QR Code");
      };
    } catch (error) {
      setGenerating(false);
      toast.error("Erro ao gerar QR Code");
    }
  };

  // Download QR Code
  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement("a");
    link.download = "qrcode-3d.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR Code baixado!");
  };

  // Reset
  const reset = () => {
    setUrl("");
    setQrGenerated(false);
    setRotation({ x: 0, y: 0 });
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // 3D rotation effect
  useEffect(() => {
    if (!qrGenerated) return;
    
    const interval = setInterval(() => {
      setRotation(prev => ({
        x: prev.x,
        y: (prev.y + 1) % 360
      }));
    }, 50);
    
    return () => clearInterval(interval);
  }, [qrGenerated]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center py-16">
            <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Faça login para usar esta ferramenta</h3>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para gerar QR Codes 3D.
            </p>
            <Button asChild className="glow-primary">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">QR Code 3D</h1>
            <p className="text-muted-foreground">
              Crie QR codes em modelos 3D únicos para impressão
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>
                  Configure seu QR Code 3D
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url">URL ou Texto</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://exemplo.com ou texto"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tamanho: {size[0]}px</Label>
                  <Slider
                    value={size}
                    onValueChange={setSize}
                    min={100}
                    max={500}
                    step={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profundidade 3D: {depth[0]}mm</Label>
                  <Slider
                    value={depth}
                    onValueChange={setDepth}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1 glow-primary"
                    onClick={generateQR}
                    disabled={generating || !url}
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <QrCode className="h-4 w-4 mr-2" />
                    )}
                    Gerar QR Code
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Visualização 3D</CardTitle>
                <CardDescription>
                  Preview do seu QR Code com efeito 3D
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden"
                  style={{ perspective: "1000px" }}
                >
                  {qrGenerated ? (
                    <div
                      style={{
                        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transformStyle: "preserve-3d",
                        transition: "transform 0.05s linear",
                      }}
                    >
                      <canvas
                        ref={canvasRef}
                        className="max-w-full h-auto"
                        style={{
                          boxShadow: `0 ${depth[0] * 2}px ${depth[0] * 4}px rgba(0,0,0,0.3)`,
                          borderRadius: "8px",
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Seu QR Code 3D aparecerá aqui</p>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {qrGenerated && (
                  <div className="mt-4 flex gap-4">
                    <Button className="flex-1" onClick={downloadQR}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PNG
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Baixar STL (Em breve)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Como funciona?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">1. Digite sua URL</p>
                  <p>Insira o link ou texto que deseja codificar no QR Code.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">2. Configure</p>
                  <p>Ajuste o tamanho e a profundidade 3D do modelo.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">3. Baixe e imprima</p>
                  <p>Baixe o arquivo e imprima em sua impressora 3D.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
