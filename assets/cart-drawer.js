class CartDrawer extends HTMLElement {
  constructor() {
    super()

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close())
    this.setHeaderCartIconAccessibility()
  }

  setHeaderCartIconAccessibility() {
    const cartBubble = document.getElementById('cart-bubble')
    if (!cartBubble) return

    cartBubble.setAttribute('role', 'button')
    cartBubble.setAttribute('aria-haspopup', 'dialog')
    cartBubble.addEventListener('click', (event) => {
      event.preventDefault()
      this.open(cartBubble)
    })
    cartBubble.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault()
        this.open(cartBubble)
      }
    })
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy)

    document.querySelectorAll('quick-add-modal').forEach((modal) => {
      modal.classList.remove('is-active')
      modal.classList.add('hidden')
    })

    setTimeout(() => {
      this.classList.remove('opacity-0', 'invisible')
      this.classList.add('opacity-100', 'visible')

      const drawerPanel = document.getElementById('CartDrawer-Panel')
      if (drawerPanel) {
        drawerPanel.classList.remove('translate-x-full')
        drawerPanel.classList.add('translate-x-0')
      }

      this.initializeBonusSlider()
      this.initializeRecommendedProductsSlider()
      this.initializeFreeShippingSlider()
    })

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = document.getElementById('CartDrawer')
        const focusElement = document.getElementById('CartDrawer-Close') || containerToTrapFocusOn
        trapFocus(containerToTrapFocusOn, focusElement)
      },
      { once: true },
    )

    document.body.classList.add('overflow-hidden')
  }

  initializeBonusSlider() {
    const bonusItems = this.querySelectorAll('.drawer-bonus-item')
    const indicatorDots = this.querySelectorAll('.drawer-bonus-indicator-dot')

    if (!bonusItems.length || !indicatorDots.length) return

    let currentBonus = 0
    const bonusCount = bonusItems.length
    const interval = 3000

    if (this.bonusInterval) {
      clearInterval(this.bonusInterval)
    }

    const showBonus = (index) => {
      bonusItems.forEach((item, i) => {
        item.classList.toggle('active', i === index)
      })

      indicatorDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index)
      })
    }

    const nextBonus = () => {
      currentBonus = (currentBonus + 1) % bonusCount
      showBonus(currentBonus)
    }

    showBonus(currentBonus)
    this.bonusInterval = setInterval(nextBonus, interval)

    indicatorDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentBonus = index
        showBonus(currentBonus)
      })
    })
  }

  initializeRecommendedProductsSlider() {
    const slider = this.querySelector('.recommended-products-slider-items')
    if (!slider) return

    const shuffleProducts = () => {
      const items = Array.from(slider.querySelectorAll('.recommended-products-slider-item'))
      const shuffled = items.sort(() => Math.random() - 0.5)

      slider.innerHTML = ''
      shuffled.forEach((item) => slider.appendChild(item))
    }

    shuffleProducts()

    const sliderItems = this.querySelectorAll('.recommended-products-slider-item')
    const prevButton = this.querySelector('.recommended-products-arrow.prev')
    const nextButton = this.querySelector('.recommended-products-arrow.next')
    const indicators = this.querySelectorAll('.recommended-products-slider-indicators-dot')

    let currentIndex = 0
    const itemWidth = sliderItems[0].offsetWidth + parseFloat(getComputedStyle(slider).gap)

    const updateSliderPosition = () => {
      slider.style.transform = `translateX(${-(itemWidth * currentIndex)}px)`
    }

    const updateIndicators = () => {
      indicators.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex)
      })
    }

    const updateArrows = () => {
      prevButton?.classList.toggle('disabled', currentIndex === 0)
      nextButton?.classList.toggle('disabled', currentIndex === sliderItems.length - 1)
    }

    const moveNext = () => {
      if (currentIndex < sliderItems.length - 1) {
        currentIndex++
        updateSliderPosition()
        updateIndicators()
        updateArrows()
      }
    }

    const movePrev = () => {
      if (currentIndex > 0) {
        currentIndex--
        updateSliderPosition()
        updateIndicators()
        updateArrows()
      }
    }

    prevButton?.addEventListener('click', movePrev)
    nextButton?.addEventListener('click', moveNext)

    indicators.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentIndex = index
        updateSliderPosition()
        updateIndicators()
        updateArrows()
      })
    })

    // Add swipe functionality
    let touchStartX = 0
    let touchEndX = 0

    slider.addEventListener('touchstart', (event) => {
      touchStartX = event.touches[0].clientX
    })

    slider.addEventListener('touchmove', (event) => {
      touchEndX = event.touches[0].clientX
    })

    slider.addEventListener('touchend', () => {
      const swipeDistance = touchEndX - touchStartX
      if (swipeDistance > 50) {
        movePrev() // Swipe right to move to the previous slide
      } else if (swipeDistance < -50) {
        moveNext() // Swipe left to move to the next slide
      }
    })

    updateSliderPosition()
    updateIndicators()
    updateArrows()
  }

  initializeFreeShippingSlider() {
    const slider = this.querySelector('.free-shipping-slider-items')
    if (!slider) return

    const shuffleProducts = () => {
      const items = Array.from(slider.querySelectorAll('.free-shipping-slider-item'))
      const shuffled = items.sort(() => Math.random() - 0.5)

      slider.innerHTML = ''
      shuffled.forEach((item) => slider.appendChild(item))
    }

    shuffleProducts()

    const sliderItems = this.querySelectorAll('.free-shipping-slider-item')
    const prevButton = this.querySelector('.free-shipping-slider-arrow.prev')
    const nextButton = this.querySelector('.free-shipping-slider-arrow.next')
    const indicators = this.querySelectorAll('.free-shipping-slider-indicators-dot')

    let currentIndex = 0
    const itemWidth = sliderItems[0].offsetWidth + parseFloat(getComputedStyle(slider).gap)

    const updateSliderPosition = () => {
      slider.style.transform = `translateX(${-(itemWidth * currentIndex)}px)`
    }

    const updateIndicators = () => {
      indicators.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex)
      })
    }

    const updateArrows = () => {
      prevButton?.classList.toggle('disabled', currentIndex === 0)
      nextButton?.classList.toggle('disabled', currentIndex === sliderItems.length - 1)
    }

    const moveNext = () => {
      if (currentIndex < sliderItems.length - 1) {
        currentIndex++
        updateSliderPosition()
        updateIndicators()
        updateArrows()
      }
    }

    const movePrev = () => {
      if (currentIndex > 0) {
        currentIndex--
        updateSliderPosition()
        updateIndicators()
        updateArrows()
      }
    }

    prevButton?.addEventListener('click', movePrev)
    nextButton?.addEventListener('click', moveNext)

    indicators.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentIndex = index
        updateSliderPosition()
        updateIndicators()
        updateArrows()
      })
    })

    // Add swipe functionality
    let touchStartX = 0
    let touchEndX = 0

    slider.addEventListener('touchstart', (event) => {
      touchStartX = event.touches[0].clientX
    })

    slider.addEventListener('touchmove', (event) => {
      touchEndX = event.touches[0].clientX
    })

    slider.addEventListener('touchend', () => {
      const swipeDistance = touchEndX - touchStartX
      if (swipeDistance > 50) {
        movePrev() // Swipe right to move to the previous slide
      } else if (swipeDistance < -50) {
        moveNext() // Swipe left to move to the next slide
      }
    })

    updateSliderPosition()
    updateIndicators()
    updateArrows()
  }

  close() {
    this.classList.remove('opacity-100', 'visible')
    this.classList.add('opacity-0', 'invisible')

    const drawerPanel = document.getElementById('CartDrawer-Panel')
    if (drawerPanel) {
      drawerPanel.classList.remove('translate-x-0')
      drawerPanel.classList.add('translate-x-full')
    }

    removeTrapFocus(this.activeElement)
    document.body.classList.remove('overflow-hidden')

    const quickAddModals = document.querySelectorAll('quick-add-modal')
    quickAddModals.forEach((modal) => {
      modal.classList.remove('hidden')
    })

    if (this.bonusInterval) {
      clearInterval(this.bonusInterval)
      this.bonusInterval = null
    }
  }

  renderContents(parsedState) {
    this.productId = parsedState.id
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id)

      if (!sectionElement) return
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector)
    })

    setTimeout(() => {
      this.open()
    })
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-bubble',
      },
    ]
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector)
  }

  setActiveElement(element) {
    this.activeElement = element
  }
}

