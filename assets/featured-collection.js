document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('[data-featured-collection-section]')
  if (!section) return

  const heading = section.querySelector('[data-featured-heading]')
  const products = section.querySelector('[data-featured-products]')
  const button = section.querySelector('[data-featured-button]')
  const targets = [heading, products, button].filter(Boolean)

  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.remove('opacity-0'))
    return
  }

  const { gsap } = window

  const reset = () => {
    gsap.killTweensOf(targets)
    if (heading) gsap.set(heading, { y: 40, autoAlpha: 0 })
    if (products) gsap.set(products, { y: 80, autoAlpha: 0 })
    if (button) gsap.set(button, { y: 40, autoAlpha: 0 })
  }

  const reveal = () => {
    gsap.killTweensOf(targets)

    if (heading) {
      heading.classList.remove('opacity-0')
      gsap.to(heading, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power3.out' })
    }

    if (products) {
      products.classList.remove('opacity-0')
      gsap.to(products, {
        y: 0,
        autoAlpha: 1,
        duration: 1.3,
        ease: 'power3.out',
        delay: 0.15,
        onComplete: () => gsap.set(products, { clearProps: 'transform' }),
      })
    }

    if (button) {
      button.classList.remove('opacity-0')
      gsap.to(button, { y: 0, autoAlpha: 1, duration: 1, ease: 'power2.out', delay: 0.4 })
    }
  }

  reset()

  if (!window.ScrollTrigger) {
    reveal()
    return
  }

  window.ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    onEnter: reveal,
  })
  window.ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    onLeaveBack: reset,
  })
})
