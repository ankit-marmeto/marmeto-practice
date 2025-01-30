class TagBasedCollectionUpdater {
  static instance = null;

  constructor(productGridId, shimmerContainerSelector) {
    if (TagBasedCollectionUpdater.instance) {
      return TagBasedCollectionUpdater.instance;
    }

    this.productGrid = document.getElementById('product-grid');
    this.collectionHandle = this.productGrid?.dataset.collectionHandle;
    this.currentPage = 1;
    this.totalPages = 1;
    this.fetching = false;
    this.shimmerContainer = document.querySelector(shimmerContainerSelector);
    this.lastProductCard = null;       
    
    TagBasedCollectionUpdater.instance = this;
    const collectionDataScript = document.getElementById("collection-data");
    this.collectionData = null;

    try {
      if (collectionDataScript?.textContent.trim()) {
        this.collectionData = JSON.parse(collectionDataScript.textContent);
      } else {
        console.error("Collection data is missing or empty.");
      }
    } catch (error) {
      console.error("Failed to parse collection data:", error);
    }

    this.sortingCollectionUrl = this.productGrid?.dataset.sortingCollectionHandle; 
     
    if (this.collectionHandle && ![this.sortingCollectionUrl, 'all'].includes(this.collectionHandle)) {
      this.shimmerContainer.classList.remove("hidden");
      this.initializeObserver();
      this.updateProductGrid().then(() => {
        this.observeLastProductCard();
        if (typeof removeDuplicateProducts === 'function') removeDuplicateProducts();
        this.shimmerContainer.classList.add("hidden");
      });
    } else {
      this.shimmerContainer.classList.add("hidden");
    }
  }

  initializeObserver() {
    const observerOptions = {
      root: null,
      threshold: 0.5
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.fetching && this.currentPage <= this.totalPages) {
          this.observer.unobserve(entry.target);
          this.updateProductGrid().then(() => {
            this.observeLastProductCard();
          });
        }
      });
    }, observerOptions);
  }

  observeLastProductCard() {
    if (this.lastProductCardId) {
      const lastProductCardElement = document.getElementById('product-grid').querySelector(`[data-product-id="${this.lastProductCardId}"]`).querySelector("mm-product-card");
      if (lastProductCardElement) {
        this.observer.observe(lastProductCardElement);
      }
    }
  }

  generateFilterUrl(rules, baseUrl , page) {
    if (!rules || rules.length == 0) {
      let collectionUrl = `/collections/${this.collectionHandle}?view=custom-collection&page=${page}`;      
      const currentParams = new URLSearchParams(window.location.search);      
      currentParams.forEach((value, key) => {
        collectionUrl += `&${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      });
      return collectionUrl;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const existingFilters = new Set(urlParams.keys());
    const queryParams = [...urlParams.entries()].map(
      ([key, value]) => `${key}=${encodeURIComponent(value)}`
    );
  
    const processedColumns = new Set();
  
    const isValidTag = (condition) => /^[a-zA-Z0-9_-]+$/.test(condition);
  
    rules.forEach((rule) => {
      if (processedColumns.has(rule.column)) return;
      let filter = "";
      switch (rule.column) {
        case "tag":
          if (rule.relation === "equals" && isValidTag(rule.condition)) {
            filter = `filter.p.tag=${encodeURIComponent(rule.condition)}`;
          } else {
            document
              .querySelectorAll('input[name="filter.p.product_type"]')
              .forEach((input) => {
                const value = input.dataset.value || input.value;
                if (value && !existingFilters.has("filter.p.product_type")) {
                 if(!queryParams.includes(`filter.p.product_type=${encodeURIComponent(value)}`)) {
                  queryParams.push(
                    `filter.p.product_type=${encodeURIComponent(value)}`
                  );
                 }
                }
              });
          }
          break;
  
        case "type":
          if (rule.relation === "equals") {
            filter = `filter.p.product_type=${encodeURIComponent(rule.condition)}`;
          } else if (rule.relation === "not_equals") {
            document
              .querySelectorAll('input[name="filter.p.product_type"]')
              .forEach((input) => {
                const value = input.dataset.value || input.value;
                if (value && !existingFilters.has("filter.p.product_type")) {
                  if(!queryParams.includes(`filter.p.product_type=${encodeURIComponent(value)}`)) {
                    queryParams.push(
                      `filter.p.product_type=${encodeURIComponent(value)}`
                    );
                  }
                }
              });
            processedColumns.add(rule.column);
          }
          break;
  
        case "vendor":
          if (rule.relation === "equals") {
            filter = `filter.p.vendor=${encodeURIComponent(rule.condition)}`;
          } else if (rule.relation === "not_equals") {
            document
              .querySelectorAll('input[name="filter.p.vendor"]')
              .forEach((input) => {
                const value = input.dataset.value || input.value;
                if (value && !existingFilters.has("filter.p.vendor")) {
                  if(!queryParams.includes(`filter.p.vendor=${encodeURIComponent(value)}`)) {
                    queryParams.push(
                      `filter.p.vendor=${encodeURIComponent(value)}`
                    );
                  }
                }
              });
            processedColumns.add(rule.column);
          }
          break;
  
        case "variant_price":
          if (rule.relation === "less_than") {
            filter = `filter.v.price.ite=${encodeURIComponent(rule.condition)}`;
          } else if (rule.relation === "greater_than") {
            filter = `filter.v.price.gte=${encodeURIComponent(rule.condition)}`;
          }
          break;
  
        default:
          console.warn(`Unsupported rule: ${JSON.stringify(rule)}`);
          break;
      }
  
      if (filter && !existingFilters.has(filter.split("=")[0])) {
        if (!queryParams.includes(filter)) {
          queryParams.push(filter);
        }
      }
    });
  
    return `${baseUrl}?view=custom-collection&${queryParams.join("&")}&page=${page}`;
  }

  fetchNewProductCards(page) {
    const collectionUrl = this.generateFilterUrl(this.collectionData.rules , this.sortingCollectionUrl , page) 
      
    return fetch(collectionUrl)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.text();
      })
      .then(htmlString => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const paginationElement = doc.querySelector('#magepow-Pagination');
        if (paginationElement) {
          const anchorElements = paginationElement.querySelectorAll('a');
          let maxPage = 1;
          anchorElements.forEach(anchor => {
            const url = new URL(anchor.href);
            if (url) {
              maxPage = url.search.split("&").filter(query => query.includes("page"))[0].split("=")[1];
            }
          });
          this.totalPages = maxPage || 1;
        } else {
          this.totalPages = 1;
        }
        return doc.querySelector('#product-grid');
      })
      .catch(error => {
        console.error('Error fetching product grid:', error);
      });
  }

  appendNewProductCards(newProductGrid) {
    if (newProductGrid) {
      const productGrid = document.querySelector('.product-grid');
      const bannerElement = document.querySelector(".product-grid__sale-image");
      const newProductsHTML = Array.from(newProductGrid.querySelectorAll("li")).reverse();
      const initialProductCards = productGrid.querySelectorAll('.grid__item');
          
      let cardproducts = []
      initialProductCards.forEach((ele) => {
        cardproducts.push(ele.getAttribute('data-product-id'));                    
      })    
      
      if (!this.lastProductCardId) {
        newProductsHTML.forEach( (productCard , index) => {
          if (bannerElement) {
            productGrid.insertAdjacentHTML('afterbegin', bannerElement.outerHTML);
          }
          productGrid.insertAdjacentHTML('afterbegin', productCard.outerHTML);
          if ( index === 0) {
            this.lastProductCardId = productCard.dataset.productId;
          }
        });
      } else {
        const referenceElement = document.getElementById('product-grid').querySelector(`[data-product-id="${this.lastProductCardId}"]`).nextElementSibling;
        
        newProductsHTML.forEach( (productCard , index) => {
           if (!cardproducts.includes(productCard.getAttribute('data-product-id'))){        
            if (bannerElement) {
              const clonedBanner = bannerElement.cloneNode(true);
              referenceElement.parentNode.insertBefore(clonedBanner, referenceElement.nextSibling);
            }
            
            referenceElement.parentNode.insertBefore(productCard, referenceElement.nextSibling);
            if ( index === 0) {
              this.lastProductCardId = productCard.dataset.productId;
            }
           }
          
        });
      }
    }
  }

  updateProductGrid() {
    return new Promise((resolve, reject) => {
      if (this.currentPage <= this.totalPages && !this.fetching && this.collectionHandle && ![this.sortingCollectionUrl, 'all'].includes(this.collectionHandle) && this.sortingCollectionUrl) {
        this.fetching = true;
        this.shimmerContainer.classList.remove("hidden");
        document.body.classList.add("overflow-hidden")
        document.querySelector(".collection")?.classList.add("loading")
        this.fetchNewProductCards(this.currentPage)
          .then(newProductGrid => {
            if (newProductGrid) {
              this.appendNewProductCards(newProductGrid);
              this.currentPage++;
            }
            resolve();
          })
          .catch(error => {
            console.error('Error in updateProductGrid:', error);
            reject(error);
          })
          .finally(() => {
            this.fetching = false;
            this.shimmerContainer.classList.add("hidden");
            document.body.classList.remove("overflow-hidden")
            document.querySelector(".collection")?.classList.remove("loading")
          });
      } else {
        resolve();
        resetState();
      }
    });
  }

  resetState() {
    this.fetching = false;
    this.currentPage = 1;
    this.shimmerContainer?.classList.add("hidden");
    this.lastProductCardId = null
  }
}

const productGridInstance = new TagBasedCollectionUpdater('product-grid', '.shimmer-container');
