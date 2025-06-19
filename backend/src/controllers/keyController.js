export const verifyOpenRouterKey = async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ success: false, error: 'API Key is required.' });
    }

    try {
        console.log('Verifying OpenRouter key...');
        const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "http://localhost:3000", // Required for free tier
                "X-Title": "T3Chat" // Optional but helpful for OpenRouter
            },
        });

        const responseData = await response.json();
        console.log('OpenRouter verification response:', {
            status: response.status,
            ok: response.ok,
            data: responseData
        });

        if (response.ok) {
            res.status(200).json({ 
                success: true, 
                message: 'OpenRouter Key is valid.',
                data: responseData
            });
        } else {
            const errorMessage = responseData.error?.message || 'Invalid OpenRouter API Key.';
            console.error('OpenRouter key verification failed:', {
                status: response.status,
                error: errorMessage,
                details: responseData
            });
            res.status(response.status).json({ 
                success: false, 
                error: errorMessage,
                details: responseData
            });
        }
    } catch (error) {
        console.error('Error verifying OpenRouter key:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to contact OpenRouter for verification.',
            details: error.message
        });
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

export const verifyGoogleKey = async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) {
        return res.status(400).json({ success: false, error: 'API Key is required.' });
    }

    try {
        console.log('Verifying Google API key...');
        // A lightweight, authenticated call to list models is a good way to verify a key.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
            method: "GET",
        });

        const responseData = await response.json();

        if (response.ok && responseData.models) {
            res.status(200).json({ 
                success: true, 
                message: 'Google API Key is valid.',
            });
        } else {
            const errorMessage = responseData.error?.message || 'Invalid Google API Key.';
            console.error('Google key verification failed:', {
                status: response.status,
                error: errorMessage,
            });
            res.status(response.status).json({ 
                success: false, 
                error: errorMessage,
            });
        }
    } catch (error) {
        console.error('Error verifying Google API key:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to contact Google for verification.',
            details: error.message
        });
    }
};