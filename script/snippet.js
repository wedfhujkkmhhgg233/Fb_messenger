const axios = require('axios');

module.exports.config = {
		name: 'snippet',
		version: '1.0.0',
		role: 0,
		description: "Create an image",
		usage: "{pn} <text> | <backgroundColor>",
		credits: 'Developer',
		cooldown: 3,
		hasPrefix: false,
	  aliases: ["carbon","snipe"]
};

module.exports.run = async function ({ api, event, args }) {
		const input = args.join(" ");
		const [text, backgroundColor] = input.split("∆").map(part => part.trim());

		if (!text) {
				return api.sendMessage("Please provide a prompt.", event.threadID);
		}

		try {
				const API = `https://api-samir.onrender.com/carbon?code=${encodeURIComponent(text)}&themeNumber=${encodeURIComponent(backgroundColor || "5")}`;
				const imageStream = (await axios.get(API, { responseType: 'stream' })).data;

				// Sending the message
				const messageId = await api.sendMessage("Initializing image, please wait...", event.threadID);

				// Sending the image as an attachment
				await api.sendMessage({
						body: `  `,
						attachment: imageStream
				}, event.threadID);

				// Deleting the previous message
				await api.deleteMessage(messageId, event.threadID);
		} catch (error) {
				console.error(error);
				api.sendMessage(`Error: ${error}`, event.threadID);
		}
};
