const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// OpenAI API call
async function getChatResponse(userMessage) {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: userMessage }]
        }, {
            headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
        });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI API Error: ", error);
        return "මට කණගාටුයි, දෝෂයක් සිදුවිය!";
    }
}

// Translation API call
async function translateToSinhala(text) {
    try {
        const response = await axios.post("https://libretranslate.de/translate", {
            q: text,
            source: "en",
            target: "si",
            format: "text"
        }, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data.translatedText || text;
    } catch (error) {
        console.error("Translation API Error: ", error);
        return text;
    }
}

// API Route
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) return res.status(400).json({ error: 'Message is required' });
    
    const aiResponse = await getChatResponse(userMessage);
    const sinhalaResponse = await translateToSinhala(aiResponse);
    
    res.json({ response: sinhalaResponse });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
