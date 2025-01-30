if (!customElements.get("visenze-recommendation")) {
  class VisenzeRecommendation extends HTMLElement {
    constructor() {
      super();
      this.apiKey = this.dataset.apiKey;
      this.placementIds = this.dataset.placementId.split('|');
      this.productsLimit = this.dataset.productsLimit || 10;
      this.productId = this.dataset.productId;
      this.sectionId = this.dataset.sectionId;
      this.showAlternativeProducts = this.dataset.showAlternativeProducts
      this.fetchedHandles = new Set();
      this.visibleProductCount = 0;

      this.fetchVisenzeProducts = this.fetchVisenzeProducts.bind(this);
      this.fetchProductDataByHandle = this.fetchProductDataByHandle.bind(this);
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), { threshold: 1 });
    }

    connectedCallback() {
      this.observer.observe(this);
      let visenzeSessionId = null
      let visenzeUserId = null
      this.placementIds.forEach((placementId) => {
        const sanitizedPlacementId = placementId.replace(/\D/g, '').slice(0, 4);
        if (!sanitizedPlacementId || sanitizedPlacementId.length !== 4) {
          console.warn(`Invalid placement ID skipped: ${placementId}`);
          return;
        }
        visearch1.set('app_key', `${this.apiKey}`);
        visearch1.set('placement_id', `${sanitizedPlacementId}`);
        visearch1.getSid(function (sid) {
          visenzeSessionId = sid;
        });
        visearch1.getUid(function (uid) {
          visenzeUserId = uid;
        });
      });
      
    }

    setupEventListner() {
      const productCards = this.querySelectorAll("mm-product-card")
      productCards.forEach( productCard => {
        productCard.addEventListener("click" , (e) => {
          this.sendClickEvent(e)
        })
        const callback = (entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.sendViewEvent(entry.target);
              observer.unobserve(entry.target);
            }
          });
        };
        const observer = new IntersectionObserver(callback, {
          root: null,
          threshold: 1,
        });
        observer.observe(productCard);
      })
      const addToCartButtons = this.querySelectorAll(".add-to-bag-button");
      addToCartButtons.forEach( addToCartButton => {
        addToCartButton.addEventListener("click" , (e) => {
          e.stopPropagation()
          this.sendAddToCartEvent(e)
        })
      })
    }

    disconnectedCallback() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.fetchVisenzeProducts();
          this.observer.unobserve(this);
        }
      });
    }

    async fetchVisenzeProducts() {
      const options = { method: 'GET', headers: { accept: 'application/json' } };
      const shimmerContainer = document.querySelector(`.shimmer-container.section-${this.sectionId}-padding`);
      const productContainer = this.closest(".visenze-recommendation-container");
      if (!productContainer && !this.apiKey && !this.placementId) {
        console.error('Related products container not found');
        if (shimmerContainer) shimmerContainer.classList.add("hidden");
        return;
      }
      if (shimmerContainer) shimmerContainer.classList.remove("hidden");
      productContainer.classList.add("hidden");

      try {
        for (let placementId of this.placementIds) {
          placementId = placementId.replace(/\D/g, '').slice(0, 4);
          if (placementId.length !== 4) {
            console.warn(`Invalid placement ID skipped: ${placementId}`);
            continue;
          }
          const response = await fetch(`https://search.visenze.com/v1/product/recommendations/${this.productId}?app_key=${this.apiKey}&placement_id=${placementId}&attrs_to_get=product_url&limit=${this.productsLimit}`, options);
          if (!response.ok) {
            throw new Error(`Failed to fetch recommended products for placement ID: ${placementId}`);
          }
          const data = await response.json();
          const products = data.result;
          localStorage.setItem(`visenze_queryId${placementId}`, data.reqid);
          for (const [index, product] of products.entries()) {
            await this.fetchProductDataByHandle(product.data.product_url, index, placementId);
            this.visibleProductCount += 1;
            if (this.showAlternativeProducts === 'true' && product.alternatives) {
              for (const [altIndex, alternativeProduct] of product.alternatives.entries()) {
                await this.fetchProductDataByHandle(alternativeProduct.data.product_url, altIndex, placementId);
                this.visibleProductCount += 1;
              }
            }
          }
        }      
        HulkappWishlist.init();
        this.setupEventListner();

        if (shimmerContainer) shimmerContainer.classList.add("hidden");
        productContainer.classList.remove("hidden");
      } catch (error) {
        console.error('Error fetching recommended products:', error);
        if (shimmerContainer) shimmerContainer.classList.add("hidden");
      }
    }

    async fetchProductDataByHandle(handle , index, placementId) {
      const currentDomain = window.location.origin;
      const normalizedHandle = handle ? handle.replace(/https?:\/\/(www\.)?[\w.-]+/, currentDomain) : null;
      if ( !handle || this.fetchedHandles.has(normalizedHandle) || this.visibleProductCount >= this.productsLimit) return;
      
      this.fetchedHandles.add(normalizedHandle);
      try {
        const response = await fetch(`${normalizedHandle}?view=card`);
        if (!response.ok) throw new Error('Product not found');

        const productData = await response.text();
        const html = new DOMParser().parseFromString(productData, 'text/html');
        const responseCard = html.querySelector('mm-product-card');
        if (responseCard) {
          const wrapperDiv = document.createElement('div');
          responseCard.setAttribute("data-index" , index + 1);
          responseCard.setAttribute("data-placement-id" , placementId);
          wrapperDiv.classList.add('grid__item');
          this.sendLoadEvent(responseCard)
          wrapperDiv.appendChild(responseCard);
          this.appendChild(wrapperDiv);
        } else {
          console.warn('No mm-product-card found in the response data');
        }
      } catch (error) {
        console.error('Error fetching product data by handle:', error);
      }
    }

    sendClickEvent (e) {
      const productId = e.target.closest("mm-product-card").id;
      const index = e.target.closest("mm-product-card").dataset.index;
      const placementId = e.target.closest("mm-product-card").dataset.placementId;
      visearch1.sendEvent('product_click', {
        queryId: localStorage.getItem(`visenze_queryId${placementId}`),
        pid: productId,
        pos: index,
      });
    }

    sendAddToCartEvent(e) {
      const productId = e.target.closest("mm-product-card").id;
      const index = e.target.closest("mm-product-card").dataset.index;
      const placementId = e.target.closest("mm-product-card").dataset.placementId;
      visearch1.sendEvent('add_to_cart', {
        queryId: localStorage.getItem(`visenze_queryId${placementId}`),
        pid: productId,
        pos: index,
      });
    }

    sendLoadEvent(e) {
      const productId = e.id;
      const index = e.dataset.index;
      const placementId = e.dataset.placementId;
      visearch1.sendEvent('result_load', {
        queryId: localStorage.getItem(`visenze_queryId${placementId}`),
        pid: productId,
        pos: index,
      });
    }

    sendViewEvent(e) {
      const productId = e.id;
      const index = e.dataset.index;
      const placementId = e.dataset.placementId;
      visearch1.sendEvent('product_view', {
        queryId: localStorage.getItem(`visenze_queryId${placementId}`),
        pid: productId,
        pos: index,
      });
    }
  }

  customElements.define("visenze-recommendation", VisenzeRecommendation);
}
