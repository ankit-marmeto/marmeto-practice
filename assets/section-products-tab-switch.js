class ProductTab extends HTMLElement {
  constructor() {
    super();
    this.currentIndex = 0;
    this.tabArray = this.querySelectorAll('.tabs-container__tabs-list--tab')
    this.shoppingButton = document.querySelector('#tab-switch-button')
    this.addEventListener('click', this.replaceIndex.bind(this))
    this.replaceContent()
  }  
  replaceIndex(event) {
    if (event.target.dataset.element !== 'tab') return;
    this.currentIndex = parseInt(event.target.dataset.tabIndex);
    // const activeTabName = event.target.dataset.activeTab;
    this.replaceContent();
  }  
  replaceContent() {
    // Active tab
    this.tabsArray = this.querySelectorAll('button');
    for (let i = 0; i < this.tabsArray.length; i++) {
      this.tabsArray[i].classList.remove('active-tab');
      if (i === this.currentIndex) {
        this.tabsArray[i].classList.add('active-tab');
      }
    }
    // Active carousel
    this.carouselArray = this.querySelectorAll('.carousels-container__item');
    for (let i = 0; i < this.carouselArray.length; i++) {
      this.carouselArray[i].classList.remove('active-carousel');
      this.carouselArray[i].classList.add('inactive-carousel');
    }    
    this.activeCarousel = this.querySelector(`.carousels-container__item[data-index='${this.currentIndex}']`);
    // Add the active-carousel class after removing inactive-carousel
    this.activeCarousel.classList.remove('inactive-carousel');
    this.activeCarousel.classList.add('active-carousel');
  }
}  
customElements.define('product-tabs', ProductTab);

document.addEventListener('DOMContentLoaded', function () {
  function initializeSplideForActiveCarousels() {    
    document.querySelectorAll('.section-tab-switch.active-carousel').forEach((splideElement) => {
      if (!splideElement.classList.contains('splide-initialized')) {
         const splideInstance = new Splide(splideElement, {
          type: 'slide',
          perPage: 4,
          perMove: 1,
          focus: 'left',
          autoplay: false,
          rewind: false,
          arrows: true,
          pagination: false,
          autoWidth: true,
          breakpoints: {
            750: {
              perPage: 2.3,
              autoplay: false,
              flickPower: 500,
              drag   : 'free',
              arrows: false,
              pagination: true,
            }
          }
        }).mount();
        
        splideElement.splideInstance = splideInstance;
        splideElement.classList.add('splide-initialized');
        splideElement.classList.add('is-initialized');
      }
    });
  }

  function destroySplideForInactiveCarousels() {    
    document.querySelectorAll('.section-tab-switch.inactive-carousel').forEach((splideElement) => {
      if (splideElement.classList.contains('splide-initialized')) {
        var splide = new Splide( splideElement, {
          destroy: true
        } );
        splide.mount();
        splideElement.classList.remove('splide-initialized');
        splideElement.classList.remove('is-initialized');
        
      }
    });
  }
  initializeSplideForActiveCarousels();

  const observer = new MutationObserver(function (mutationsList) {
    mutationsList.forEach(function (mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('active-carousel') && target.classList.contains('section-tab-switch')) {
          initializeSplideForActiveCarousels();
        }
        if (target.classList.contains('inactive-carousel') && target.classList.contains('section-tab-switch')) {
          destroySplideForInactiveCarousels();
        }
      }
    });
  });
  document.querySelectorAll('.section-tab-switch').forEach((element) => {
    observer.observe(element, { attributes: true });
  });
});