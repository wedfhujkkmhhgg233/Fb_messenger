const axios = require("axios");
const fs = require('fs-extra');
const path = require('path');
const ytdl = require("ytdl-core");
const yts = require("yt-search");

async function Play(api, event, args) {
		api.setMessageReaction("🕢", event.messageID, (err) => {}, true);
		try {
				let title = '';

				const extractShortUrl = async () => {
						const attachment = event.messageReply.attachments[0];
						if (attachment.type === "video" || attachment.type === "audio") {
								return attachment.url;
						} else {
								throw new Error("Invalid attachment type.");
						}
				};

				if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
						const shortUrl = await extractShortUrl();
						const musicRecognitionResponse = await axios.get(`https://youtube-music-sooty.vercel.app/kshitiz?url=${encodeURIComponent(shortUrl)}`);
						title = musicRecognitionResponse.data.title;
				} else if (args.length === 0) {
						api.sendMessage("Please provide a lyrics name", event.threadID);
						return;
				} else {
						title = args.join(" ");
				}

				const searchResults = await yts(title);
				if (!searchResults.videos.length) {
						api.sendMessage("No song and lyrics found for the given query.", event.threadID);
						return;
				}

				const videoUrl = searchResults.videos[0].url;
				const stream = ytdl(videoUrl, { filter: "audioonly" });

				const fileName = `lado.mp3`;
				const filePath = path.join(__dirname, "cache", fileName);
				const writer = fs.createWriteStream(filePath);

				stream.pipe(writer);

				writer.on('finish', async () => {
						const audioStream = fs.createReadStream(filePath);

						const lyricsResponse = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(title)}`);
						const { lyrics } = lyricsResponse.data;

						const messageBody = `🎧 Playing: ${title}\n\n${lyrics}`;

						api.sendMessage({ body: messageBody, attachment: audioStream }, event.threadID);

						api.setMessageReaction("✅", event.messageID, () => {}, true);
				});

				writer.on('error', (error) => {
						console.error("Error:", error);
						api.sendMessage("Error occurred while processing the song.", event.threadID);
				});
		} catch (error) {
				console.error("Error:", error);
				api.sendMessage("Error occurred while processing the song.", event.threadID);
		}
}

module.exports.config = {
		name: "play",
		version: "1.0.0",
		role: 0,
		credits: "cliff",
		description: "play music with its lyrics",
		usages: "{p] play lyricsName",
		hasPrefix: false, // Fixed the typo here
		cooldown: 5
};

module.exports.run = Play;
