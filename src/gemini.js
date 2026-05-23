export async function askGemini(prompt, userContext, exerciseData) {
  const API_KEY = "AIzaSyAwxpDvt7S2U0WcB1g6eZKWd4KPHpXjB-o";
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `คุณคือ AI Personal Trainer ชื่อ "AT" ตอบเป็นภาษาไทย
                  ข้อมูลผู้ใช้: ${userContext}
                  รายการท่าฝึกในระบบ: ${exerciseData}
                  คำถามจากผู้ใช้: ${prompt}`
          }]
        }]
      })
    });
    const data = await response.json();
    if (data.error) return `Google Error: ${data.error.message}`;
    if (data.candidates && data.candidates[0].content) return data.candidates[0].content.parts[0].text;
    return "ขออภัยครับ สมองของผมขัดข้องนิดหน่อย ลองถามใหม่อีกครั้งนะ";
  } catch (error) {
    return "เชื่อมต่อไม่ได้ครับ ตรวจสอบอินเทอร์เน็ตหน่อยนะ";
  }
}