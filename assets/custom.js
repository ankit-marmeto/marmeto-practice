class TabSwitching extends HTMLElement {
	constructor() {
		super();
		this.headers = this.querySelectorAll('.article-with-tabs__container');
		this.headers.forEach((header) => {
			header.addEventListener('click', (event) => {
				this.onChange(header);
			});
		});
		this.initializeSlide();
		this.initializeTabSplide();
		this.initializeThumbnailSlideChange();
	}

	initializeSlide() {
		this.querySelectorAll('.tabs-splide__container').forEach((each) => {
			this.slider = new Splide(each, {
				type: 'slide',
				perPage: 2,
				perMove: 1,
				fixedHeight: '500px',
				focus: 'left',
				arrows: false,
				gap: '17px',
				noDrag: '.no-drag',
				breakpoints: {
					750: {
						perPage: 1,
						gap: '10px',
						fixedHeight: '380px',
						pagination: false,
					},
				},
			});
			this.slider.mount();
		});
	}

	initializeTabSplide() {
		this.thumbnail = new Splide('#thumbnail', {
			type: 'slide',
			perPage: 1,
			perMove: 1,
			focus: 'left',
			pagination: false,
			gap: '20px',
			noDrag: '.no-drag',
			breakpoints: {
				750: {
					perPage: 1,
					gap: '15px',
				},
			},
		});
		this.thumbnail.mount();
	}

	initializeThumbnailSlideChange() {
		this.thumbnail.on('moved', (event) => {
			this.onThumbnailSlideChange(event);
		});
	}

	onThumbnailSlideChange(event) {
		const visibleTabElement = this.querySelector('.tab_small_container.is-visible');
		const sliderTabId = visibleTabElement ? visibleTabElement.dataset.tab : null;

		// Call the function to update content based on the stored tab value
		this.updateContentBasedOnTab(sliderTabId);
	}

	onChange(target) {
		const currentTabId = target.dataset.tab;

		this.headers.forEach((header) => {
			header.classList.remove('article-tab-active');
		});
		target.classList.add('article-tab-active');
		if (this.slider) {
			this.slider.destroy();
		}
		this.initializeSlide();
		this.updateContentBasedOnTab(currentTabId);
	}

	updateContentBasedOnTab(currentTabId) {
		this.querySelectorAll('[data-content-id]').forEach((tab) => {
			if (tab.dataset.contentId == currentTabId) {
				tab.classList.add('article-content-active');
				tab.classList.add('is-overflow');
			} else {
				tab.classList.remove('article-content-active');
				tab.classList.remove('is-overflow');
			}
		});
	}
}
customElements.define('tab-switch', TabSwitching);

// PLP progress bar layout
const addLayout = () => {
	const layouts = document.querySelectorAll('.layout');
	const productGrid = document.querySelector('#product-grid');
	if (productGrid) {
		layouts.forEach(function (layout, index) {
			layout.addEventListener('click', function () {
				updateLayoutAndProductGrid(layouts, productGrid, layout, index);
			});
		});
	}
	return productGrid;
};

function updateLayoutAndProductGrid(layouts, productGrid, clickedLayout, index) {
	layouts.forEach(function (item) {
		item.classList.remove('lo_active');
		item.classList.remove('lo_visited');
	});

	for (let i = 0; i < index; i++) {
		layouts[i].classList.add('lo_visited');
	}

	clickedLayout.classList.add('lo_active');
	const layoutClass = clickedLayout.classList[1];
	productGrid.className = productGrid.className.replace(/\bgrid-layout--\d+\b/g, '');
	productGrid.classList.add(`grid-${layoutClass}`);
	document.querySelector('.section-collection-product-grid')?.setAttribute('aria-controls', `grid-${layoutClass}`);
}

document.addEventListener('DOMContentLoaded', addLayout);

const RTT = document.getElementById('rtt');
if (RTT) {
  RTT.addEventListener('click', function () {
	window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


// remove sticky filter when it intersects with footer
const mobileFacetsWrapper = document.querySelector('.mobile-facets__open');
const footer = document.querySelector('.footer');

if (footer && mobileFacetsWrapper) {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				mobileFacetsWrapper.classList.add('hidden');
			} else {
				mobileFacetsWrapper.classList.remove('hidden');
			}
		});
	});

	observer.observe(footer);
}

//closing details tag js if the click is outside the details element or its summary
document.addEventListener('click', function (event) {
	let details = document.querySelector('.collection-filters details');
	let summary = details?.querySelector('.collection-filters summary');

    if(details && summary){
     	if (!details.contains(event.target) && event.target !== summary) {
    		details.removeAttribute('open');
    	} 
    }
});
