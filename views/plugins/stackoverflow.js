{# i abused nunjucks very much for this. be warned :) #}

{# if it's too long, just make it show up in the sidebar instead #}
{% set usingSidebar = html.length > 300 %}

{% if usingSidebar %}
let answerEl = document.getElementById('sidebar')
{% else %}
let answerEl = document.getElementById('answer')
{% endif %}

{#
	{% if sidebar.image %}<img class="sidebar-image" src="{{ sidebar.image }}">{% endif %}
	{% if sidebar.url %}<a href="{{ sidebar.url }}">{% endif %}<h2 class="sidebar-title">{{ sidebar.title }}</h2>{% if sidebar.url %}</a>{% endif %}
	<p class="sidebar-content">{{ sidebar.content }}</p>
#}

let resultsEl = document.getElementById('results')

if (!answerEl) {
	answerEl = document.createElement('{% if usingSidebar %}aside{% else %}div{% endif %}')
	answerEl.id = '{% if usingSidebar %}sidebar{% else %}answer{% endif %}'

	stackoverflowAnswerEl = document.createElement('p')
	{% if usingSidebar %}stackoverflowAnswerEl.classList.add('sidebar-content'){% endif %}
	stackoverflowAnswerEl.innerHTML = `{{ html|safe }}`


	answerHrefEl = document.createElement('a')
	answerHrefEl.href = '{{ url|safe }}'

	answerTitleEl = document.createElement('{% if usingSidebar %}h2{% else %}h3{% endif %}')
	answerTitleEl.textContent = '{{ title|safe }}'
	answerTitleEl.classList.add('result-title')

	{% if not usingSidebar %}
	answerUrlEl = document.createElement('span')
	answerUrlEl.textContent = '{{ originalUrl|safe }}'
	answerUrlEl.classList.add('result-url')
	{% endif %}


	answerHrefEl.appendChild(answerTitleEl)
	{% if not usingSidebar %}
	answerHrefEl.appendChild(answerUrlEl)
	{% endif %}

	{% if usingSidebar %}
	answerEl.appendChild(answerHrefEl)
	answerEl.appendChild(stackoverflowAnswerEl)
	{% else %}
	answerEl.appendChild(stackoverflowAnswerEl)
	answerEl.appendChild(answerHrefEl)
	{% endif %}
	resultsEl.prepend(answerEl)


// 	{% if answer.url %}<a href="{{ answer.url }}">{% endif %}
// 	{% if answer.title %}<h3 class="result-title">{{ answer.title }}</h3>{% endif %}
// 	{% if answer.url %}<span class="result-url">{{ answer.url }}</h3>{% endif %}
// {% if answer.url %}</a>{% endif %}

}