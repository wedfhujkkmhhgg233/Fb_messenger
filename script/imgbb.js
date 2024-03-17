const fetch = require('node-fetch');

module.exports.config = {
		name: "imgbb",
		version: "1.0.0",
		credits: "Samir Œ , Faith Xe",
		hasPrefix: false,
		role: 0,
		description: "Upload an image to imgbb",
		aliases: [],
		usage: "{pn} <attached image>",
		cooldown: 5,
};

module.exports.run = async function ({ api, event }) {
		try {
				let imageUrl;

				if (event.type === "message_reply" && event.messageReply.attachments) {
						const attachments = event.messageReply.attachments;

						if (attachments.length === 0) {
								return api.sendMessage("Please reply to a message with an attached image to upload.", event.threadID);
						}

						imageUrl = attachments[0].url;
				} else {
						if (!event.messageID) {
								return api.sendMessage("Please reply to a message with an attached image to upload.", event.threadID);
						}

						const messageInfo = await api.getMessageInfo(event.threadID, event.messageID);
						const attachments = messageInfo.attachments;

						if (attachments.length === 0) {
								return api.sendMessage("Please reply to a message with an attached image to upload.", event.threadID);
						}

						imageUrl = attachments[0].url;
				}

				const uploadUrl = 'https://api-samir.onrender.com/upload';
				const data = { file: imageUrl };

				const response = await fetch(uploadUrl, {
						method: 'POST',
						headers: {
								'Content-Type': 'application/json'
						},
						body: JSON.stringify(data)
				});

				const result = await response.json();

				if (result && result.image && result.image.url) {
						const cleanImageUrl = result.image.url.split('-')[0];
						api.sendMessage(`${cleanImageUrl}.jpg`, event.threadID);
				} else {
						api.sendMessage("Failed to upload the image to imgbb.", event.threadID);
				}
		} catch (error) {
				console.error('Error:', error);
				api.sendMessage(`Error: ${error}`, event.threadID);
		}
};
