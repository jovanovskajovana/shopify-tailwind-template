function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe",
    ),
  )
}

class SectionId {
  static #separator = '__'

  // For a qualified section id (e.g. 'template--22224696705326__main'), return just the section id (e.g. 'template--22224696705326')
  static parseId(qualifiedSectionId) {
    return qualifiedSectionId.split(SectionId.#separator)[0]
  }

  // For a qualified section id (e.g. 'template--22224696705326__main'), return just the section name (e.g. 'main')
  static parseSectionName(qualifiedSectionId) {
    return qualifiedSectionId.split(SectionId.#separator)[1]
  }

  // For a section id (e.g. 'template--22224696705326') and a section name (e.g. 'recommended-products'), return a qualified section id (e.g. 'template--22224696705326__recommended-products')
  static getIdForSection(sectionId, sectionName) {
    return `${sectionId}${SectionId.#separator}${sectionName}`
  }
}

class HTMLUpdateUtility {
  /**
   * Used to swap an HTML node with a new node.
   * The new node is inserted as a previous sibling to the old node, the old node is hidden, and then the old node is removed.
   *
   * The function currently uses a double buffer approach, but this should be replaced by a view transition once it is more widely supported https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
   */
  static viewTransition(oldNode, newContent, preProcessCallbacks = [], postProcessCallbacks = []) {
    preProcessCallbacks?.forEach((callback) => callback(newContent))

    const newNodeWrapper = document.createElement('div')
    HTMLUpdateUtility.setInnerHTML(newNodeWrapper, newContent.outerHTML)
    const newNode = newNodeWrapper.firstChild

    // Deduplicate IDs
    const uniqueKey = Date.now()
    oldNode.querySelectorAll('[id], [form]').forEach((element) => {
      element.id && (element.id = `${element.id}-${uniqueKey}`)
      element.form && element.setAttribute('form', `${element.form.getAttribute('id')}-${uniqueKey}`)
    })

    oldNode.parentNode.insertBefore(newNode, oldNode)
    oldNode.style.display = 'none'

    postProcessCallbacks?.forEach((callback) => callback(newNode))

    setTimeout(() => oldNode.remove(), 500)
  }

  // Sets inner HTML and reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
  static setInnerHTML(element, html) {
    element.innerHTML = html
    element.querySelectorAll('script').forEach((oldScriptTag) => {
      const newScriptTag = document.createElement('script')
      Array.from(oldScriptTag.attributes).forEach((attribute) => {
        newScriptTag.setAttribute(attribute.name, attribute.value)
      })
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML))
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag)
    })
  }
}

const trapFocusHandlers = {}

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container)
  var first = elements[0]
  var last = elements[elements.length - 1]

  removeTrapFocus()

  trapFocusHandlers.focusin = (event) => {
    if (event.target !== container && event.target !== last && event.target !== first) return

    document.addEventListener('keydown', trapFocusHandlers.keydown)
  }

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown)
  }

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault()
      first.focus()
    }

    //  On the first focusable element and tab backward, focus the last element.
    if ((event.target === container || event.target === first) && event.shiftKey) {
      event.preventDefault()
      last.focus()
    }
  }

  document.addEventListener('focusout', trapFocusHandlers.focusout)
  document.addEventListener('focusin', trapFocusHandlers.focusin)

  elementToFocus.focus()

  if (elementToFocus.tagName === 'INPUT' && ['search', 'text', 'email', 'url'].includes(elementToFocus.type) && elementToFocus.value) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length)
  }
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(':focus-visible')
} catch (e) {
  focusVisiblePolyfill()
}

