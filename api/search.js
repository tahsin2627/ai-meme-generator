// This backend function securely fetches all meme templates from Imgflip.

exports.default = async function handler(req, res) {
    try {
        const response = await fetch('https://api.imgflip.com/get_memes');
        if (!response.ok) {
            throw new Error(`Imgflip API responded with status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success) {
            // Send the clean list of memes back to the frontend
            res.status(200).json(data.data.memes);
        } else {
            throw new Error(data.error_message || 'Failed to fetch from Imgflip');
        }
    } catch (error) {
        console.error("Imgflip API error:", error);
        res.status(500).json({ error: 'Could not fetch templates.' });
    }
}
