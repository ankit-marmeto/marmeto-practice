document.addEventListener('DOMContentLoaded', () => {
  if (!customElements.get('mm-product-card')) {
    class MMProductCard extends HTMLElement {
      constructor() {
        super();
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.init();
      }

      // initializes the swatches and radios on page reload and product card rendering
      init() {
        this.loader = this.querySelector('.loading-overlay__spinner');
        this.getSwatchVariants();
        this.getRadioVariants();
        this.addATCEvent();
      }

      /* check if the present variant is the active variant,
       * if so then check if variantId is already assigned, if it is not assigned,
       * get the variant ID whihc will be the active/selected Variant for the particular product card.
       * use '&&' operator instead of multiple if elseif statement. 
      */
      getSwatchVariants() {
        this.swatchVariants = this.querySelectorAll('.MM-variant-swatch-container');
        this.swatchVariants.forEach((variant) => {
          this.activeVariant = variant.dataset.active === 'active'? variant: this.activeVariant;
          this.activeSwatchInput = this.activeVariant? this.activeVariant.previousElementSibling: this.activeSwatchInput;
          variant.addEventListener('click', (event) => {
            event.preventDefault();
            variant.dataset.active !== 'active' && this.variantSwatchChangeMMCard(event);
          });
        });
      }

      getRadioVariants() {
        this.atcBtn = this.querySelector('.add-to-bag-button');
        this.radioVariants = this.querySelectorAll('.MM-variant-label.available');
        this.radioVariants.forEach((variant) => {
          this.currentRadioInput = variant.previousElementSibling;
          this.activeRadioInput = this.currentRadioInput.checked? this.currentRadioInput: this.activeRadioInput;
          variant.dataset.active = this.currentRadioInput.checked? 'active': '';
          this.activeRadioBtn = variant.dataset.active === 'active'? variant: this.activeRadioBtn;
          
          variant.addEventListener('click', (event)=> {
            event.preventDefault();
            const variantBtn = event.target.previousElementSibling;
            variant.dataset.active !== 'active' && !variantBtn.disabled && this.variantRadioChangeMMCard(event, variant);
          });
        });
        if (!this.activeRadioInput) {
          this.atcBtn.querySelector('span').innerHTML = 'Sold Out';
          this.atcBtn.style.pointerEvents = "none";
          this.atcBtn.parentElement.style.cursor = "auto";
        }
      }

      // this function handles the color swatch change
      async variantSwatchChangeMMCard(event) {
        // add loading icon until card is updated
        // loading icon is hidden in section rendering
        this.loader.classList.remove('hidden');

        this.closeOtherCardVariants();

        this.selectedSwatchBtn = event.target.closest('.MM-variant-swatch-container');
        this.selectedSwatchBtn.dataset.active = 'active';
        this.activeVariant.removeAttribute('data-active');
    
        this.selectedSwatchInput = this.selectedSwatchBtn.previousElementSibling;
        this.selectedSwatchInput.setAttribute('checked', 'checked');
        this.activeSwatchInput.removeAttribute('checked');
    
        this.activeSwatchInput = this.selectedSwatchInput;
        this.activeVariant = this.selectedSwatchBtn;
    
        this.updateProductUrlMMCard();
        await this.setActiveVariant(this.activeSwatchInput);
        await this.renderProductCard();
        this.init();
      }

      // this function handles the size variant change
      async variantRadioChangeMMCard(event, variant) {
        this.selectedRadioBtn = event.target;
        this.selectedRadioInput = this.selectedRadioBtn.previousElementSibling;
        this.selectedRadioInput.checked = true;
        this.selectedRadioBtn.dataset.active = 'active';
        if ( this.activeRadioInput) this.activeRadioInput.checked = false;
        if ( this.activeRadioBtn) this.activeRadioBtn.removeAttribute('data-active');

        this.activeRadioBtn = this.selectedRadioBtn;
        this.activeRadioInput = this.selectedRadioInput;
        if (this.activeRadioBtn.classList.contains('available')) {
          this.atcBtn.querySelector('span').innerHTML = 'Add To Cart';
        }
        

        await this.setActiveVariant(this.activeRadioInput);
        await this.renderProductCard();
        this.init();
        this.showSizeVariant();
      }

      // set active variant ID for the product
      async setActiveVariant(input) {
        if (input.classList.contains("Size")) {
          this.variantID = input.dataset.variantid;
        } else {
            try {
              const dataUrl = `/products/${input.dataset.url}.json`;
              const response = await fetch(dataUrl);
              if (!response.ok) {
                throw new Error(`Failed to fetch product data: ${response.statusText}`);
              }
              const productData = await response.json();
              const variantId = productData.product.variants[0].id;
              if (variantId) {
                this.variantID = variantId;
              }
            } catch (error) {
              console.error('Error fetching or updating variant data:', error);
              this.variantID = input.dataset.variantid;
            }
        }
        
      }

      // update the product url to render the product card
      updateProductUrlMMCard() {
        this.dataset.productHandle = this.selectedSwatchInput.dataset.url;
      }

      /* this function renders the product card when the color variant is changed.
       * it uses an alternate product template [card] to fetch the product card and renders in the place of existing product card.
      */
      async renderProductCard() {
        this.sectionId = this.dataset.sectionId;
        this.productHandle = this.dataset.productHandle;
        this.templateParam = 'card';
        const variantUrl = `/products/${this.productHandle}?view=${this.templateParam}&variant=${this.variantID}&section=${this.sectionId}`;

        try {
          // Fetch the data
          const response = await fetch(variantUrl);
          const responseText = await response.text();
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const responseCard = html.querySelector('mm-product-card');
      
          this.innerHTML = responseCard.innerHTML;
          
          // Dynamically adds classes to the wishlist container to ensure proper initialization of the wishlist app
          const wishlistBtn = this.querySelector('.icon-wishlist-heart-empty');
          if (wishlistBtn) {
            wishlistBtn.removeAttribute('style');
            wishlistBtn.style.setProperty('display', 'inline-block', 'important');
          }
          const heartIcon = this.querySelector('.heart-hulk-animation');
          if (heartIcon) {
            heartIcon.classList.add('collection-icon');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        window.HulkappWishlist.init();
      }

      // this function initializes and handles the add to cart event 
      addATCEvent() {
        this.atcIcon = this.querySelector('.atc-icon-wrapper');
        this.atcIcon.addEventListener('click', this.showSizeVariant.bind(this));

        this.atcBtn = this.querySelector('.add-to-bag-button');
        this.atcBtn.addEventListener('click', (event) => {
          this.loader.classList.remove('hidden');
          event.preventDefault();
          const variantID = this.variantID ? this.variantID : this.querySelector(".MM-variant-input:checked").dataset.variantid;
          const quantity = 1;
    
          const formData = {
            'items': [{
              'id': variantID,
              'quantity': quantity
            }]
          };
          formData['sections'] = this.cart.getSectionsToRender().map((section) => section.id);         
          formData['sections_url'] = window.location.pathname;
          this.cart.setActiveElement(document.activeElement);
          
          fetch(window.Shopify.routes.root + 'cart/add.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          })
            .then((response) => response.json())
            .then((response) => {
              if (response.items && response.items.length > 0 && response.status != 422) { // Check if response.items exists and is not empty
                const resultObject = response.items[0];
                resultObject.sections = response.sections;
                this.cart.renderContents(resultObject);
              } else {
                this.activeRadioInput.setAttribute('disabled', '');
                this.activeRadioInput.removeAttribute('checked');
                this.activeRadioBtn.classList.remove('available');
                this.activeRadioBtn.classList.add('unavailable');
                this.atcBtn.querySelector('span').innerHTML = 'Sold Out';
              }
            })
            .catch((error) => {
              console.error('Error:', error);
            })
            .finally(() => {
              if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
              this.loader.classList.add('hidden');
              this.initSplide();
            });
        });
      }

      initSplide() {
        const splideElement = document.querySelector('#offer-splide-drawer');
        const slides = splideElement.querySelectorAll('.splide__slide');
        if (splideElement) {
          new Splide(splideElement, {      
            type: 'slide',
            perPage: 2,
            perMove: 1,
            arrows: slides.length > 2, 
            focus: 'left',
            pagination: false,
            gap: '20px',
            noDrag: '.no-drag',
            breakpoints: {
              750: {
                perPage: 1.4,
                gap: '15px',
                fixedHeight: '135px',
                pagination: false
              }
            }        
          }).mount();
        } else {
          console.error('Splide element (#splide) not found.');
        }
      }
      copyOfferCode() {
        const buttons = document.querySelectorAll('.coupon-code');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                const couponCode = this.value;
                navigator.clipboard.writeText(couponCode).then(() => {
                    alert('Coupon code copied to clipboard: ' + couponCode);
                }).catch(err => {
                    console.error('Failed to copy coupon code:', err);
                });
            });
        });
      }

      showSizeVariant() {
        this.closeOtherCardVariants();
        const sizeVariantContainer = this.querySelector('.card__content-image');
        if (sizeVariantContainer.classList.contains('active')) {
          sizeVariantContainer.classList.remove('active');
        } else {
          sizeVariantContainer.classList.add('active');
        }
      }

      // this function closes the variant container opened in other product card
      closeOtherCardVariants() {
        // get the variant container which is open and 
        const variantContainer = document.querySelector('.card__content-image.active');
        variantContainer && variantContainer.classList.remove('active');
      }
    }
    customElements.define('mm-product-card', MMProductCard);
  }
})
