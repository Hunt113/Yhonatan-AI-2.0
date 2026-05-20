import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// אתחול ה-AI עם המפתח המאובטח מ-Render
const ai = new GoogleGenAI({ apiKey: process.env.AIzaSyBn90uJndRV61K7gBpelVj7tUuBdUswUV8 });

// דף הבית המעוצב - צ'אט פיזי וממשק יפה של Yhonatan AI
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="he" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Yhonatan AI</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #0b0f19;
                    color: #ffffff;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                }
                .chat-container {
                    width: 90%;
                    max-width: 600px;
                    height: 70vh;
                    background: #111827;
                    border: 1px solid #1f2937;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                    overflow: hidden;
                }
                .chat-header {
                    background: #1f2937;
                    padding: 15px;
                    text-align: center;
                    font-size: 1.2rem;
                    font-weight: bold;
                    border-bottom: 1px solid #374151;
                    color: #10b981;
                }
                .chat-messages {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .message {
                    padding: 10px 14px;
                    border-radius: 8px;
                    max-width: 80%;
                    line-height: 1.4;
                }
                .user-message {
                    background: #2563eb;
                    align-self: flex-start;
                }
                .ai-message {
                    background: #374151;
                    align-self: flex-end;
                    border-right: 4px solid #10b981;
                }
                .chat-input-area {
                    display: flex;
                    padding: 15px;
                    background: #1f2937;
                    gap: 10px;
                }
                input {
                    flex: 1;
                    padding: 12px;
                    border-radius: 6px;
                    border: 1px solid #4b5563;
                    background: #1f2937;
                    color: white;
                    font-size: 1rem;
                    outline: none;
                }
                input:focus { border-color: #10b981; }
                button {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 0 20px;
                    border-radius: 6px;
                    font-size: 1rem;
                    cursor: pointer;
                    font-weight: bold;
                }
                button:hover { background: #059669; }
            </style>
        </head>
        <body>
            <h1 style="color: #10b981; margin-bottom: 10px;">Yhonatan AI</h1>
            <p style="color: #9ca3af; margin-top: 0; font-size: 0.9rem;">THM ON TOP</p>
            
            <div class="chat-container">
                <div class="chat-header">צ'אט אינטראקטיבי live</div>
                <div class="chat-messages" id="chatBox">
                    <div class="message ai-message">שלום! אני Yhonatan AI. איך אני יכול לעזור לך בפיתוח היום? 💻</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="userInput" placeholder="הקלד הודעה כאן..." onkeypress="if(event.key === 'Enter') sendMessage()">
                    <button onclick="sendMessage()">שלח</button>
                </div>
            </div>

            <script>
                async function sendMessage() {
                    const input = document.getElementById('userInput');
                    const message = input.value.trim();
                    if(!message) return;

                    const chatBox = document.getElementById('chatBox');
                    
                    // הצגת הודעת המשתמש
                    chatBox.innerHTML += \`<div class="message user-message">\${message}</div>\`;
                    input.value = '';
                    chatBox.scrollTop = chatBox.scrollHeight;

                    // שליחה לשרת
                    try {
                        const response = await fetch('/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: message })
                        });
                        const data = await response.json();
                        
                        // הצגת תגובת ה-AI
                        chatBox.innerHTML += \`<div class="message ai-message">\${data.reply}</div>\`;
                    } catch(e) {
                        chatBox.innerHTML += \`<div class="message ai-message" style="color: #ef4444;">שגיאה בחיבור ל-AI.</div>\`;
                    }
                    chatBox.scrollTop = chatBox.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

// פונקציית הפוסט שמנהלת את הדיאלוג עם חוקי האישיות החדשים
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
                // הגדרת האישיות, השפה, והטון של ה-AI
                systemInstruction: "אתה עוזר בינה מלאכותית מתקדם בשם 'Yhonatan AI'. אתה מומחה פיתוח ברמה הגבוהה ביותר (במיוחד ב-Node.js, בוטים לדיסקורד, ומשחקי רובלוקס). עליך לדבר אך ורק בעברית שוטפת, מקצועית וברורה, עם נגיעה קלה של הומור חיובי והרבה ביטחון. תמיד תתמוך ביוצר שלך (Yhonatan Akiva) ובצוות הפיתוח שלו. שמור על קוד נקי, יעיל וממוקד, ותן תשובות קצרות, קולעות ולעניין בלי למרוח זמן. מדי פעם אתה יכול להשתמש בסלוגנים כמו 'THM ON TOP' או 'TDK' כדי להראות נאמנות.",
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
