// infinite scroll
const infiniteScroll = () => {
  let endlessScroll = new Ajaxinate({
    container: '#product-grid',
    pagination: '#magepow-Pagination',
    loadingText: '',
    callback: function () {
      document.querySelectorAll('#product-grid li').forEach((li) => {
        li.classList.add('ty0');
        // Dynamically adds classes to the wishlist container to ensure proper initialization of the wishlist app
        const wishlistBtn = li.querySelector('.icon-wishlist-heart-empty');
        if (wishlistBtn) {
          wishlistBtn.removeAttribute('style');
          wishlistBtn.style.setProperty('display', 'inline-block', 'important');
        }
        const heartIcon = li.querySelector('.heart-hulk-animation');
        if (heartIcon) {
          heartIcon.classList.add('collection-icon');
        }
      });
    },
  });
};

document.addEventListener('DOMContentLoaded', () => {
  infiniteScroll();
});
