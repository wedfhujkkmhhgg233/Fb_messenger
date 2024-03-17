module.exports.config = {
	name: "google-search",
	version: "1.0.0",
	credits: "Samir Œ , Faith Xe",
	hasPrefix: false,
	role: 0,
	description: "Perform a Google search",
	aliases: ["google"],
	usage: '{pn} [search query]',
	cooldown: 5,
};

module.exports.run = async function ({ api, event, args }) {
	try {
		const searchQuery = args.join(' ');

		if (!searchQuery) {
			return api.sendMessage('Please provide a search query.', event.threadID);
		}

		const googleSearchResult = await performGoogleSearch(searchQuery);

		api.sendMessage(googleSearchResult, event.threadID);
	} catch (error) {
		console.error(error);
		api.sendMessage('An error occurred during the Google search.', event.threadID);
	}
};

async function performGoogleSearch(text) {
	try {
		const googleit = require('google-it');
		const googleSearch = await googleit({ query: text });
		let resText = `⚡️ Google Search Results ⚡️\n\n🔍 Search Term: ${text}\n\n`;

		for (let num = 0; num < Math.min(5, googleSearch.length); num++) {
			resText += `📍 Result ${num + 1}:\n\n📚 Title: ${
				googleSearch[num].title
			}\n\n🔍 Description: ${
				googleSearch[num].snippet
			}\n\n🌐 Link: [${googleSearch[num].link}](${googleSearch[num].link})\n\n`;
		}

		console.log(resText);
		return resText;
	} catch (error) {
		console.error('Error during Google search:', error);
		throw error;
	}
}
