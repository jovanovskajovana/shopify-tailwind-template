if (!customElements.get('quick-add-modal')) {
  customElements.define(
    'quick-add-modal',
    class QuickAddModal extends ModalDialog {
      constructor() {
        super()
        this.modalContent = this.querySelector('[id^="QuickAddInfo-"]')

        this.addEventListener('product-info:loaded', ({ target }) => {
          target.addPreProcessCallback(this.preprocessHTML.bind(this))
        })
      }

      hide(preventFocus = false) {
        const cartNotification = document.querySelector('cart-drawer')
        if (cartNotification) cartNotification.setActiveElement(this.openedBy)
        if (this.modalContent) {
          this.modalContent.innerHTML = ''
        }

        if (preventFocus) this.openedBy = null
        super.hide()
      }

      show(opener) {
        opener.setAttribute('aria-disabled', true)
        opener.classList.add('loading')

        fetch(opener.getAttribute('data-product-url'))
          .then((response) => response.text())
          .then((responseText) => {
            const responseHTML = new DOMParser().parseFromString(responseText, 'text/html')
            const productElement = responseHTML.querySelector('product-info')

            if (!productElement) {
              console.error('Product info element not found in response')
              return
            }

            this.preprocessHTML(productElement)
            HTMLUpdateUtility.setInnerHTML(this.modalContent, productElement.outerHTML)

            if (window.Shopify && Shopify.PaymentButton) {
              Shopify.PaymentButton.init()
            }
            if (window.ProductModel) window.ProductModel.loadShopifyXR()

            super.show(opener)
          })
          .catch((error) => {
            console.error('Error loading quick view:', error)
          })
          .finally(() => {
            opener.removeAttribute('aria-disabled')
            opener.classList.remove('loading')
          })
      }

      preprocessHTML(productElement) {
        if (!productElement) return

        this.preventDuplicatedIDs(productElement)
        this.removeDOMElements(productElement)
        this.preventVariantURLSwitching(productElement)
        this.revealAnimatedElements(productElement)
      }

      revealAnimatedElements(productElement) {
        if (!productElement) return

        // The product page hides these with `opacity-0` for a GSAP entrance
        // animation that never runs inside the modal, so drop the class here.
        const selector =
          '[data-product-media], [data-product-title], [data-product-price], [data-product-description], [data-product-variants], [data-product-form]'

        productElement.querySelectorAll(selector).forEach((element) => {
          element.classList.remove('opacity-0')
        })
      }

      preventVariantURLSwitching(productElement) {
        if (!productElement) return
        productElement.setAttribute('data-update-url', 'false')
      }

      removeDOMElements(productElement) {
        if (!productElement) return

        const modalDialog = productElement.querySelectorAll('modal-dialog')
        if (modalDialog) modalDialog.forEach((modal) => modal.remove())
      }

      preventDuplicatedIDs(productElement) {
        if (!productElement || !productElement.dataset || !productElement.dataset.section) return

        const sectionId = productElement.dataset.section

        const oldId = sectionId
        const newId = `quickadd-${sectionId}`
        productElement.innerHTML = productElement.innerHTML.replaceAll(oldId, newId)
        Array.from(productElement.attributes).forEach((attribute) => {
          if (attribute.value.includes(oldId)) {
            productElement.setAttribute(attribute.name, attribute.value.replace(oldId, newId))
          }
        })

        productElement.dataset.originalSection = sectionId
      }
    },
  )
}
