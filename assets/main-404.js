document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('[data-404-section]')
  if (!section) return

  const targets = [
    section.querySelector('[data-404-heading]'),
    section.querySelector('[data-404-subtitle]'),
    section.querySelector('[data-404-cta]'),
  ].filter(Boolean)

  if (!targets.length) return

  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.remove('opacity-0'))
    return
  }

  const { gsap } = window

  const reset = () => {
    gsap.killTweensOf(targets)
    gsap.set(targets, { y: 40, opacity: 0 })
  }

  const reveal = () => {
    gsap.killTweensOf(targets)
    targets.forEach((el) => el.classList.remove('opacity-0'))
    gsap.to(targets, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
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
