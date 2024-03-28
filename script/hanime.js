const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function fetchAnimeList(query) {
	try {
		const response = await axios.get(`https://hanime-reco.vercel.app/search?query=${query}`);
		const data = JSON.parse(response.data.response);
		return data;
	} catch (error) {
		console.error(error);
		throw new Error("Failed to fetch anime list");
	}
}

async function fetchRecentAnimeList() {
	try {
		const response = await axios.get("https://hanime-reco.vercel.app/recent");
		const data = JSON.parse(response.data.response);
		return data;
	} catch (error) {
		console.error(error);
		throw new Error("Failed to fetch recent anime list");
	}
}

async function downloadPoster(posterUrl, fileName) {
	try {
		const cacheDir = path.join(__dirname, 'cache');
		if (!fs.existsSync(cacheDir)) {
			fs.mkdirSync(cacheDir, { recursive: true });
		}

		const response = await axios.get(posterUrl, { responseType: "stream" });
		const writer = fs.createWriteStream(fileName);
		response.data.pipe(writer);
		return new Promise((resolve, reject) => {
			writer.on("finish", () => resolve(fileName));
			writer.on("error", reject);
		});
	} catch (error) {
		console.error(error);
		throw new Error("Failed to download image");
	}
}

module.exports.config = {
	name: "hanime",
	version: "1.0.0",
	credits: "cliff",//api by kshitiz 
	hasPrefix: false,
	role: 0,
	description: "search for hentai or get recent hentai list",
	aliases: [],
	usage: "{p}hanime {query/recent}",
	cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
	api.setMessageReaction("🕐", event.messageID, () => {}, true);

	try {
		const subCmd = args[0].toLowerCase();
		let animeList = [];

		if (subCmd === 'recent') {
			animeList = await fetchRecentAnimeList();
		} else {
			const query = args.slice(1).join(" ");
			animeList = await fetchAnimeList(query);
		}

		if (!Array.isArray(animeList) || animeList.length === 0) {
			api.sendMessage({ body: `No hanime found.` }, event.threadID, event.messageID);
			api.setMessageReaction("❌", event.messageID, () => {}, true);
			return;
		}

		const animeNames = animeList.map((anime, index) => `${index + 1}. ${anime.name}`).join("\n");
		const message = `Choose an hanime by replying with its number:\n\n${animeNames}`;

		api.sendMessage({ body: message }, event.threadID, (err, info) => {
			event.messageReply.body = message;
			event.messageReply.animeList = animeList;
			event.messageReply.subCmd = subCmd;
		});

		api.setMessageReaction("✅", event.messageID, () => {}, true);
	} catch (error) {
		console.error(error);
		api.sendMessage({ body: "{p} hanime {query} or {p} hanime recent / reply by number" }, event.threadID, event.messageID);
		api.setMessageReaction("❌", event.messageID, () => {}, true);
	}
};

module.exports.handleEvent = async function ({ api, event, args }) {
	const { animeList, subCmd } = event.messageReply;

	if (!animeList) {
		return;
	}

	const animeIndex = parseInt(args[0], 10);

	if (isNaN(animeIndex) || animeIndex <= 0 || animeIndex > animeList.length) {
		api.sendMessage({ body: "Invalid input.\nPlease provide a valid number." }, event.threadID, event.messageID);
		return;
	}

	const selectedAnime = animeList[animeIndex - 1];
	const posterUrl = selectedAnime.poster_url;
	const description = selectedAnime.description;

	try {
		const posterFileName = path.join(__dirname, 'cache', `${Date.now()}_${selectedAnime.name}.jpg`);
		await downloadPoster(posterUrl, posterFileName);
		const posterStream = fs.createReadStream(posterFileName);
		api.sendMessage({ body: description, attachment: posterStream }, event.threadID, event.messageID);
	} catch (error) {
		console.error(error);
		api.sendMessage({ body: "An error occurred while processing the anime.\nPlease try again later." }, event.threadID);
	} finally {
		fs.unlinkSync(posterFileName);
	}
};
