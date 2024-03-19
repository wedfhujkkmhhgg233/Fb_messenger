module.exports.config = {
	name: "gemini",
	role: 0,
	credits: "Deku",
	description: "Talk to Gemini (conversational)",
	hasPrefix: false,
	aliases: []
};

module.exports.run = async function ({ api, event, args }) {
	const axios = require("axios");
	let prompt = args.join(" "),
		uid = event.senderID,
		url;
	if (!prompt) return api.sendMessage(`Please enter a prompt.`, event.threadID);
	api.sendTypingIndicator(event.threadID);
	try {
		const geminiApi = `https://gemini-api.replit.app`;
		if (event.type == "message_reply") {
			if (event.messageReply.attachments[0]?.type == "photo") {
				url = encodeURIComponent(event.messageReply.attachments[0].url);
				const res = (await axios.get(geminiApi + "/gemini?prompt=" + prompt + "&url=" + url + "&uid=" + uid)).data;
				return api.sendMessage(res.gemini, event.threadID);
			} else {
				return api.sendMessage('Please reply to an image.', event.threadID);
			}
		}
		const response = (await axios.get(geminiApi + "/gemini?prompt=" + prompt + "&uid=" + uid)).data;
		return api.sendMessage(response.gemini, event.threadID);
	} catch (error) {
		console.error(error);
		return api.sendMessage(error.message, event.threadID);
	}
};
