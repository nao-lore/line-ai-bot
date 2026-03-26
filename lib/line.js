const line = require("@line/bot-sdk");
const crypto = require("crypto");

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

function getClient() {
  return new line.messagingApi.MessagingApiClient({
    channelAccessToken: config.channelAccessToken,
  });
}

function getBlobClient() {
  return new line.messagingApi.MessagingApiBlobClient({
    channelAccessToken: config.channelAccessToken,
  });
}

function validateSignature(body, signature) {
  const hash = crypto
    .createHmac("SHA256", config.channelSecret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

async function replyMessage(replyToken, messages) {
  const client = getClient();
  if (!Array.isArray(messages)) {
    messages = [messages];
  }
  return client.replyMessage({ replyToken, messages });
}

async function replyText(replyToken, text) {
  return replyMessage(replyToken, { type: "text", text });
}

async function replyFlex(replyToken, altText, contents) {
  return replyMessage(replyToken, {
    type: "flex",
    altText,
    contents,
  });
}

async function pushMessage(userId, messages) {
  const client = getClient();
  if (!Array.isArray(messages)) {
    messages = [messages];
  }
  return client.pushMessage({ to: userId, messages });
}

module.exports = {
  config,
  getClient,
  getBlobClient,
  validateSignature,
  replyMessage,
  replyText,
  replyFlex,
  pushMessage,
};
