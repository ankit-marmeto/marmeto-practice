class ProductGallery extends Carousel {
  constructor() {
    super();
    // this.initiateZoom();
    this.variantFilter = this.carouselElement.dataset['variantfilter'] === 'true' || false;
  }

  initiateZoom() {
    if (!Drift) return;
    // Zoom can be customize to show zoomed item in different panel of screen
    // Read more about library https://github.com/imgix/drift
    const driftImgs = this.carouselElement.querySelectorAll('.slot-item img[data-zoom]');

    driftImgs.forEach((img) => {
      new Drift(img, {
        zoomFactor: 2.2,
        containInline: true,
        inlinePane: true,
        handleTouch: false
      });
    });
  }

  showAllMedia() {
    const allItems = this.carouselElement.querySelectorAll('[data-filter]');
    const allThumbnailItems = this.syncElement.querySelectorAll('[data-filter]');

    allItems.forEach((element) => {
      element.classList.add('splide__slide');
      element.classList.remove('hidden');
    });

    allThumbnailItems.forEach((element) => {
      element.classList.add('splide__slide');
      element.classList.remove('hidden');
    });

    this.refreshSlider();
  }

  filterMedia(media) {
    this.showAllMedia();

    const filterSlides = this.carouselElement.querySelectorAll( `[data-filter]:not([data-filter="${media?.alt}"])` );
    const filterSlidesThumbnails = this.syncElement.querySelectorAll( `[data-filter]:not([data-filter="${media?.alt}"])` );

    filterSlides.forEach((element) => {
      element.classList.remove('splide__slide');
      element.classList.add('hidden');
    });

    filterSlidesThumbnails.forEach((element) => {
      element.classList.remove('splide__slide');
      element.classList.add('hidden');
    });
    this.refreshSlider();
  }

  setActiveMedia(media) {
    if (this.variantFilter && media?.alt) {
      this.filterMedia(media);
    }

    const Slides = this.carousel.Components.Slides.filter( `li[data-media-id="${media?.id}"]:not(.splide__slide--clone)` );
    if ( Slides[0] ) {
      this.refreshSlider();
      this.carousel.go( Slides[0].index );
    }
  }
}

customElements.define('product-gallery', ProductGallery);
