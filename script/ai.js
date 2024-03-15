const axios = require('axios');

module.exports.config = {
		name: "ai",
		version: "1.0.0",
		role: 0,
	  aliases: ["Ai"],
		credits: "Jonell Magallanes", //API BY MARK
		description: "EDUCATIONAL",
		hasPrefix: false,
		usage: "[question]",
		cooldown: 10
};

module.exports.run = async function ({ api, event, args }) {
		const question = args.join(' ');
		const apiUrl = `https://markdevsapi.onrender.com/gpt4?ask=${encodeURIComponent(question)}`;

		if (!question) return api.sendMessage("Please provide a question first.", event.threadID, event.messageID);

		try {
				api.sendMessage("Please bear with me while I ponder your request...", event.threadID, event.messageID);

				const response = await axios.get(apiUrl);
				const answer = response.data.answer;

				api.sendMessage(`${answer}`, event.threadID, event.messageID);
		} catch (error) {
				console.error(error);
				api.sendMessage("An error occurred while processing your request.", event.threadID);
		}
};