function focusVisiblePolyfill() {
  const navKeys = [
    'ARROWUP',
    'ARROWDOWN',
    'ARROWLEFT',
    'ARROWRIGHT',
    'TAB',
    'ENTER',
    'SPACE',
    'ESCAPE',
    'HOME',
    'END',
    'PAGEUP',
    'PAGEDOWN',
  ]
  let currentFocusedElement = null
  let mouseClick = null

  window.addEventListener('keydown', (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false
    }
  })

  window.addEventListener('mousedown', (event) => {
    mouseClick = true
  })

  window.addEventListener(
    'focus',
    () => {
      if (currentFocusedElement) currentFocusedElement.classList.remove('focused')

      if (mouseClick) return

      currentFocusedElement = document.activeElement
      currentFocusedElement.classList.add('focused')
    },
    true,
  )
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*')
  })
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*')
  })
  document.querySelectorAll('video').forEach((video) => video.pause())
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin)
  document.removeEventListener('focusout', trapFocusHandlers.focusout)
  document.removeEventListener('keydown', trapFocusHandlers.keydown)

  if (elementToFocus) elementToFocus.focus()
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return

  const openDetailsElement = event.target.closest('details[open]')
  if (!openDetailsElement) return

  const summaryElement = openDetailsElement.querySelector('summary')
  openDetailsElement.removeAttribute('open')
  summaryElement.setAttribute('aria-expanded', false)
  summaryElement.focus()
}

class QuantityInput extends HTMLElement {
  constructor() {
    super()
    this.changeEvent = new Event('change', { bubbles: true })
    this.querySelectorAll('button').forEach((button) => button.addEventListener('click', this.onButtonClick.bind(this)))
  }

  quantityUpdateUnsubscriber = undefined

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber()
    }
  }
}

customElements.define('quantity-input', QuantityInput)

function debounce(fn, wait) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn.apply(this, args), wait)
  }
}

function throttle(fn, delay) {
  let lastCall = 0
  return function (...args) {
    const now = new Date().getTime()
    if (now - lastCall < delay) {
      return
    }
    lastCall = now
    return fn(...args)
  }
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
  }
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {}
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments)
  }
}

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i]
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i
      return i
    }
  }
}

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on' + eventName, callback)
}

Shopify.postLink = function (path, options) {
  options = options || {}
  var method = options['method'] || 'post'
  var params = options['parameters'] || {}

  var form = document.createElement('form')
  form.setAttribute('method', method)
  form.setAttribute('action', path)

  for (var key in params) {
    var hiddenField = document.createElement('input')
    hiddenField.setAttribute('type', 'hidden')
    hiddenField.setAttribute('name', key)
    hiddenField.setAttribute('value', params[key])
    form.appendChild(hiddenField)
  }
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid)
  this.provinceEl = document.getElementById(province_domid)
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid)

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this))

  this.initCountry()
  this.initProvince()
}

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default')
    Shopify.setSelectorByValue(this.countryEl, value)
    this.countryHandler()
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default')
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value)
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex]
    var raw = opt.getAttribute('data-provinces')
    var provinces = JSON.parse(raw)

    this.clearOptions(this.provinceEl)
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none'
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option')
        opt.value = provinces[i][0]
        opt.innerHTML = provinces[i][1]
        this.provinceEl.appendChild(opt)
      }

      this.provinceContainer.style.display = ''
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild)
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option')
      opt.value = values[i]
      opt.innerHTML = values[i]
      selector.appendChild(opt)
    }
  },
}

class ModalDialog extends HTMLElement {
  constructor() {
    super()
    const modalClose = this.querySelector('[id^="ModalClose-"]')
    const overlayClose = this.querySelector('[id^="OverlayClose-"]')
    if (modalClose) {
      modalClose.addEventListener('click', this.fadeOut.bind(this))
    }
    if (overlayClose) {
      overlayClose.addEventListener('click', this.fadeOut.bind(this))
    }
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE' && this.hasAttribute('open')) {
        this.fadeOut()
      }
    })
  }

  connectedCallback() {
    if (this.moved) return
    this.moved = true
    const section = this.closest('.shopify-section')
    if (section) {
      this.dataset.section = section.id.replace('shopify-section-', '')
    }
    document.body.appendChild(this)
  }

  show(opener) {
    this.openedBy = opener
    this.setAttribute('open', '')
    this.classList.add('is-active')

    requestAnimationFrame(() => {
      document.body.classList.add('overflow-hidden')

      const popup = this.querySelector('.template-popup')
      if (popup) popup.loadContent()

      const dialog = this.querySelector('[role="dialog"]')
      if (dialog) trapFocus(this, dialog)
      if (window.pauseAllMedia) window.pauseAllMedia()
    })
  }

  fadeOut() {
    this.classList.remove('is-active')
    setTimeout(() => this.hide(), 200)
  }

  hide() {
    this.removeAttribute('open')
    document.body.classList.remove('overflow-hidden')
    document.body.dispatchEvent(new CustomEvent('modalClosed'))
    if (this.openedBy) removeTrapFocus(this.openedBy)
    if (window.pauseAllMedia) window.pauseAllMedia()
  }
}
customElements.define('modal-dialog', ModalDialog)

