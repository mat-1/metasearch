const fetch = require('node-fetch')
const { performance } = require('perf_hooks')

async function main() {
	const res = await fetch('https://google.com/search?q=wynncraft', {
		headers: {
			'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0',
		},
	})
	let data = ''
	let perfBefore = performance.now()
	let chunkCount = 0

	// res.body.on('data', chunk => {
	// 	data += chunk
	// 	chunkCount ++
	// }).on('end', () => {
	// 	let perfAfter = performance.now()
	// 	console.log('end', data.length)
	// 	console.log(Math.floor(perfAfter - perfBefore))
	// 	console.log(`${chunkCount} chunks, ${data.length/chunkCount}`)
	// })



	data = await res.buffer()

	let perfAfter = performance.now()
	console.log('end', data.length)
	console.log(Math.floor(perfAfter - perfBefore))

}

main()