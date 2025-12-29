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
        this.images = this.gallery?.querySelectorAll('.gallery-img:not(.img-thumbnail)')
        this.thumbnail = this.gallery?.querySelector('.img-thumbnail')
        this.nextButton = this.querySelector('#gallery-right-btn')
        this.prevButton = this.querySelector('#gallery-left-btn')
        this.dotsContainer = this.querySelector('.gallery-dots')

        if (!this.gallery || !this.images?.length) {
          console.warn('Media Gallery: Required elements not found')
          return
        }

        // Create dots container if it doesn't exist
        if (!this.dotsContainer) {
          this.dotsContainer = document.createElement('div')
          this.dotsContainer.className = 'gallery-dots hidden md:flex justify-center gap-2 mt-4 absolute bottom-[30px] left-0 right-0'
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
        // Button controls
        this.#addEventListenerWithCleanup(this.nextButton, 'click', () => this.#handleNext())
        this.#addEventListenerWithCleanup(this.prevButton, 'click', () => this.#handlePrev())

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
          this.thumbnail.style.opacity = this.#isThumbnailVisible ? '1' : '0'
        }

        this.images.forEach((img, index) => {
          const isActive = index === this.#currentIndex
          img.classList.toggle('opacity-0', !isActive)
          img.classList.toggle('opacity-100', isActive)
          img.setAttribute('aria-hidden', !isActive)
        })

        // Update dots
        const dots = this.dotsContainer.querySelectorAll('.gallery-dot')
        dots.forEach((dot, index) => {
          const isActive = index === this.#currentIndex
          dot.classList.toggle('bg-gray-300', !isActive)
          dot.classList.toggle('bg-black', isActive)
          dot.setAttribute('aria-current', isActive ? 'true' : 'false')
        })
      }

      /**
       * Handle next button click
       * @private
       */
      #handleNext() {
        if (this.#isThumbnailVisible) {
          this.#isThumbnailVisible = false
        } else if (this.images?.length) {
          this.#currentIndex = (this.#currentIndex + 1) % this.images.length
        }
        this.#updateGallery()
      }

      /**
       * Handle previous button click
       * @private
       */
      #handlePrev() {
        if (!this.#isThumbnailVisible && this.images?.length) {
          this.#currentIndex = (this.#currentIndex - 1 + this.images.length) % this.images.length
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
        this.dotsContainer.innerHTML = ''
        this.images?.forEach((_, index) => {
          const dot = document.createElement('button')
          dot.className = 'gallery-dot w-[7px] h-[7px] rounded-full border-0 bg-gray-300 p-0 cursor-pointer'
          dot.setAttribute('aria-label', `Go to slide ${index + 1}`)
          this.#addEventListenerWithCleanup(dot, 'click', () => this.#handleDotClick(index))
          this.dotsContainer.appendChild(dot)
        })
      }

      /**
       * Handle dot click
       * @private
       */
      #handleDotClick(index) {
        this.#isThumbnailVisible = false
        this.#currentIndex = index
        this.#updateGallery()
      }
    },
  )
}
