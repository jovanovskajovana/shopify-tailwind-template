document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) return

  const { gsap } = window

  const section = document.querySelector('[data-home-hero-section]')
  if (!section) return

  const heading = section.querySelector('[data-hero-heading]')
  const subheading = section.querySelector('[data-hero-subheading]')
  const button = section.querySelector('[data-hero-button]')

  const targets = [heading, subheading, button].filter(Boolean)
  if (!targets.length) return

  // Entrance animation: fade and slide the content up in sequence.
  gsap.set(targets, { opacity: 0, y: 40 })

  gsap.timeline({ delay: 0.2 }).to(targets, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.15,
  })
})
