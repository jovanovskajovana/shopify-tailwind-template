document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) return

  const { gsap } = window

  const section = document.querySelector('[data-contact-section]')
  if (!section) return

  const heading = section.querySelector('[data-contact-heading]')
  const content = section.querySelector('[data-contact-content]')
  const cta = section.querySelector('[data-contact-cta]')

  const targets = [heading, content, cta].filter(Boolean)
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
