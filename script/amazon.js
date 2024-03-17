const axios = require('axios');

module.exports.config = {
		name: "amazon",
		version: "1.0.0",
		credits: "Samir Œ , Faith Xe",
		hasPrefix: false,
		role: 2,
		description: "Search for products on Amazon",
		aliases: [],
		usage: "{prefix}amazon <search_query>",
		cooldown: 5,
};

module.exports.run = async function ({ event, args }) {
		const searchQuery = args.join(" ");
		if (!searchQuery) {
				return event.reply("Please provide a search query.");
		}

		try {
				const response = await axios.get(`https://api-samir.onrender.com/amazon/search?search=${encodeURIComponent(searchQuery)}`);
				const products = response.data;

				if (products.length === 0) {
						return event.reply("No products found.");
				}

				const randomIndex = Math.floor(Math.random() * products.length);
				const product = products[randomIndex];

				const messageBody = `Title: ${product.title}\n\nRank: ${product.rank}\n\nPrice: ${product.price}\n\nRating: ${product.rating}`;

				// Fetch image directly using Axios
				const imageResponse = await axios.get(product.image_url, { responseType: 'stream' });

				if (!imageResponse || !imageResponse.data) {
						return event.reply("Failed to retrieve image.");
				}

				return event.reply({
						body: messageBody,
						attachment: imageResponse.data
				});
		} catch (error) {
				console.error(error);
				return event.reply("Failed to search for products on Amazon.");
		}
};