customElements.define('cart-drawer', CartDrawer)

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'cart-bubble',
        section: 'cart-bubble',
        selector: '.shopify-section',
      },
    ]
  }

  // Override enableLoading to show the cart drawer spinner
  enableLoading(line) {
    super.enableLoading(line)
    this.showLoading()
  }

  // Override disableLoading to hide the cart drawer spinner
  disableLoading(line) {
    super.disableLoading(line)
    this.hideLoading()
  }

  // Override updateQuantity to ensure loading states are properly managed
  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line)
    const result = super.updateQuantity(line, quantity, name, variantId)
    if (result && typeof result.catch === 'function') {
      return result.catch((error) => {
        console.error('Error updating cart:', error)
        this.disableLoading(line)
      })
    }
    return result
  }

  showLoading() {
    const spinner = document.getElementById('CartDrawer-LoadingSpinner')
    const spinnerInner = document.getElementById('CartDrawer-LoadingSpinnerInner')
    spinner?.classList.remove('hidden')
    spinnerInner?.classList.remove('hidden')
  }

  hideLoading() {
    const spinner = document.getElementById('CartDrawer-LoadingSpinner')
    const spinnerInner = document.getElementById('CartDrawer-LoadingSpinnerInner')
    spinner?.classList.add('hidden')
    spinnerInner?.classList.add('hidden')
  }
}

