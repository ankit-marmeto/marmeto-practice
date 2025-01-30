document.addEventListener("DOMContentLoaded", function() {
    const slider = new Splide('#section-blog-post', {
        type: 'slide',
        perPage: 2,
        perMove: 1,  
        arrows: false,
        drag   : 'free',
        pagination: false,
        breakpoints: {
          750: {
              perPage: 2,
              perMove: 1, 
              pagination: false,
          }
        }
    });
    slider.mount();
  });