class ModalOpener extends HTMLElement {
  constructor() {
    super()

    const button = this.querySelector('button')

    if (!button) return
    button.addEventListener('click', (e) => {
      e.preventDefault()
      const modal = document.querySelector(this.getAttribute('data-modal'))
      if (modal) modal.show(button)
    })
  }
}
customElements.define('modal-opener', ModalOpener)

class SliderComponent extends HTMLElement {
  constructor() {
    super()
    this.slider = this.querySelector('[id^="Slider-"]')
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]')
    this.enableSliderLooping = false
    this.currentPageElement = this.querySelector('.slider-counter--current')
    this.pageTotalElement = this.querySelector('.slider-counter--total')
    this.prevButton = this.querySelector('button[name="previous"]')
    this.nextButton = this.querySelector('button[name="next"]')

    if (!this.slider || !this.nextButton) return

    this.initPages()
    const resizeObserver = new ResizeObserver((entries) => this.initPages())
    resizeObserver.observe(this.slider)

    this.slider.addEventListener('scroll', this.update.bind(this))
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this))
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this))
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter((element) => element.clientWidth > 0)
    if (this.sliderItemsToShow.length < 2) return
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft
    this.slidesPerPage = Math.floor((this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset)
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1
    this.update()
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]')
    this.initPages()
  }

  update() {
    // Temporarily prevents unneeded updates resulting from variant changes
    // This should be refactored as part of https://github.com/Shopify/dawn/issues/2057
    if (!this.slider || !this.nextButton) return

    const previousPage = this.currentPage
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage
      this.pageTotalElement.textContent = this.totalPages
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(
        new CustomEvent('slideChanged', {
          detail: {
            currentPage: this.currentPage,
            currentElement: this.sliderItemsToShow[this.currentPage - 1],
          },
        }),
      )
    }

    if (this.enableSliderLooping) return

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled')
    } else {
      this.prevButton.removeAttribute('disabled')
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled')
    } else {
      this.nextButton.removeAttribute('disabled')
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset
    return element.offsetLeft + element.clientWidth <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft
  }

  onButtonClick(event) {
    event.preventDefault()
    const step = event.currentTarget.dataset.step || 1
    this.slideScrollPosition =
      event.currentTarget.name === 'next'
        ? this.slider.scrollLeft + step * this.sliderItemOffset
        : this.slider.scrollLeft - step * this.sliderItemOffset
    this.setSlidePosition(this.slideScrollPosition)
  }

  setSlidePosition(position) {
    this.slider.scrollTo({
      left: position,
    })
  }
}

customElements.define('slider-component', SliderComponent)

class VariantSelects extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.addEventListener('change', (event) => {
      const target = this.getInputForEventTarget(event.target)

      publish(PUB_SUB_EVENTS.optionValueSelectionChange, {
        data: {
          event,
          target,
          selectedOptionValues: this.selectedOptionValues,
        },
      })
    })
  }

  getInputForEventTarget(target) {
    return target.tagName === 'SELECT' ? target.selectedOptions[0] : target
  }

  get selectedOptionValues() {
    return Array.from(this.querySelectorAll('select option[selected], fieldset input:checked')).map(({ dataset }) => dataset.optionValueId)
  }
}

customElements.define('variant-selects', VariantSelects)

class AccountIcon extends HTMLElement {
  constructor() {
    super()

    this.icon = this.querySelector('.icon')
  }

  connectedCallback() {
    document.addEventListener('storefront:signincompleted', this.handleStorefrontSignInCompleted.bind(this))
  }

  handleStorefrontSignInCompleted(event) {
    if (event?.detail?.avatar) {
      this.icon?.replaceWith(event.detail.avatar.cloneNode())
    }
  }
}

customElements.define('account-icon', AccountIcon)
