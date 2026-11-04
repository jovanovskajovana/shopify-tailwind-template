document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('[data-product-reviews-section]')
  if (!section) return

  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    section.classList.remove('opacity-0')
    return
  }

  const { gsap } = window

  const reset = () => {
    gsap.killTweensOf(section)
    gsap.set(section, { y: 40, autoAlpha: 0 })
  }

  const reveal = () => {
    gsap.killTweensOf(section)
    section.classList.remove('opacity-0')
    gsap.to(section, {
      y: 0,
      autoAlpha: 1,
      duration: 1.2,
      ease: 'power3.out',
      clearProps: 'transform',
    })
  }

  reset()

  if (!window.ScrollTrigger) {
    reveal()
    return
  }

  window.ScrollTrigger.create({
    trigger: section,
    start: 'top 80%',
    onEnter: reveal,
  })
  window.ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    onLeaveBack: reset,
  })
})
