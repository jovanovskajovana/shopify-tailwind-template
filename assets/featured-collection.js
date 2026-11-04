document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('[data-featured-collection-section]')
  if (!section) return

  const heading = section.querySelector('[data-featured-heading]')
  const grid = section.querySelector('[data-featured-grid]')
  const button = section.querySelector('[data-featured-button]')
  const cards = grid ? Array.from(grid.children) : []

  const targets = [heading, ...cards, button].filter(Boolean)
  if (!targets.length) return

  if (!window.gsap || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heading?.classList.remove('opacity-0')
    button?.classList.remove('opacity-0')
    grid?.classList.remove('[&>*]:opacity-0')
    return
  }

  const { gsap } = window

  // Reveal the content once the section scrolls into view.
  gsap.set(targets, { opacity: 0, y: 40 })

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
