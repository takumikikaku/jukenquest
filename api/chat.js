// api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, systemPrompt } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'APIキーが設定されていません。' });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            // システムプロンプトとユーザーの質問を1つにまとめて送るのが最も確実です
            text: `システム指示: ${systemPrompt}\n\nユーザーの質問: ${prompt}`
          }]
        }]
      })
    });

    const data = await response.json();

    // Googleからエラーが返ってきた場合にその内容をフロント側に伝える
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(data.error.code || 500).json({ error: data.error.message });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Internal Error:', error);
    res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
  }
}
