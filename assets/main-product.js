document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('[data-product-section]')
  if (!section) return

  const targets = [
    section.querySelector('[data-product-media]'),
    section.querySelector('[data-product-title]'),
    section.querySelector('[data-product-price]'),
    section.querySelector('[data-product-description]'),
    section.querySelector('[data-product-variants]'),
    section.querySelector('[data-product-form]'),
  ].filter(Boolean)

  if (!targets.length) return

  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.remove('opacity-0'))
    return
  }

  const { gsap } = window

  const reset = () => {
    gsap.killTweensOf(targets)
    gsap.set(targets, { opacity: 0, y: 40 })
  }

  const reveal = () => {
    gsap.killTweensOf(targets)
    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
    })
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
