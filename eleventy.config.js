const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const pluginToc = require("eleventy-plugin-toc");
const embedEverything = require("eleventy-plugin-embed-everything");
const markdownItAttrs = require('markdown-it-attrs');
const addRemoteData = require("@aaashur/eleventy-plugin-add-remote-data");
const timeToRead = require('eleventy-plugin-time-to-read');
const sharp = require("sharp"); // available via @11ty/eleventy-img

const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginImages = require("./eleventy.config.images.js");

module.exports = async function(eleventyConfig) {
	const { EleventyHtmlBasePlugin } = await import("@11ty/eleventy");

	// remove errors over missing trailing slash or .html
	eleventyConfig.configureErrorReporting({ allowMissingExtensions: true });
	
	// Set global permalinks to resource.html style
	eleventyConfig.addGlobalData("permalink", () => {
		return (data) =>
			`${data.page.filePathStem}.${data.page.outputFileExtension}`;
	});

	// Remove .html from `page.url` entries
	eleventyConfig.addUrlTransform((page) => {
		if (page.url.endsWith(".html")) {
			return page.url.slice(0, -1 * ".html".length);
		}
	});

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css"
	});

	// adds favicon
	if (process.env.NODE_ENV === 'production') {
		eleventyConfig.on('eleventy.before', async () => {
		  console.log('[11ty] Generating Favicon');
		  await sharp('content/favicon.png')
			.png()
			.resize(96, 96)
			.toFile('public/img/icon-96x96.png')
			.catch(function (err) {
			  console.log('[11ty] ERROR Generating favicon');
			  console.error(err);
			});
		});
	  }
	  eleventyConfig.watchIgnores.add('public/img/icon-96x96.png');

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

	// App plugins
	eleventyConfig.addPlugin(pluginDrafts);
	eleventyConfig.addPlugin(pluginImages);

	// Official plugins
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 }
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginBundle);

	// 3rd party plugins
	eleventyConfig.addPlugin(pluginToc);
	eleventyConfig.addPlugin(embedEverything);
	eleventyConfig.addPlugin(addRemoteData, {
        data: {
            ghProfile: {
				url: 'https://api.github.com/users/edm00se',
				type: 'json'
			}
        },
    });
	eleventyConfig.addPlugin(timeToRead, {
		speed: '800 characters per minute',
		language: 'en',
		style: 'short',
		type: 'unit',
		hours: 'auto',
		minutes: true,
		seconds: false,
		digits: 1,
		output: function(data) {
		  return data.timing;
		}
	  })

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(format || "dd LLLL yyyy");
	});

	eleventyConfig.addFilter('htmlDateString', (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if(!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if( n < 0 ) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
	});

	eleventyConfig.addFilter("stringify", (ob) => {
		return JSON.stringify(ob);
	});

	// https://stackoverflow.com/questions/69198527/how-do-you-sort-a-list-of-blog-post-tags-by-the-number-of-posts-that-contain-the/69201497#69201497
	eleventyConfig.addCollection("postsSortedByTagCount", function(collectionApi) {
		const allPosts = collectionApi.getAll();
		const countPostsByTag = new Map();
		allPosts.forEach((post) => {
		  const tags = post.data.tags || [];
		  tags.forEach((tag) => {
			const count = countPostsByTag.get(tag) || 0;
			countPostsByTag.set(tag, count + 1);
		  })
		});
		countPostsByTag.delete('posts');
		const sortedArray = [...countPostsByTag].sort((a, b) => b[1] - a[1]);
		return sortedArray;
	  });

	// custom permalinks
	eleventyConfig.addFilter("post_permalink", page => {
		// const yyyy = page.date.getFullYear();
		// const mm = String(page.date.getMonth() + 1).padStart(2, "0");
		// return page.permalink ?? `${yyyy}/${mm}/${page.fileSlug}/`;
		return `${page.permalink}` ?? `${page.fileSlug}/`;
	});

	eleventyConfig.addFilter("failOverCoverImage", function(imgPath) {
		let nwImgPath = imgPath;
		if(!nwImgPath) {
			const fallbackCoverImages = [
				'stack_o_blocks.jpg',
				'stack_o_books.jpg',
				'stack_o_jenga.jpg',
				'stack_o_macarons.jpg',
				'stack_o_more_books.jpg',
				'stack_o_papers.jpg',
				'stack_o_plaid.jpg',
				'stack_o_rocks.jpg'
			];
			nwImgPath = fallbackCoverImages[Math.floor(Math.random() * fallbackCoverImages.length)];
		}
		return nwImgPath;
	});

	eleventyConfig.addFilter("modifyCoverImage", (imgPath) => {
		return imgPath.replace('./','content/blog/').replace(/\/$/, '');
		// return imgPath.replace('./','./blog/');
	});

	eleventyConfig.addPlugin(require("./eleventy.config.shortcodes.js"));

	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", mdLib => {
		mdLib.use(markdownItAttrs);
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor",
				symbol: "#",
				ariaHidden: false,
			}),
			level: [1,2,3,4],
			slugify: eleventyConfig.getFilter("slugify")
		});
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: [
			"md",
			"njk",
			"html",
			"liquid"
		],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content",         // default: "."
			includes: "../_includes",  // default: "_includes"
			data: "../_data",          // default: "_data"
			output: "_site"
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};
