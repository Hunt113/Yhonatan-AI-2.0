import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// אתחול ה-AI עם המפתח המאובטח מ-Render
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// דף הבית המעוצב - ממשק Full Screen מלא בעברית
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="he" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Yhonatan AI</title>
            <style>
                * {
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #0b0f19;
                    color: #ffffff;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    width: 100vw;
                    overflow: hidden;
                }
                .chat-header {
                    background: #111827;
                    padding: 15px 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #1f2937;
                    height: 70px;
                }
                .brand-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #10b981;
                    margin: 0;
                }
                .new-chat-btn {
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-size: 0.95rem;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.2s;
                }
                .new-chat-btn:hover {
                    background: #dc2626;
                }
                .chat-messages {
                    flex: 1;
                    padding: 30px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background-color: #0b0f19;
                    width: 100%;
                }
                .message {
                    padding: 14px 20px;
                    border-radius: 8px;
                    max-width: 75%;
                    line-height: 1.5;
                    font-size: 1.05rem;
                    word-wrap: break-word;
                }
                .user-message {
                    background: #2563eb;
                    align-self: flex-start;
                    border-top-right-radius: 0;
                }
                .ai-message {
                    background: #1f2937;
                    align-self: flex-end;
                    border-right: 4px solid #10b981;
                    border-top-left-radius: 0;
                }
                .chat-input-area {
                    display: flex;
                    padding: 20px 30px;
                    background: #111827;
                    gap: 15px;
                    border-top: 1px solid #1f2937;
                    height: 90px;
                    align-items: center;
                }
                input {
                    flex: 1;
                    padding: 14px;
                    border-radius: 8px;
                    border: 1px solid #374151;
                    background: #1f2937;
                    color: white;
                    font-size: 1.05rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                input:focus { 
                    border-color: #10b981; 
                }
                .send-btn {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 0 30px;
                    height: 50px;
                    border-radius: 8px;
                    font-size: 1.05rem;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.2s;
                }
                .send-btn:hover { 
                    background: #059669; 
                }
            </style>
        </head>
        <body>
            
            <div class="chat-header">
                <div class="brand-title">Yhonatan AI</div>
                <button class="new-chat-btn" onclick="startNewChat()">צ'אט חדש 🔄</button>
            </div>

            <div class="chat-messages" id="chatBox">
                <div class="message ai-message">שלום! אני Yhonatan AI. איך אני יכול לעזור לך בפיתוח היום? 💻</div>
            </div>

            <div class="chat-input-area">
                <input type="text" id="userInput" placeholder="שאל אותי משהו..." onkeypress="if(event.key === 'Enter') sendMessage()">
                <button class="send-btn" onclick="sendMessage()">שלח</button>
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

                function startNewChat() {
                    const chatBox = document.getElementById('chatBox');
                    // איפוס חלון הצ'אט להודעת הפתיחה המקורית
                    chatBox.innerHTML = \`<div class="message ai-message">התחלת צ'אט חדש! אני Yhonatan AI, מוכן לפקודתך. 💻</div>\`;
                    document.getElementById('userInput').value = '';
                }
            </script>
        </body>
        </html>
    `);
});

// פונקציית הפוסט שמנהלת את הדיאלוג
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
                systemInstruction: "אתה עוזר בינה מלאכותית מתקדם בשם 'Yhonatan AI'. אתה מומחה פיתוח ברמה הגבוהה ביותר (במיוחד ב-Node.js, בוטים לדיסקורד, ומשחקי רובלוקס). עליך לדבר אך ורק בעברית שוטפת, מקצועית וברורה, עם ביטחון רב. תמיד תתמוך ביוצר שלך (Yhonatan Akiva) ובצוות הפיתוח שלו. שמור על קוד נקי, יעיל וממוקד, ותן תשובות קצרות, קולעות ולעניין בלי למרוח זמן. מדי פעם אתה יכול להשתמש בסלוגן 'TDK' כדי להראות נאמנות.",
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
