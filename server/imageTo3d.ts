import { Router, Request, Response } from "express";
import { invokeLLM } from "./_core/llm";

const router = Router();

// Gemini API endpoint for image to 3D conversion
router.post("/image-to-3d", async (req: Request, res: Response) => {
  try {
    const { image, prompt } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Imagem é obrigatória" });
    }

    // Extract base64 data from data URL
    const base64Match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!base64Match) {
      return res.status(400).json({ error: "Formato de imagem inválido" });
    }
    
    const mimeType = base64Match[1];
    const base64Data = base64Match[2];

    // Create the prompt for 3D analysis
    const analysisPrompt = prompt || `Analise esta imagem e descreva detalhadamente como ela poderia ser convertida em um modelo 3D para impressão. 
    
Por favor, forneça:
1. Descrição das formas principais identificadas
2. Dimensões sugeridas para o modelo 3D (em mm)
3. Estrutura e camadas recomendadas
4. Sugestões de material e configurações de impressão
5. Possíveis desafios na conversão e soluções

Seja específico e técnico, como se estivesse orientando um modelador 3D profissional.`;

    // Use the built-in LLM helper which handles authentication automatically
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em modelagem 3D e impressão 3D. Analise imagens e forneça orientações técnicas detalhadas para converter a imagem em um modelo 3D imprimível. Responda sempre em português brasileiro."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: analysisPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: "high"
              }
            }
          ]
        }
      ]
    });

    const description = response.choices?.[0]?.message?.content || "Não foi possível analisar a imagem. Tente novamente.";

    return res.json({
      success: true,
      description,
      modelData: null, // Future: actual 3D model data
    });
  } catch (error: any) {
    console.error("Error processing image:", error);
    
    // Provide more specific error messages
    let errorMessage = "Erro ao processar imagem. Tente novamente.";
    
    if (error.message?.includes("quota") || error.message?.includes("rate limit")) {
      errorMessage = "Limite de requisições atingido. Aguarde alguns segundos e tente novamente.";
    } else if (error.message?.includes("invalid") || error.message?.includes("Invalid")) {
      errorMessage = "Imagem inválida. Verifique o formato e tente novamente.";
    }
    
    return res.status(500).json({ error: errorMessage });
  }
});

export default router;
