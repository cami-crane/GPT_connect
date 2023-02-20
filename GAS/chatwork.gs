// Chatwork API Token
const TOKEN = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // ②で発行したチャットワークAPIトークン
// OpenAI API Key
const SECRET_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // ①で発行したOpenAI API Key
// OpenAI API Max Token
const MAX_TOKENS = 4000;//※このあたりの設定値は適宜調整ください
// OpenAI API Mode Name
const MODEL_NAME = "text-davinci-003"; // 使用するモデル
// OpenAI API temperature
const MODEL_TEMP = 0.5;//※このあたりの設定値は適宜調整ください

/**
 * Receive Data From Chatwork WebHook
 */
function doPost(e) {

  let json = JSON.parse(e.postData.contents);
  let from_account_id = json.webhook_event.from_account_id;
  let message_id = json.webhook_event.message_id;
  let room_id = json.webhook_event.room_id;
  let body = json.webhook_event.body;

  let message = '';
  message += '[rp aid=' + from_account_id;
  message += ' to=' + room_id + '-' + message_id + '] ';
  message += "\n" + askGPT(body);
  
  // reply message
  let client = ChatWorkClient.factory({token: TOKEN});
  client.sendMessage({
    room_id: room_id,
    body: message
  });
}

/**
 * Generate Answer Using GPT
 * @param prompt string
 * @return string
 */
function askGPT(prompt) {
  const url = "https://api.openai.com/v1/completions";
  const payload = {
    model: MODEL_NAME,
    prompt: prompt,
    temperature: MODEL_TEMP,
    max_tokens: MAX_TOKENS
  };

  const options = {
    contentType: "application/json",
    headers: { Authorization: "Bearer " + SECRET_KEY },
    payload: JSON.stringify(payload),
  };

  try {
    const res = JSON.parse(UrlFetchApp.fetch(url, options).getContentText());
    return res.choices[0].text.trim();
  } catch (e) {
    return "分かりません。\n質問を簡単な単語に変えたりしてください。";
  }
}