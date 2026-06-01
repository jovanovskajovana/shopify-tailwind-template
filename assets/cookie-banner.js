document.addEventListener('DOMContentLoaded', () => {
  const banner = document.querySelector('[data-cookie-banner]')
  if (!banner) return

  const privacy = window.Shopify && window.Shopify.customerPrivacy

  const hasConsent = () => {
    if (localStorage.getItem('cookie-consent')) return true

    if (privacy) {
      const consent = privacy.currentVisitorConsent()
      if (consent && consent.marketing !== '') return true
    }
    return false
  }

  if (hasConsent()) return

  setTimeout(() => {
    banner.classList.remove('translate-y-full')
    banner.classList.add('translate-y-0')
  }, 3500)

  const hideBanner = () => {
    banner.classList.remove('translate-y-0')
    banner.classList.add('translate-y-full')
  }

  const onConsent = (accepted) => {
    hideBanner()
    localStorage.setItem('cookie-consent', accepted ? 'accepted' : 'declined')

    if (privacy) {
      privacy.setTrackingConsent(
        {
          analytics: accepted,
          marketing: accepted,
          preferences: accepted,
          sale_of_data: accepted,
        },
        () => {},
      )
    }
  }

  banner.querySelector('[data-cookie-accept]').addEventListener('click', () => onConsent(true))
  banner.querySelector('[data-cookie-decline]').addEventListener('click', () => onConsent(false))

  const manageBtn = banner.querySelector('[data-cookie-manage]')
  if (manageBtn) {
    manageBtn.addEventListener('click', () => {
      if (privacy && privacy.showPreferences) {
        privacy.showPreferences()
      }
    })
  }
})
