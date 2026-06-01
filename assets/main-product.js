document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) return

  const { gsap } = window

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

  // Entrance animation: fade and slide the content up in sequence.
  gsap.set(targets, { opacity: 0, y: 40 })

  gsap.timeline({ delay: 0.2 }).to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.12,
  })
})
