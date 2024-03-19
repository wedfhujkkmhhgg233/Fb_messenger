module.exports.config = {
		name:"codm",
		version: "1.0.0",
		role: 0,
		credits: "Ainz",
		hasPrefix: false, 
		description: "Call of duty highlights video",
		usage: "{pref}(name_of_cmd)",
		cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
		const axios = require('axios');
		const request = require('request');
		const fs = require("fs");

		api.sendMessage(`⏱️ Sending please wait. . ..`, event.threadID, event.messageID);

		axios.post('https://share-apis.onrender.com/codm').then(res => {
				let ext = res.data.url.substring(res.data.url.lastIndexOf(".") + 1);
				let callback = function () {
						const username = res.data.user.unique_id;
						const nickname = res.data.user.nickname;
						const duration = res.data.duration;
						const region = res.data.all.region;
						const title = res.data.all.title;
						const views = res.data.all.play_count;
						const likes = res.data.all.digg_count;
						const comments = res.data.all.comment_count;
						const share = res.data.all.share_count;

						const info = `
								✨ Call of duty Game Play

								region: ${region}
								username: ${username}
								nickname: ${nickname}
								title: ${title}
										durations: ${duration}second(s)
								views: ${views}
								likes: ${likes}
										share: ${share}
										comments: ${comments}
						`;

						api.sendMessage({ 
								body: `${info}`,
								attachment: fs.createReadStream(__dirname + `/cache/codm.${ext}`)
						}, event.threadID, () => fs.unlinkSync(__dirname + `/cache/codm.${ext}`), event.messageID);
				};
				request(res.data.url).pipe(fs.createWriteStream(__dirname + `/cache/codm.${ext}`)).on("close", callback);
		}).catch(err => {
				api.sendMessage("error na bai maya naman", event.threadID, event.messageID);
				api.setMessageReaction("❌", event.messageID, (err) => {}, true);
		});     
}
