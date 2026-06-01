document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('[data-mobile-menu-toggle]')
  const mobileMenu = document.querySelector('[data-mobile-menu]')

  if (menuToggle && mobileMenu) {
    const setExpanded = (isOpen) => {
      menuToggle.setAttribute('aria-expanded', String(isOpen))
    }

    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('hidden') === false
      setExpanded(isOpen)
    })

    mobileMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        mobileMenu.classList.add('hidden')
        setExpanded(false)
      }
    })
  }

  // Expose the header group height.
  const headerGroup = document.getElementById('main-header')

  if (headerGroup) {
    document.documentElement.style.setProperty('--header-height', `${headerGroup.offsetHeight}px`)
  }
})
