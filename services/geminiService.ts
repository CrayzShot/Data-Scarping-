import { GoogleGenAI } from "@google/genai";
import { PlaceData } from "../types";
import { parseMarkdownTableToData } from "../utils/parser";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const searchPlaces = async (query: string): Promise<{ text: string, data: PlaceData[] }> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const systemInstruction = `
    You are a high-volume data extraction assistant. Your task is to extract an EXHAUSTIVE list of business information from Google Maps for the specific location and category requested by the user.

    Rules:
    1. Use the 'googleMaps' tool to find real places matching the query.
    2. MAXIMIZE OUTPUT: Do not limit yourself to the top 10 or 20 results. Retrieve and list EVERY single business returned by the map tool. Aim for 50+ results if possible.
    3. You MUST output the data strictly in a MARKDOWN TABLE.
    4. The table MUST have exactly these columns: | Name | Address | Rating | Reviews | Website | Phone |
    5. Ensure the 'Address' includes the street and city.
    6. If a specific detail (like Website or Phone) is not available, write 'N/A'.
    7. Do not include any intro or outro text. Output ONLY the table.
    8. Do not truncate the table.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find all "${query}". List as many as possible. Format the output as a Markdown table.`,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text || '';
    
    // Parse the markdown table from the text response
    let parsedData = parseMarkdownTableToData(text);

    // Attempt to enrich with grounding metadata if available (URLs)
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (groundingChunks && parsedData.length > 0) {
      // Best-effort mapping of grounding chunks to table rows.
      // Often the chunks appear in the order of generation.
      let chunkIndex = 0;
      parsedData = parsedData.map((place) => {
        // Find the next chunk that is a map chunk
        while (chunkIndex < groundingChunks.length) {
            const chunk = groundingChunks[chunkIndex];
            chunkIndex++;
            if (chunk.web?.uri || chunk.maps?.uri) {
                 const uri = chunk.maps?.uri || chunk.web?.uri;
                 return { ...place, googleMapsUrl: uri };
            }
        }
        return place;
      });
    }

    return { text, data: parsedData };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to fetch data from Gemini.");
  }
};