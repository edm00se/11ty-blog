const path = require("path");
const Image = require("@11ty/eleventy-img");

module.exports = eleventyConfig => {

	eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
		// which file extensions to process
		extensions: "html",

		// Add any other Image utility options here:

		// optional, output image formats
		formats: ["avif", "webp", "auto"],
		// formats: ["auto"],

		// optional, output image widths
		widths: [600, "auto"],

		sharpOptions: {
			animated: true
		},

		// optional, attributes assigned on <img> override these values.
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},
	});

	// Eleventy Image shortcode
	// https://www.11ty.dev/docs/plugins/image/
	eleventyConfig.addShortcode("image", async function (src, alt, sizes) {
		let metadata = await Image(src, {
			widths: ["auto"],
			formats: ["avif", "jpeg", "gif"],
			sharpOptions: {
				animated: true
			},
			outputDir: "img" // path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
		});

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};

		// You bet we throw an error on a missing alt (alt="" works okay)
		return Image.generateHTML(metadata, imageAttributes);
	});
};
