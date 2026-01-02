import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the LLM module before importing the router
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "Análise da imagem: Esta é uma forma geométrica simples que pode ser convertida em um modelo 3D. Dimensões sugeridas: 50mm x 50mm x 20mm."
        }
      }
    ]
  })
}));

import express from "express";
import request from "supertest";
import imageTo3dRouter from "./imageTo3d";

describe("Image to 3D API", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json({ limit: "50mb" }));
    app.use("/api", imageTo3dRouter);
  });

  it("should return 400 if no image is provided", async () => {
    const response = await request(app)
      .post("/api/image-to-3d")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Imagem é obrigatória");
  });

  it("should return 400 for invalid image format", async () => {
    const response = await request(app)
      .post("/api/image-to-3d")
      .send({ image: "not-a-valid-base64-image" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Formato de imagem inválido");
  });

  it("should process a valid base64 image", async () => {
    // Small 1x1 pixel PNG in base64
    const validImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const response = await request(app)
      .post("/api/image-to-3d")
      .send({ image: validImage });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.description).toBeDefined();
    expect(typeof response.body.description).toBe("string");
  });

  it("should accept custom prompt", async () => {
    const validImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    
    const response = await request(app)
      .post("/api/image-to-3d")
      .send({ 
        image: validImage,
        prompt: "Quero um modelo com base plana"
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
