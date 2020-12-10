let notepadContainer = document.getElementById('notepad-container')

function start() {
	require([
		'codemirror/lib/codemirror',
		'codemirror/mode/htmlmixed/htmlmixed',
		'codemirror/mode/python/python',
	], function(CodeMirror) {
		let editor = CodeMirror.fromTextArea(notepadContainer, {
			lineNumbers: true,
			mode: 'python',
			theme: 'default'
		})

		let pending
		editor.on('change', function() {
			clearTimeout(pending)
			pending = setTimeout(update, 400)
		})
		function guessLanguage(code) {
			let aliases = {
				html: 'htmlmixed'
			}
			let language = hljs.highlightAuto(code, ['javascript', 'python', 'html', 'css', 'xml']).language
			if (aliases[language])
				language = aliases[language]
			return language
		}
		function update() {
			let code = editor.getValue()
			let language = guessLanguage(code)
			editor.setOption('mode', language)
		}
		
	})
}
if (notepadContainer) start()
else document.addEventListener('DOMContentLoaded', () => {
	notepadContainer = document.getElementById('notepad-container')
	start()
})