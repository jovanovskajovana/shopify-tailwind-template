document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap) return

  const { gsap } = window

  const section = document.querySelector('[data-collection-section]')
  if (!section) return

  const heading = section.querySelector('[data-collection-heading]')
  const grid = section.querySelector('[data-collection-grid]')
  const cards = grid ? Array.from(grid.children) : []

  const targets = [heading, ...cards].filter(Boolean)
  if (!targets.length) return

  gsap.set(targets, { opacity: 0, y: 40 })

  // Reveal the content once the section scrolls into view.
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return
      observer.disconnect()

      gsap.timeline().to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
      })
    },
    { threshold: 0.15 },
  )

  observer.observe(section)
})
