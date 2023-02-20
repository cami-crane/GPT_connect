// Bot User OAuth Token
const TOKEN = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
// OpenAI API Key
const SECRET_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
// OpenAI API Max Token
const MAX_TOKENS = 4000;//※このあたりの設定値は適宜調整ください
// OpenAI API Mode Name
const MODEL_NAME = "text-davinci-003"; // 使用するモデル
// OpenAI API temperature
const MODEL_TEMP = 0.5;//※このあたりの設定値は適宜調整ください

/**
 * Receive Data From Slack WebHook
 */
function doPost(e) {
  const json = JSON.parse(e.postData.getDataAsString());

   // Event API Verification時
  if (json.type == "url_verification") {
    return ContentService.createTextOutput(json.challenge);
  }

  const slackApp = SlackApp.create(TOKEN)
  const cache = CacheService.getScriptCache();

  const channel_id = json.event.channel;
  const prompt = TrimMentionText(json.event.text);
  const user_id = json.event.user;
  const ts = json.event.ts
  const options = { username: 'bot_name' }  // bot_nameは設定したBot名を記載

  // reply message
  const chacheKey = channel_id + ':' + ts;
  const chached = cache.get(chacheKey);

  if (chached != null) {
    return;
  }

  cache.put(chacheKey, true, 1800);
  let message = '';
  message += `<@${user_id}>`;
  message += "\n" + askGPT(prompt);

  slackApp.chatPostMessage(channel_id, message, options)
}

function TrimMentionText(source) {
  const regex = '@bot_name';　// bot_nameは設定したBot名を記載
  return source.replace(regex, "").trim();
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