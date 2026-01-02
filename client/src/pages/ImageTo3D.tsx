import Layout from "@/components/Layout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Image, Loader2, Upload, RotateCcw, Sparkles, Download, Eye } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function ImageTo3D() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    description: string;
    modelData: string;
    previewUrl: string;
  } | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setResult(null);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Process image with Gemini
  const processImage = async () => {
    if (!imageFile || !imagePreview) {
      toast.error("Selecione uma imagem primeiro");
      return;
    }

    setProcessing(true);

    try {
      // Call backend API to process with Gemini
      const response = await fetch("/api/image-to-3d", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: imagePreview,
          prompt: customPrompt || "Analise esta imagem e descreva como ela poderia ser convertida em um modelo 3D para impressão. Inclua detalhes sobre formas, dimensões sugeridas e estrutura.",
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar imagem");
      }
      
      setResult({
        description: data.description,
        modelData: data.modelData || "",
        previewUrl: imagePreview,
      });

      toast.success("Imagem analisada com sucesso!");
    } catch (error: any) {
      console.error("Error processing image:", error);
      toast.error(error.message || "Erro ao processar imagem. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  // Reset
  const reset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setCustomPrompt("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
            <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Faça login para usar esta ferramenta</h3>
            <p className="text-muted-foreground mb-6">
              Você precisa estar logado para converter imagens em 3D.
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Imagem para 3D</h1>
            <p className="text-muted-foreground">
              Transforme suas imagens 2D em modelos 3D usando inteligência artificial
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload de Imagem</CardTitle>
                <CardDescription>
                  Arraste uma imagem ou clique para selecionar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    imagePreview 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                  
                  {imagePreview ? (
                    <div className="space-y-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        {imageFile?.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium">Arraste sua imagem aqui</p>
                        <p className="text-sm text-muted-foreground">
                          ou clique para selecionar (máx. 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Instruções adicionais (opcional)</Label>
                  <Textarea
                    id="prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ex: Quero que o modelo tenha base plana para impressão..."
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    className="flex-1 glow-primary"
                    onClick={processImage}
                    disabled={processing || !imageFile}
                  >
                    {processing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Converter para 3D
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Result Section */}
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Análise</CardTitle>
                <CardDescription>
                  Visualização e descrição do modelo 3D
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    {/* 3D Preview Placeholder */}
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
                      <div className="text-center relative z-10">
                        <Eye className="h-12 w-12 mx-auto text-primary mb-4" />
                        <p className="font-medium">Visualização 3D</p>
                        <p className="text-sm text-muted-foreground">
                          Modelo gerado com base na análise
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Análise da IA</Label>
                      <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                        {result.description}
                      </div>
                    </div>

                    {/* Download Options */}
                    <div className="flex gap-4">
                      <Button className="flex-1" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar STL (Em breve)
                      </Button>
                      <Button className="flex-1" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar OBJ (Em breve)
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>O resultado da conversão aparecerá aqui</p>
                      <p className="text-sm mt-2">
                        Faça upload de uma imagem para começar
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Como funciona?</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">1. Upload</p>
                  <p>Envie uma imagem 2D do objeto que deseja converter.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">2. Análise IA</p>
                  <p>Nossa IA analisa a imagem e identifica formas e estruturas.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">3. Geração 3D</p>
                  <p>O modelo 3D é gerado com base na análise.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">4. Download</p>
                  <p>Baixe o arquivo STL/OBJ para impressão 3D.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="mt-4">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Dicas para melhores resultados</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use imagens com boa iluminação e fundo limpo</li>
                <li>• Objetos com formas bem definidas funcionam melhor</li>
                <li>• Evite imagens muito complexas ou com muitos detalhes pequenos</li>
                <li>• Plantas 2D, logos e desenhos técnicos são ideais</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
