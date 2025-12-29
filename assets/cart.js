class CartRemoveButton extends HTMLElement {
  constructor() {
    super()

    this.addEventListener('click', (event) => {
      event.preventDefault()
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items')
      cartItems.updateQuantity(this.dataset.index, 0)
    })
  }
}

customElements.define('cart-remove-button', CartRemoveButton)

class CartItems extends HTMLElement {
  constructor() {
    super()
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus')

    const debouncedOnChange = debounce((event) => {
      this.onChange(event)
    }, ON_CHANGE_DEBOUNCE_TIMER)

    this.addEventListener('change', debouncedOnChange.bind(this))
  }

  cartUpdateUnsubscriber = undefined

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items' && this.tagName !== 'CART-DRAWER-ITEMS') {
        return
      }
      this.onCartUpdate()
    })
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber()
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`)
    input.value = input.getAttribute('value')
    this.isEnterPressed = false
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message)
    event.target.reportValidity()
    this.resetQuantityInput(index)
    event.target.select()
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value)
    const index = event.target.dataset.index
    let message = ''

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min)
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max)
    }

    if (message) {
      this.setValidity(event, index, message)
    } else {
      event.target.setCustomValidity('')
      event.target.reportValidity()
      this.updateQuantity(index, inputValue, document.activeElement.getAttribute('name'), event.target.dataset.quantityVariantId)
    }
  }

  onChange(event) {
    this.validateQuantity(event)
  }

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      return fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html')
          const selectors = ['#CartDrawer-Items', '#CartDrawer-Empty']
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector)
            const sourceElement = html.querySelector(selector)
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement)
            } else if (!targetElement && sourceElement) {
              const cartDrawerPanel = document.getElementById('CartDrawer-Panel')
              const cartDrawerItems = document.getElementById('CartDrawer-Items')
              if (cartDrawerPanel && cartDrawerItems && selector === '#CartDrawer-Empty') {
                cartDrawerPanel.insertBefore(sourceElement, cartDrawerItems)
              }
            } else if (targetElement && !sourceElement && selector === '#CartDrawer-Empty') {
              targetElement.remove()
            }
          }
          const targetTitleCount = document.getElementById('CartDrawer-TitleCount')
          const sourceTitleCount = html.querySelector('#CartDrawer-TitleCount')
          if (targetTitleCount && sourceTitleCount) {
            targetTitleCount.textContent = sourceTitleCount.textContent
          }
          const cartDrawer = document.getElementById('CartDrawer-Container')
          if (cartDrawer) {
            cartDrawer.initializeBonusSlider()
            cartDrawer.initializeRecommendedProductsSlider()
            cartDrawer.initializeFreeShippingSlider()
          }
        })
        .catch((e) => {
          console.error('Error updating cart drawer:', e)
          const errors = document.getElementById('CartDrawer-CartErrors')
          if (errors) {
            errors.textContent = window.cartStrings.error
          }
        })
    } else {
      return fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html')
          const sourceQty = html.querySelector('cart-items')
          if (sourceQty) {
            this.innerHTML = sourceQty.innerHTML
          }
        })
        .catch((e) => {
          console.error(e)
        })
    }
  }

  getSectionsToRender() {
    const sections = [
      {
        id: 'cart-bubble',
        section: 'cart-bubble',
        selector: '.shopify-section',
      },
    ]

    const mainCartItems = document.getElementById('main-cart-items')
    if (mainCartItems) {
      sections.push({
        id: 'main-cart-items',
        section: mainCartItems.dataset.id,
        selector: '.js-contents',
      })
    }

    const cartLiveRegion = document.getElementById('cart-live-region-text')
    if (cartLiveRegion) {
      sections.push({
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      })
    }

    const mainCartFooter = document.getElementById('main-cart-footer')
    if (mainCartFooter) {
      sections.push({
        id: 'main-cart-footer',
        section: mainCartFooter.dataset.id,
        selector: '.js-contents',
      })
    }

    return sections
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line)

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    })

    return fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text()
      })
      .then((state) => {
        const parsedState = JSON.parse(state)
        const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`)
        const items = document.querySelectorAll('.cart-item')

        if (parsedState.errors) {
          if (quantityElement) {
            quantityElement.value = quantityElement.getAttribute('value')
          }
          this.updateLiveRegions(line, parsedState.errors)
          return
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0)
        const cartDrawerWrapper = document.getElementById('CartDrawer-Container')
        const cartFooter = document.getElementById('main-cart-footer')

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0)
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0)

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id)?.querySelector(section.selector) || document.getElementById(section.id)
          if (!elementToReplace) return
          elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector)
        })

        const cartDrawer = document.getElementById('CartDrawer-Container')
        if (cartDrawer) {
          cartDrawer.initializeBonusSlider()
          cartDrawer.initializeRecommendedProductsSlider()
          cartDrawer.initializeFreeShippingSlider()
        }

        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined
        let message = ''
        if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined' && parsedState.item_count > 0) {
            message = window.cartStrings.error
          } else if (typeof updatedValue !== 'undefined') {
            message = window.cartStrings.quantityError.replace('[quantity]', updatedValue)
          }
        }
        this.updateLiveRegions(line, message)

        const lineItem = document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`)
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
            : lineItem.querySelector(`[name="${name}"]`).focus()
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          const emptyDrawer = document.getElementById('CartDrawer-Empty')
          const cartBubble = document.getElementById('cart-bubble')
          if (emptyDrawer && cartBubble) {
            trapFocus(emptyDrawer, cartBubble)
          }
        }

        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId })
      })
      .catch(() => {
        this.querySelectorAll('.loading-spinner').forEach((overlay) => overlay.classList.add('hidden'))
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors')
        if (errors) {
          errors.textContent = window.cartStrings.error
        }
      })
      .finally(() => {
        this.disableLoading(line)
      })
  }

  updateLiveRegions(line, message) {
    const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`)
    if (lineItemError) {
      const errorText =
        document.getElementById(`Line-item-error-text-${line}`) || document.getElementById(`CartDrawer-LineItemErrorText-${line}`)
      if (errorText) errorText.textContent = message
    }

    if (this.lineItemStatusElement) {
      this.lineItemStatusElement.setAttribute('aria-hidden', true)
    }

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText')
    if (cartStatus) {
      cartStatus.setAttribute('aria-hidden', false)
      setTimeout(() => {
        cartStatus.setAttribute('aria-hidden', true)
      }, 1000)
    }
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems')
    mainCartItems.classList.add('cart__items--disabled')

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-spinner`)
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-spinner`)

    ;[...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'))

    document.activeElement.blur()
    this.lineItemStatusElement.setAttribute('aria-hidden', false)
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems')
    mainCartItems.classList.remove('cart__items--disabled')

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-spinner`)
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-spinner`)

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'))
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'))
  }
}

customElements.define('cart-items', CartItems)

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super()

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value })
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
          }, ON_CHANGE_DEBOUNCE_TIMER),
        )
      }
    },
  )
}
