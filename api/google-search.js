// This is our new backend function to search Google Images

exports.default = async function handler(req, res) {
    // Get the search term from the query string (e.g., /api/google-search?q=trollface)
    const searchTerm = req.query.q;

    if (!searchTerm) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    const API_KEY = process.env.GOOGLE_API_KEY;
    const CX = process.env.GOOGLE_CX;
    
    // Construct the search query to find clean templates
    const query = `${searchTerm} meme template blank`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&q=${encodeURIComponent(query)}&searchType=image&num=10`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Google API Error Response:", errorData);
            throw new Error(`Google API error: ${errorData.error.message}`);
        }
        
        const data = await response.json();
        
        // Transform the Google API response into the format our app uses
        const templates = data.items.map(item => ({
            name: item.title,
            url: item.link
        }));

        res.status(200).json(templates);

    } catch (error) {
        console.error("Server-side search error:", error);
        res.status(500).json({ error: error.message || 'Failed to search for templates.' });
    }
}
