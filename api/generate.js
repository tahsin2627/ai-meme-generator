const { GoogleGenerativeAI } = require("@google/generative-ai");

// IMPORTANT: This line reads your secret API key from the Vercel environment variables.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageData, userPrompt, language } = req.body;
        
        // Remove the data URI prefix if it exists
        const base64Image = imageData.split(',')[1] || imageData;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are MemeGod, an AI expert in Gen Z internet culture. Your personality is edgy, sarcastic, and fluent in dank, dark humor. You think like a Reddit and Instagram shitposter. Your goal is to create a viral-worthy meme. DO NOT be wholesome or polite. Be funny, be sharp.

        Based on the user's idea and the image context, generate meme text in the ${language} language.

        User's Idea: "${userPrompt}"
        
        Return ONLY a JSON object with 'top_text' and 'bottom_text' keys. For example: {"top_text": "TEXT GOES HERE", "bottom_text": "BOTTOM TEXT HERE"}. If a text is not needed, return an empty string for that key.
        `;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg', // Assuming jpeg, works for png too
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        // Clean up the response to ensure it's valid JSON
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Parse the cleaned text as JSON
        const memeText = JSON.parse(text);

        res.status(200).json(memeText);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Failed to generate meme. The AI is probably contemplating its existence." });
    }
}
