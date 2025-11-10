
import { GoogleGenAI, Type } from "@google/genai";
import { Wine } from "../types";

const wineSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The full name of the wine, including the producer." },
    price: { type: Type.NUMBER, description: "The approximate retail price in USD." },
    description: { type: Type.STRING, description: "A brief, enticing description of the wine's taste and aroma profile." },
    country: { type: Type.STRING, description: "The country of origin." },
    winefarm_coordinates: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER, description: "The latitude of the winery or primary vineyard." },
        lng: { type: Type.NUMBER, description: "The longitude of the winery or primary vineyard." }
      },
      required: ['lat', 'lng']
    },
    grape: { type: Type.STRING, description: "The primary grape varietal (e.g., 'Pinot Noir', 'Chardonnay')." },
    year: { type: Type.NUMBER, description: "The vintage year of the wine." }
  },
  required: ['name', 'price', 'description', 'country', 'winefarm_coordinates', 'grape', 'year']
};

export const generateWineList = async (prompt: string): Promise<Wine[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const fullPrompt = `Generate a list of wines based on the following request: "${prompt}". For each wine, provide all the required information including accurate geographic coordinates for the winery.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: wineSchema,
        },
      },
    });

    const jsonText = response.text.trim();
    const wines = JSON.parse(jsonText) as Wine[];
    return wines;
  } catch (error) {
    console.error("Error generating wine list with Gemini:", error);
    throw new Error("Failed to generate wine list. The model may be unable to fulfill this specific request.");
  }
};
