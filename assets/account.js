document.addEventListener('DOMContentLoaded', () => {
  const account = document.querySelector('shopify-account')

  if (!account) return

  const styles = `
    .account-button .account-button__avatar,
    .account-button .account-button__icon,
    .account-button slot {
      opacity: 0 !important;
    }
  `

  const applyStyles = () => {
    const root = account.shadowRoot

    if (!root) return false
    if (root.querySelector('[data-account-styles]')) return true

    const style = document.createElement('style')
    style.setAttribute('data-account-styles', '')
    style.textContent = styles
    root.appendChild(style)
    return true
  }

  const tryApply = () => {
    if (applyStyles()) return
    requestAnimationFrame(tryApply)
  }

  customElements.whenDefined('shopify-account').then(tryApply)
  account.addEventListener('open', tryApply)
})
