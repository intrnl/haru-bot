import { define } from '../lib/handler';
import { parseOptions } from '../lib/utils';


let url = 'https://graphql.anilist.co';

let query = `
	query ($search: String!, $type: MediaType!) {
		result: Media (type: $type, search: $search) {
			url: siteUrl
			cover: coverImage { large }
			title { romaji native english }
			description
			score: averageScore
			episodes
			season
			seasonYear
		}
	}
`;


define('anilist', (interaction) => {
	let opts = parseOptions(interaction);
	let type = opts._[1].toUpperCase();
	let search = opts.query;

	return fetch(url, {
		method: 'post',
		headers: [
			['user-agent', 'github:intrnl/haru-discord-bot'],
			['content-type', 'application/json'],
			['accept', 'application/json'],
		],
		body: JSON.stringify({ query, variables: { type, search } }),
	})
		.then((response) => response.json())
		.then(({ data, errors }) => {
			if (errors?.length) {
				let error = errors[0];
				return 'AniList error - ' + error.message;
			}

			if (!data) {
				return 'Unknown error - Check back later.';
			}

			let { result } = data;

			return {
				embeds: [
					{
						author: { name: 'AniList', url: 'https://anilist.co' },
						title: result.title.english ?? result.title.romaji ?? result.title.native,
						description: trim(prune(result.description), 280),
						url: result.url,
						thumbnail: { url: result.cover.large },
					},
				],
			};
		});
});


function prune (str) {
	return str
		.replace(/<br>/i, '');
}

function trim (str, max) {
	return str.length > max
		? str.slice(0, max - 1) + '…'
		: str;
}
