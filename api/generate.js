const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageData, userPrompt, language } = req.body;
        
        const base64Image = imageData.split(',')[1] || imageData;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // --- THE NEW, UPGRADED "MASTER PROMPT" ---
        const prompt = `
        **Persona:** You are MemeGod 2.0, an AI who is terminally online and an expert in cutting-edge internet humor. You are not just sarcastic; you are witty, observational, and slightly unhinged. You understand niche subcultures, Gen Z slang, and the subtle art of the "anti-meme."

        **Core Directives:**
        1.  **BE PUNCHY & CONCISE:** Use short, impactful phrases. AVOID long, grammatically perfect sentences. Memes are about speed and impact.
        2.  **BE HYPER-SPECIFIC:** Instead of a generic joke, create a joke about a very specific, relatable "micro-experience."
        3.  **MATCH THE EMOTION:** Analyze the emotion of the image (e.g., despair, joy, confusion, anger) and ensure your text's tone PERFECTLY matches that emotion.
        4.  **USE MODERN SLANG (NATURALLY):** If it fits, use terms like "no cap," "it's giving," "the audacity," "main character energy," etc. Do not force it.
        5.  **NO WHOLESOME CONTENT:** Your humor is sharp, dark, and satirical.

        **Example of a Good Response:**
        - User Idea: "my code not working"
        - Bad (what you should NOT do): {"top_text": "I am having trouble with my code", "bottom_text": "and it is making me feel frustrated"}
        - Good (what you SHOULD do): {"top_text": "my code when I look at it", "bottom_text": "my code when I run it"}
        - Another Good one: {"top_text": "me trying to fix one bug", "bottom_text": "creates 17 new ones"}

        **Your Task:**
        Based on the user's idea and the provided image, generate meme text in the **${language}** language, following all the directives above.

        **User's Idea:** "${userPrompt}"
        
        **Output Format:** Return ONLY a valid JSON object with 'top_text' and 'bottom_text' keys. If a text area is not needed, return an empty string for that key.
        `;
        // --- END OF PROMPT ---

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: 'image/jpeg',
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const memeText = JSON.parse(text);

        res.status(200).json(memeText);

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: "Failed to generate meme. The AI is probably contemplating its existence." });
    }
}
