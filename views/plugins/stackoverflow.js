let answerEl = document.getElementById('answer')
let resultsEl = document.getElementById('results')
if (!answerEl) {
	answerEl = document.createElement('div')
	answerEl.id = 'answer'

	stackoverflowAnswerEl = document.createElement('div')
	stackoverflowAnswerEl.innerHTML = `{{ html|safe }}`


	answerHrefEl = document.createElement('a')
	answerHrefEl.href = '{{ url }}'

	answerTitleEl = document.createElement('h3')
	answerTitleEl.textContent = '{{ title }}'
	answerTitleEl.classList.add('result-title')

	answerUrlEl = document.createElement('span')
	answerUrlEl.textContent = '{{ originalUrl }}'
	answerUrlEl.classList.add('result-url')


	answerHrefEl.appendChild(answerTitleEl)
	answerHrefEl.appendChild(answerUrlEl)

	answerEl.appendChild(stackoverflowAnswerEl)
	answerEl.appendChild(answerHrefEl)
	resultsEl.prepend(answerEl)


// 	{% if answer.url %}<a href="{{ answer.url }}">{% endif %}
// 	{% if answer.title %}<h3 class="result-title">{{ answer.title }}</h3>{% endif %}
// 	{% if answer.url %}<span class="result-url">{{ answer.url }}</h3>{% endif %}
// {% if answer.url %}</a>{% endif %}

}