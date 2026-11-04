document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('[data-newsletter-section]')
  if (!section) return

  const content = section.querySelector('[data-newsletter-reveal]')
  if (!content) return

  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    content.classList.remove('opacity-0')
    return
  }

  const { gsap } = window

  const reset = () => {
    gsap.killTweensOf(content)
    gsap.set(content, { y: 40, autoAlpha: 0 })
  }

  const reveal = () => {
    gsap.killTweensOf(content)
    content.classList.remove('opacity-0')
    gsap.to(content, {
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
