document.addEventListener('DOMContentLoaded', () => {
	const toggle = document.getElementById('nav-toggle')
	const nav = document.getElementById('main-navigation')

	if (toggle && nav) {
		toggle.addEventListener('click', () => {
			const expanded = toggle.getAttribute('aria-expanded') === 'true'
			toggle.setAttribute('aria-expanded', String(!expanded))
			nav.classList.toggle('show')
		})
	}
})
