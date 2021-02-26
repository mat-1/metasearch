import { requestDom, get } from '../../parser'
import { Options } from '../../search'

const githubHost: string = 'https://github.com'

interface GithubRepo {
	author: string
	name: string
}

export async function runPlugin({ author, name }: GithubRepo) {
	const url = `${githubHost}/${author}/${name}`
	const dom = await requestDom(url)
	dom('svg').remove()

	const body: cheerio.Cheerio = dom('body')

	const readmeEl = get(body, '#readme article')
	const readmeHtml = readmeEl.html()
	if (readmeHtml == null)
		// no readme :(
		return false
		
	return {
		html: readmeHtml.trim().replace(/\n/g, '\\n').replace(/`/g, '\\`'),
		url
	}
}

export async function changeOptions(options: Options) {
	if (options.sidebar)
		// an answer was already found, no need to search for one
		return options

	for (let resultIndex = 0; resultIndex < options.results.length; resultIndex ++) {
		const result = options.results[resultIndex]
		// make sure its a github link and one of the top 4 results
		if (result.url.startsWith(githubHost + '/') && resultIndex <= 4) {
			const path = result.url.slice(githubHost.length + 1).split('/')
			if (path.length === 2) {
				const [ author, name ] = path
				if (!options.plugins.github)
					options.plugins.github = {
						author, name
					}
			}
		}
	}
	return options
}
