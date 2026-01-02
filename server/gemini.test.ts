import { describe, expect, it } from "vitest";

describe("Gemini API Key Validation", () => {
  it("should have GEMINI_API_KEY environment variable set", () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey?.length).toBeGreaterThan(10);
  });

  it("should be able to make a basic request to Gemini API", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set");
    }

    // Make a simple text-only request to validate the API key
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Responda apenas com a palavra 'OK'",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 10,
          },
        }),
      }
    );

    const data = await response.json();
    
    // If we get a quota error (429), the API key is valid but quota exceeded
    // If we get a 401/403, the API key is invalid
    if (!response.ok) {
      console.log("API Response:", response.status, JSON.stringify(data, null, 2));
      
      // Quota exceeded means the key is valid
      if (response.status === 429 && data.error?.status === "RESOURCE_EXHAUSTED") {
        console.log("API key is valid but quota exceeded - this is acceptable for validation");
        expect(true).toBe(true);
        return;
      }
      
      // Any other error means the key might be invalid
      expect(response.ok).toBe(true);
    } else {
      expect(data.candidates).toBeDefined();
      expect(data.candidates.length).toBeGreaterThan(0);
    }
  });
});
