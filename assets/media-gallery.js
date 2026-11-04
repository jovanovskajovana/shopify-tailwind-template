if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      /**
       * @private
       * @type {number}
       */
      #currentIndex = 0

      /**
       * @private
       * @type {boolean}
       */
      #isThumbnailVisible = true

      /**
       * @private
       * @type {Set<Function>}
       */
      #eventListeners = new Set()

      /**
       * @private
       * @type {number}
       */
      #startX = 0

      constructor() {
        super()
        this.#initializeElements()
        if (this.gallery) {
          this.#initializeGallery()
        }
      }

      /**
       * Initialize DOM element references
       * @private
       */
      #initializeElements() {
        this.gallery = this.querySelector('#product-gallery')
        this.images = this.gallery?.querySelectorAll('.gallery-img')
        this.thumbnail = this.gallery?.querySelector('.img-thumbnail')
        this.dotsContainer = this.querySelector('.gallery-dots')

        if (!this.gallery || !this.images?.length) {
          return
        }

        if (!this.dotsContainer) {
          this.dotsContainer = document.createElement('div')
          this.dotsContainer.className = 'gallery-dots absolute bottom-[4.267vw] lg:bottom-[1.111vw] inset-x-0 flex justify-center gap-[2.133vw] lg:gap-[0.556vw] z-10'
          this.gallery.appendChild(this.dotsContainer)
        }
      }

      /**
       * Public method to reinitialize the gallery
       */
      reinitialize() {
        this.disconnectedCallback()
        this.#currentIndex = 0
        this.#isThumbnailVisible = true
        this.#initializeElements()
        this.#initializeGallery()
      }

      /**
       * Initialize gallery event listeners
       * @private
       */
      #initializeGallery() {
        // Keyboard navigation
        this.#addEventListenerWithCleanup(window, 'keydown', (event) => {
          if (document.activeElement === this || this.contains(document.activeElement)) {
            if (event.key === 'ArrowRight') this.#handleNext()
            if (event.key === 'ArrowLeft') this.#handlePrev()
          }
        })

        // Touch swipe navigation
        this.#addEventListenerWithCleanup(this.gallery, 'touchstart', (event) => this.#handleTouchStart(event))
        this.#addEventListenerWithCleanup(this.gallery, 'touchend', (event) => this.#handleTouchEnd(event))

        // Initialize dots
        this.#createDots()

        this.setAttribute('tabindex', '0')
        this.#updateGallery()
      }

      /**
       * Add event listener with cleanup tracking
       * @private
       */
      #addEventListenerWithCleanup(element, event, handler) {
        if (!element) return
        element.addEventListener(event, handler)
        this.#eventListeners.add(() => element.removeEventListener(event, handler))
      }

      /**
       * Update gallery display state
       * @private
       */
      #updateGallery() {
        if (!this.images?.length) return

        if (this.thumbnail) {
          this.thumbnail.classList.toggle('opacity-0', !this.#isThumbnailVisible)
        }

        this.images.forEach((img, index) => {
          const isActive = !this.#isThumbnailVisible && index === this.#currentIndex
          img.classList.toggle('opacity-0', !isActive)
          img.classList.toggle('opacity-100', isActive)
          img.setAttribute('aria-hidden', String(!isActive))
        })

        if (this.dotsContainer) {
          const activeIndex = this.thumbnail && this.#isThumbnailVisible ? 0 : (this.thumbnail ? this.#currentIndex + 1 : this.#currentIndex)
          const dots = this.dotsContainer.querySelectorAll('.gallery-dot')
          dots.forEach((dot, index) => {
            const isActive = index === activeIndex
            dot.classList.toggle('bg-gray-300', !isActive)
            dot.classList.toggle('bg-black-100', isActive)
            dot.setAttribute('aria-current', isActive ? 'true' : 'false')
          })
        }
      }

      /**
       * Handle next button click
       * @private
       */
      #handleNext() {
        if (this.#isThumbnailVisible) {
          this.#isThumbnailVisible = false
          this.#currentIndex = 0
        } else if (this.images?.length) {
          if (this.#currentIndex >= this.images.length - 1) {
            this.#isThumbnailVisible = true
          } else {
            this.#currentIndex = this.#currentIndex + 1
          }
        }
        this.#updateGallery()
      }

      /**
       * Handle previous button click
       * @private
       */
      #handlePrev() {
        if (this.#isThumbnailVisible && this.images?.length) {
          this.#isThumbnailVisible = false
          this.#currentIndex = this.images.length - 1
        } else if (this.images?.length) {
          if (this.#currentIndex === 0) {
            this.#isThumbnailVisible = true
          } else {
            this.#currentIndex = this.#currentIndex - 1
          }
        }
        this.#updateGallery()
      }

      /**
       * Handle touch start event
       * @private
       */
      #handleTouchStart(event) {
        this.#startX = event.touches[0].clientX
      }

      /**
       * Handle touch end event
       * @private
       */
      #handleTouchEnd(event) {
        const endX = event.changedTouches[0].clientX
        const deltaX = this.#startX - endX

        if (deltaX > 50) {
          // Swipe left (next)
          this.#handleNext()
        } else if (deltaX < -50) {
          // Swipe right (previous)
          this.#handlePrev()
        }
      }

      /**
       * Clean up event listeners when element is removed
       */
      disconnectedCallback() {
        this.#eventListeners.forEach((cleanup) => cleanup())
        this.#eventListeners.clear()
      }

      /**
       * Create dot indicators
       * @private
       */
      #createDots() {
        if (!this.dotsContainer) return

        this.dotsContainer.innerHTML = ''
        const count = (this.thumbnail ? 1 : 0) + (this.images?.length || 0)
        if (count < 2) {
          this.dotsContainer.classList.add('hidden')
          return
        }

        this.dotsContainer.classList.remove('hidden')
        for (let index = 0; index < count; index += 1) {
          const dot = document.createElement('button')
          dot.type = 'button'
          dot.className = 'gallery-dot bg-gray-300 border-0 rounded-full w-[2.133vw] lg:w-[0.556vw] h-[2.133vw] lg:h-[0.556vw] p-0 cursor-pointer'
          dot.setAttribute('aria-label', `Go to image ${index + 1}`)
          this.#addEventListenerWithCleanup(dot, 'click', () => this.#handleDotClick(index))
          this.dotsContainer.appendChild(dot)
        }
      }

      /**
       * Handle dot click
       * @private
       */
      #handleDotClick(index) {
        if (this.thumbnail && index === 0) {
          this.#isThumbnailVisible = true
          this.#currentIndex = 0
        } else {
          this.#isThumbnailVisible = false
          this.#currentIndex = this.thumbnail ? index - 1 : index
        }
        this.#updateGallery()
      }
    },
  )
}
