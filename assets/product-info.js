if (!customElements.get('product-info')) {
  customElements.define(
    'product-info',
    class ProductInfo extends HTMLElement {
      quantityInput = undefined
      quantityForm = undefined
      onVariantChangeUnsubscriber = undefined
      cartUpdateUnsubscriber = undefined
      abortController = undefined
      pendingRequestUrl = null
      preProcessHtmlCallbacks = []
      postProcessHtmlCallbacks = []

      constructor() {
        super()

        this.quantityInput = this.querySelector('input[name="quantity"], .quantity-input')
      }

      connectedCallback() {
        this.initializeProductSwapUtility()

        this.onVariantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.optionValueSelectionChange, this.handleOptionValueChange.bind(this))

        this.initQuantityHandlers()
        this.dispatchEvent(new CustomEvent('product-info:loaded', { bubbles: true }))
      }

      addPreProcessCallback(callback) {
        this.preProcessHtmlCallbacks.push(callback)
      }

      initQuantityHandlers() {
        if (!this.quantityInput) return
        this.setQuantityBoundries()
      }

      disconnectedCallback() {
        this.onVariantChangeUnsubscriber()
        this.cartUpdateUnsubscriber?.()
      }

      initializeProductSwapUtility() {
        this.postProcessHtmlCallbacks.push((newNode) => {
          window?.Shopify?.PaymentButton?.init()
          window?.ProductModel?.loadShopifyXR()
        })
      }

      handleOptionValueChange({ data: { event, target, selectedOptionValues } }) {
        if (!this.contains(event.target)) return

        this.resetProductFormState()

        const productUrl = target.dataset.productUrl || this.pendingRequestUrl || this.dataset.url
        this.pendingRequestUrl = productUrl
        const shouldSwapProduct = this.dataset.url !== productUrl
        const shouldFetchFullPage = this.dataset.updateUrl === 'true' && shouldSwapProduct

        this.renderProductInfo({
          requestUrl: this.buildRequestUrlWithParams(productUrl, selectedOptionValues, shouldFetchFullPage),
          targetId: target.id,
          callback: shouldSwapProduct ? this.handleSwapProduct(productUrl, shouldFetchFullPage) : this.handleUpdateProductInfo(productUrl),
        })
      }

      resetProductFormState() {
        const productForm = this.productForm
        productForm?.toggleSubmitButton(true)
        productForm?.handleErrorMessage()
      }

      handleSwapProduct(productUrl, updateFullPage) {
        return (html) => {
          const selector = updateFullPage ? "product-info[id^='MainProduct']" : 'product-info'
          const variant = this.getSelectedVariant(html.querySelector(selector))
          this.updateURL(productUrl, variant?.id)

          if (updateFullPage) {
            document.querySelector('head title').innerHTML = html.querySelector('head title').innerHTML

            HTMLUpdateUtility.viewTransition(
              document.querySelector('main'),
              html.querySelector('main'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks,
            )
          } else {
            HTMLUpdateUtility.viewTransition(
              this,
              html.querySelector('product-info'),
              this.preProcessHtmlCallbacks,
              this.postProcessHtmlCallbacks,
            )
          }
        }
      }

      renderProductInfo({ requestUrl, targetId, callback }) {
        this.abortController?.abort()
        this.abortController = new AbortController()

        fetch(requestUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((responseText) => {
            this.pendingRequestUrl = null
            const html = new DOMParser().parseFromString(responseText, 'text/html')
            callback(html)
          })
          .then(() => {
            // Set focus to last clicked option value
            document.querySelector(`#${targetId}`)?.focus()
          })
          .catch((error) => {
            if (error.name === 'AbortError') {
              console.error('Fetch aborted by user')
            } else {
              console.error(error)
            }
          })
      }

      getSelectedVariant(productInfoNode) {
        const variantInput = productInfoNode?.querySelector('input[name="id"]')
        if (!variantInput) return null
        const variantId = variantInput.value
        if (!variantId) return null
        return { id: parseInt(variantId) }
      }

      buildRequestUrlWithParams(url, optionValues, shouldFetchFullPage = false) {
        const params = []

        !shouldFetchFullPage && params.push(`section_id=${this.sectionId}`)

        if (optionValues.length) {
          params.push(`option_values=${optionValues.join(',')}`)
        }

        return `${url}?${params.join('&')}`
      }

      updateOptionValues(html) {
        const selects = html.querySelectorAll('select[name^="options"]')
        if (!selects.length || !this.variantSelectors) return

        selects.forEach((select) => {
          const currentSelect = this.querySelector(`select[name="${select.name}"]`)
          if (currentSelect) {
            currentSelect.innerHTML = select.innerHTML
            currentSelect.value = select.value
          }
        })
      }

      handleUpdateProductInfo(productUrl) {
        return (html) => {
          const variant = this.getSelectedVariant(html)

          this.updateOptionValues(html)
          this.updateURL(productUrl, variant?.id)
          this.updateVariantInputs(variant?.id)

          if (!variant) {
            this.setUnavailable()
            return
          }

          this.updateMedia(html, variant?.featured_media?.id)

          const updateSourceFromDestination = (id, shouldHide = (source) => false) => {
            const source = html.getElementById(`${id}-${this.sectionId}`)
            const destination = this.querySelector(`#${id}-${this.dataset.section}`)
            if (source && destination) {
              destination.innerHTML = source.innerHTML
              destination.classList.toggle('hidden', shouldHide(source))
            }
          }

          updateSourceFromDestination('price')

          this.productForm?.toggleSubmitButton(
            html.getElementById(`ProductSubmitButton-${this.sectionId}`)?.hasAttribute('disabled') ?? true,
            window.variantStrings.soldOut,
          )

          publish(PUB_SUB_EVENTS.variantChange, {
            data: {
              sectionId: this.sectionId,
              html,
              variant,
            },
          })
        }
      }

      updateVariantInputs(variantId) {
        this.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`).forEach(
          (productForm) => {
            const input = productForm.querySelector('input[name="id"]')
            input.value = variantId ?? ''
            input.dispatchEvent(new Event('change', { bubbles: true }))
          },
        )
      }

      updateURL(url, variantId) {
        if (this.dataset.updateUrl === 'false') return
        window.history.replaceState({}, '', `${url}${variantId ? `?variant=${variantId}` : ''}`)
      }

      setUnavailable() {
        this.productForm?.toggleSubmitButton(true, window.variantStrings.unavailable)

        const priceElement = this.querySelector(`#price-${this.dataset.section}`)
        if (priceElement) priceElement.classList.add('hidden')
      }

      updateMedia(html, variantFeaturedMediaId) {
        if (!variantFeaturedMediaId) return

        const mediaGallerySource = this.querySelector('media-gallery ul')
        const mediaGalleryDestination = html.querySelector(`media-gallery ul`)

        const refreshSourceData = () => {
          const mediaGallerySourceItems = Array.from(mediaGallerySource.querySelectorAll('li[data-media-id]'))
          const sourceSet = new Set(mediaGallerySourceItems.map((item) => item.dataset.mediaId))
          const sourceMap = new Map(mediaGallerySourceItems.map((item, index) => [item.dataset.mediaId, { item, index }]))
          return [mediaGallerySourceItems, sourceSet, sourceMap]
        }

        if (mediaGallerySource && mediaGalleryDestination) {
          let [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData()
          const mediaGalleryDestinationItems = Array.from(mediaGalleryDestination.querySelectorAll('li[data-media-id]'))
          const destinationSet = new Set(mediaGalleryDestinationItems.map(({ dataset }) => dataset.mediaId))
          let shouldRefresh = false

          // Add items from new data not present in DOM
          for (let i = mediaGalleryDestinationItems.length - 1; i >= 0; i--) {
            if (!sourceSet.has(mediaGalleryDestinationItems[i].dataset.mediaId)) {
              mediaGallerySource.prepend(mediaGalleryDestinationItems[i])
              shouldRefresh = true
            }
          }

          // Remove items from DOM not present in new data
          for (let i = 0; i < mediaGallerySourceItems.length; i++) {
            if (!destinationSet.has(mediaGallerySourceItems[i].dataset.mediaId)) {
              mediaGallerySourceItems[i].remove()
              shouldRefresh = true
            }
          }

          // Refresh
          if (shouldRefresh) [mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData()

          // If media galleries don't match, sort to match new data order
          mediaGalleryDestinationItems.forEach((destinationItem, destinationIndex) => {
            const sourceData = sourceMap.get(destinationItem.dataset.mediaId)

            if (sourceData && sourceData.index !== destinationIndex) {
              mediaGallerySource.insertBefore(sourceData.item, mediaGallerySource.querySelector(`li:nth-of-type(${destinationIndex + 1})`))

              // Refresh source now that it has been modified
              ;[mediaGallerySourceItems, sourceSet, sourceMap] = refreshSourceData()
            }
          })
        }

        // Set featured media as active in the media gallery
        this.querySelector(`media-gallery`)?.setActiveMedia?.(`${this.dataset.section}-${variantFeaturedMediaId}`, true)
      }

      setQuantityBoundries() {
        if (!this.quantityInput) return

        const cartQuantity = this.quantityInput.dataset?.cartQuantity ? parseInt(this.quantityInput.dataset.cartQuantity) : 0
        const min = this.quantityInput.min ? parseInt(this.quantityInput.min) : 1
        const max = this.quantityInput.max ? parseInt(this.quantityInput.max) : null
        const step = this.quantityInput.step ? parseInt(this.quantityInput.step) : 1

        let calculatedMin = min
        const calculatedMax = max === null ? null : max - cartQuantity
        if (calculatedMax !== null) calculatedMin = Math.min(calculatedMin, calculatedMax)
        if (cartQuantity >= min) calculatedMin = Math.min(calculatedMin, step)

        this.quantityInput.min = calculatedMin

        if (calculatedMax) {
          this.quantityInput.max = calculatedMax
        } else {
          this.quantityInput.removeAttribute('max')
        }
        this.quantityInput.value = calculatedMin

        publish(PUB_SUB_EVENTS.quantityUpdate, undefined)
      }

      get productForm() {
        return this.querySelector(`product-form`)
      }

      get variantSelectors() {
        return this.querySelector('select[name^="options"]')?.closest('form') || null
      }

      get sectionId() {
        return this.dataset.originalSection || this.dataset.section
      }
    },
  )
}
