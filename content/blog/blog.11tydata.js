module.exports = {
	tags: [
		"posts"
	],
	layout: "layouts/post.njk",
	permalink: "{{ page | post_permalink }}"
};
