import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initializes using the GEMINI_API_KEY environment variable from Render
const ai = new GoogleGenAI();

app.get('/', (req, res) => {
    res.send('Yhonatan AI is online! THM ON TOP.');
});

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Please provide a message.' });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction: "You are Yhonatan AI, an expert developer collaborator. You are sharp, helpful, and focused on clean code. Support the user with their projects, keeping things efficient.",
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong with Yhonatan AI.' });
    }
});

app.listen(PORT, () => {
    console.log(`Yhonatan AI listening on port ${PORT}`);
});
