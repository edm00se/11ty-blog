// custom shortcodes

module.exports = eleventyConfig => {
  // custom gist shortcode
  eleventyConfig.addShortcode("gist", (user, gistId, fileName) => {
    return `<script src="https://gist.github.com/${user}/${gistId}.js${ fileName ? '?file='+fileName : ''} "></script>`;
  });

	// custom jsfiddle shortcode
	eleventyConfig.addShortcode("jsfiddle", (slug, tabs, dark) => {
		return `<script async src="https://jsfiddle.net/${slug}/embed/${tabs+'/' ?? ''}${dark ? 'dark/': ''}"></script>`;
	});

	// custom asciicast embed
	eleventyConfig.addShortcode("asciicast", (id) => {
		return `<script async id="asciicast-${id}" src="https://asciinema.org/a/${id}.js"></script>`;
	});

	// custom mastodon embed
	eleventyConfig.addShortcode("toot", (server, user, id) => {
		// {% toot "honk.farm", "eric", "109298717524705791" %}
		return `<iframe src="https://${server}/@${user}/${id}/embed" class="mastodon-embed" style="max-width: 100%; border: 0" width="400" allowfullscreen="allowfullscreen"></iframe><script src="https://${server}/embed.js" async="async"></script>`;
	});
	
	// custom mastodon embed from my server
	eleventyConfig.addShortcode("honk", (id) => {
		// {% toot "honk.farm", "eric", "109298717524705791" %}
		return `<iframe src="https://honk.farm/@eric/${id}/embed" class="mastodon-embed" style="max-width: 100%; border: 0" width="400" allowfullscreen="allowfullscreen"></iframe><script src="https://${server}/embed.js" async="async"></script>`;
	});

	// custom tweet embed
	eleventyConfig.addShortcode("tweet", (user, id) => {
		// {% tweet "stolinski", "1629212633197936644" %}
		// https://twitter.com/edm00se/status/1590910273245831170
		return `<blockquote class="twitter-tweet"><p lang="en" dir="ltr"><a href="https://twitter.com/${user}/status/${id}?ref_src=twsrc%5Etfw"></a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> `;
	});

	// work needed for styling, etc.
	eleventyConfig.addShortcode("tweetbu", (id) => {
		return `<iframe src="https://tweets.edm00se.codes/${id}/">failed to load</iframe>`;
	});
};