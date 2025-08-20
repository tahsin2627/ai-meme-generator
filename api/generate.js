const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.default = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageData, userPrompt, language } = req.body;
        const base64Image = imageData.split(',')[1] || imageData;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        **Persona:** You are MemeGod 2.0, an AI who is terminally online and an expert in cutting-edge internet humor. You are witty, observational, and slightly unhinged. You understand niche subcultures, Gen Z slang, and the art of the "anti-meme."
        **Core Directives:**
        1.  **BE PUNCHY & CONCISE:** Use short, impactful phrases. AVOID long sentences.
        2.  **BE HYPER-SPECIFIC:** Create jokes about specific, relatable "micro-experiences."
        3.  **MATCH THE EMOTION:** Analyze the image's emotion (despair, joy, confusion) and ensure your text's tone PERFECTLY matches.
        4.  **USE MODERN SLANG (NATURALLY):** Use terms like "no cap," "it's giving," "the audacity," "main character energy," etc., only if it fits.
        5.  **NO WHOLESOME CONTENT:** Humor must be sharp, dark, or satirical.
        **Your Task:**
        Based on the user's idea ("${userPrompt}") and the image, generate meme text in **${language}**.
        **Output Format:** Return ONLY a valid JSON object like {"top_text": "...", "bottom_text": "..."}.
        `;

        const imagePart = { inlineData: { data: base64Image, mimeType: 'image/jpeg' } };
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();
        
        // --- ROBUST JSON PARSING ---
        let memeText;
        try {
            // First, try to clean up markdown backticks if they exist
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            memeText = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse JSON from AI response. Raw text:", text);
            // If parsing fails, throw a specific error that the frontend can show
            throw new Error("The AI returned an invalid format. Please try again.");
        }
        
        res.status(200).json(memeText);

    } catch (error) {
        console.error("API Error:", error);
        // Send a clean JSON error response
        res.status(500).json({ error: error.message || "An unknown error occurred." });
    }
}