customElements.define('cart-drawer-items', CartDrawerItems)

class FreeGiftComponent extends HTMLElement {
  constructor() {
    super()
    this.currentLevel = this.getAttribute('current_level')
    this.isGiftAdded = this.getAttribute('_is-gift') === 'true'
    this.isPremiumAdded = this.getAttribute('_is-premium') === 'true'
    this.isGiftAvailable = this.getAttribute('isgiftavailable') === 'true'
    this.isPremiumAvailable = this.getAttribute('ispremiumavailable') === 'true'
    this.level2Threshold = parseInt(this.getAttribute('level_2_threshold'), 10)
    this.level3Threshold = parseInt(this.getAttribute('level_3_threshold'), 10)
    this.freeGift = this.getAttribute('free_gift')
    this.premiumGift1 = this.getAttribute('premium_gift_1')
  }
  connectedCallback() {
    this.checkCartState()
  }
  async checkCartState() {
    const cartTotal = parseInt(this.getAttribute('cart_total'), 10)

    const shouldFetchCart =
      (cartTotal < this.level2Threshold && this.isGiftAdded) || // Check if we might need to remove free gifts
      (cartTotal < this.level3Threshold && this.isPremiumAdded) // Check if we might need to remove premium gifts

    let cartData = null
    const itemsToAdd = []
    const itemsToRemove = []

    // Add free gift if conditions are met
    if (cartTotal >= this.level2Threshold && !this.isGiftAdded && this.isGiftAvailable && this.shouldAddGift('gift')) {
      itemsToAdd.push({
        id: this.freeGift,
        quantity: 1,
        properties: { _is_gift: true },
      })
    }

    // Add premium gift if conditions are met
    if (cartTotal >= this.level3Threshold && !this.isPremiumAdded && this.isPremiumAvailable && this.shouldAddGift('premium')) {
      itemsToAdd.push({
        id: this.premiumGift1,
        quantity: 1,
        properties: { _is_premium: true },
      })
    }

    // Fetch cart data only if needed
    if (shouldFetchCart) {
      cartData = await this.fetchUpdatedCart()
      if (!cartData) return

      // Remove free gift if conditions are not met
      if (cartTotal < this.level2Threshold && this.isGiftAdded) {
        const freeGiftItem = cartData.items.find((item) => item.properties?._is_gift)
        if (freeGiftItem) {
          itemsToRemove.push({ id: freeGiftItem.key, quantity: 0 })
        }
      }

      // Remove premium gift if conditions are not met
      if (cartTotal < this.level3Threshold && this.isPremiumAdded) {
        const premiumGiftItems = cartData.items.filter((item) => item.properties?._is_premium)
        premiumGiftItems.forEach((premiumGiftItem) => {
          itemsToRemove.push({ id: premiumGiftItem.key, quantity: 0 })
        })
      }
    }

    // Process additions
    if (itemsToAdd.length > 0) {
      await this.addGifts(itemsToAdd)
      await this.updateCartDrawer()
    }

    // Process removals one by one
    let index = 0
    for (const item of itemsToRemove) {
      await this.removeGift(item)
      if (index === itemsToRemove.length - 1) {
        await this.updateCartDrawer()
      }
      index++
    }
  }
  shouldAddGift(type) {
    const timestamp = localStorage.getItem(type)
    if (timestamp) {
      const storedTime = new Date(timestamp)
      const currentTime = new Date()
      const timeDifference = (currentTime - storedTime) / 1000 / 60
      if (timeDifference < 30) {
        return false
      }
    }
    return true
  }
  async addGifts(items) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items }),
      })

      if (!response.ok) throw new Error('Failed to add gifts to the cart.')
      document.dispatchEvent(new Event('cart:added'))
    } catch (error) {
      console.error('Error adding gifts:', error)
    }
  }

  async removeGift(item) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to remove gift from the cart. Response: ${errorText}`)
      }
    } catch (error) {
      console.error('Error removing gift:', error)
    }
  }

  async fetchUpdatedCart() {
    try {
      const response = await fetch('/cart.js')
      if (!response.ok) throw new Error('Failed to fetch updated cart.')

      return await response.json()
    } catch (error) {
      console.error('Error fetching updated cart:', error)
      return null
    }
  }
  async fetchCartSection() {
    try {
      const response = await fetch('/?section_id=cart-drawer')
      if (!response.ok) throw new Error('Failed to fetch updated cart.')

      return await response.text()
    } catch (error) {
      console.error('Error fetching updated cart:', error)
      return null
    }
  }

  async updateCartDrawer() {
    const updatedCartHTML = await this.fetchCartSection()
    if (!updatedCartHTML) return

    const parser = new DOMParser()
    const updatedDocument = parser.parseFromString(updatedCartHTML, 'text/html')

    const cartDrawer = document.getElementById('CartDrawer-Container')
    if (!cartDrawer) {
      console.error('Cart drawer element not found.')
      return
    }

    const updatedCartItems = updatedDocument.getElementById('CartDrawer-Items')
    const currentCartItems = document.getElementById('CartDrawer-Items')
    if (updatedCartItems && currentCartItems) {
      currentCartItems.innerHTML = updatedCartItems.innerHTML
    }
    if (!updatedCartItems && currentCartItems) {
      currentCartItems.innerHTML = ''
    }
  }
}

customElements.define('free-gift', FreeGiftComponent)

class GiftRemoveButton extends HTMLElement {
  constructor() {
    super()
    this.type = this.dataset.type // Can be 'premium' or 'gift'
    this.addEventListener('click', (event) => {
      event.preventDefault()
      this.storeTimestamp() // Store timestamp before removing item
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items')
      cartItems.updateQuantity(this.dataset.index, 0)
    })
  }

  storeTimestamp() {
    if (this.type) {
      const timestamp = new Date().toISOString()
      localStorage.setItem(this.type, timestamp)
    } else {
      console.error('Type is not defined for GiftRemoveButton')
    }
  }
}

customElements.define('gift-remove-button', GiftRemoveButton)
