document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('[data-mobile-menu-toggle]')
  const mobileMenu = document.querySelector('[data-mobile-menu]')

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden')
    })
  }

  // Expose the header group height.
  const headerGroup = document.getElementById('main-header')

  if (headerGroup) {
    document.documentElement.style.setProperty('--header-height', `${headerGroup.offsetHeight}px`)
  }
})
