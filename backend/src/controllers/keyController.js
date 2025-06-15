export const verifyOpenRouterKey = async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ success: false, error: 'API Key is required.' });
    }
    try {
        const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
            method: "GET",
            headers: { "Authorization": `Bearer ${apiKey}` },
        });
        if (response.ok) {
            res.status(200).json({ success: true, message: 'OpenRouter Key is valid.' });
        } else {
            const errorData = await response.json();
            res.status(response.status).json({ success: false, error: errorData.error?.message || 'Invalid OpenRouter API Key.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to contact OpenRouter for verification.' });
    }
};


export const verifyTavilyKey = async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ success: false, error: 'API Key is required.' });
    }
    try {
    
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: apiKey,
                query: "Test query",
                max_results: 1
            })
        });

        if (response.ok) {
            res.status(200).json({ success: true, message: 'Tavily Key is valid.' });
        } else {
            const errorData = await response.json();
            res.status(response.status).json({ success: false, error: errorData.error || 'Invalid Tavily API Key.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to contact Tavily for verification.' });
    }
};