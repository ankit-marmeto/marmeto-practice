class FacetFiltersForm extends HTMLElement {	
	
	constructor() {
		super();
		this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

		this.debouncedOnSubmit = debounce((event) => {
			this.onSubmitHandler(event);
		}, 500);

		const facetForm = this.querySelector('form');
		facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

		const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
		if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
		// if (window.location.pathname.includes('/collections/')) {
		// 	const appenURl = "?filter.v.price.gte=&filter.v.price.lte=&filter.v.availability=1&sort_by=manual";			
		// 	if (!window.location.search.includes(appenURl)) {
		// 		window.location.href = window.location.pathname + appenURl;
		// 	}			
		// }
	}

	static setListeners() {
		const onHistoryChange = (event) => {
			const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
			if (searchParams === FacetFiltersForm.searchParamsPrev) return;
			FacetFiltersForm.renderPage(searchParams, null, false);
		};
		window.addEventListener('popstate', onHistoryChange);
	}

	static toggleActiveFacets(disable = true) {
		document.querySelectorAll('.js-facet-remove').forEach((element) => {
			element.classList.toggle('disabled', disable);
		});
	}

	static renderPage(searchParams, event, updateURLHash = true) {
		FacetFiltersForm.searchParamsPrev = searchParams;
		const sections = FacetFiltersForm.getSections();
		const loadingSpinners = document.querySelectorAll('.facets-container .loading__spinner, facet-filters-form .loading__spinner');
		loadingSpinners.forEach((spinner) => spinner.classList.remove('hidden'));
		document.getElementById('ProductGridContainer').querySelector('.collection')?.classList.add('loading');

		sections.forEach((section) => {
			const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
			const filterDataUrl = (element) => element.url === url;

      if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
			FacetFiltersForm.filterData.some(filterDataUrl)
				? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
				: FacetFiltersForm.renderSectionFromFetch(url, event);
          setTimeout(function() {HulkappWishlist.init();}, 800);
		});

    document.querySelector('.collection_sorting_item ')?.removeAttribute('open');
    const issortOptions = document.querySelector('body')?.getAttribute('aria-selected') === 'sort-options' ? true : false;
    const details = document.querySelector('.mobile-facets__disclosure');
    if (issortOptions && details) {
    details.removeAttribute('open');
    document.querySelector('body').classList.remove('overflow-hidden')
    } 
    
	}

	static renderSectionFromFetch(url, event) {
		fetch(url)
			.then((response) => response.text())
			.then((responseText) => {
				const html = responseText;
				FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
				FacetFiltersForm.renderFilters(html, event);
				FacetFiltersForm.renderProductGridContainer(html);
				FacetFiltersForm.renderProductCount(html);
        if (TagBasedCollectionUpdater.instance) {
          TagBasedCollectionUpdater.instance.resetState();
          TagBasedCollectionUpdater.instance.updateProductGrid().then(() => {
            TagBasedCollectionUpdater.instance.observeLastProductCard();
            if (typeof removeDuplicateProducts === 'function') removeDuplicateProducts();
            HulkappWishlist.init();
          });
        }
				if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
			});
	}

	static renderSectionFromCache(filterDataUrl, event) {
		const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
		FacetFiltersForm.renderFilters(html, event);
		FacetFiltersForm.renderProductGridContainer(html);
		FacetFiltersForm.renderProductCount(html);
    if (TagBasedCollectionUpdater.instance) {
      TagBasedCollectionUpdater.instance.resetState();
      TagBasedCollectionUpdater.instance.updateProductGrid().then(() => {
        TagBasedCollectionUpdater.instance.observeLastProductCard()
        if (typeof removeDuplicateProducts === 'function') removeDuplicateProducts();
        HulkappWishlist.init();
      });
    }
		if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
	}

	static renderProductGridContainer(html) {
    const productGrid = document.getElementById('ProductGridContainer').querySelector("ul#product-grid")
    const parsedHtml = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer');
    const parsedHTMLProductGrid = parsedHtml.querySelector("ul#product-grid")
    parsedHtml.querySelector(".shimmer-container") ? parsedHtml.querySelector(".shimmer-container").classList.add("hidden") : null ;
    if (productGrid && parsedHTMLProductGrid) {
      parsedHTMLProductGrid.classList = ''
      productGrid.classList.forEach(className => {
        parsedHTMLProductGrid.classList.add(className);
      });
    }

    document.getElementById('ProductGridContainer').innerHTML = parsedHtml.innerHTML

		document
			.getElementById('ProductGridContainer')
			.querySelectorAll('.scroll-trigger')
			.forEach((element) => {
				element.classList.add('scroll-trigger--cancel');
			});
		addLayout();
	}

	static renderProductCount(html) {
		infiniteScroll();
		const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCountDesktop').innerHTML;
		const container = document.getElementById('ProductCountDesktop');
        container.innerText = count;
	}

	static renderFilters(html, event) {
		const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
		const facetDetailsElements = parsedHTML.querySelectorAll(
			'#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter',
		);
		const matchesIndex = (element) => {
			const jsFilter = event ? event.target.closest('.js-filter') : undefined;
			return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
		};
		const facetsToRender = Array.from(facetDetailsElements).filter((element) => !matchesIndex(element));
		const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

		facetsToRender.forEach((element) => {
			document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
		});
		FacetFiltersForm.renderActiveFacets(parsedHTML);
		FacetFiltersForm.renderAdditionalElements(parsedHTML);

		if (countsToRender) {
			const closestJSFilterID = event.target.closest('.js-filter').id;

			if (closestJSFilterID) {
				FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
				FacetFiltersForm.renderMobileCounts(countsToRender, document.getElementById(closestJSFilterID));

				const newElementSelector = document.getElementById(closestJSFilterID).classList.contains('mobile-facets__details')
					? `#${closestJSFilterID} .mobile-facets__close-button`
					: `#${closestJSFilterID} .facets__summary`;
				const newElementToActivate = document.querySelector(newElementSelector);
				if (newElementToActivate) newElementToActivate.focus();
			}
		}
	}

	static renderActiveFacets(html) {
		const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

		activeFacetElementSelectors.forEach((selector) => {
			const activeFacetsElement = html.querySelector(selector);
			if (!activeFacetsElement) return;
			document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
		});

		FacetFiltersForm.toggleActiveFacets(false);
	}

	static renderAdditionalElements(html) {
		const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

		mobileElementSelectors.forEach((selector) => {
			if (!html.querySelector(selector)) return;
			document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
		});
		addLayout();
		document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
	}

	static renderCounts(source, target) {
		const targetSummary = target.querySelector('.facets__summary');
		const sourceSummary = source.querySelector('.facets__summary');

		if (sourceSummary && targetSummary) {
			targetSummary.outerHTML = sourceSummary.outerHTML;
		}

		const targetHeaderElement = target.querySelector('.facets__header');
		const sourceHeaderElement = source.querySelector('.facets__header');

		if (sourceHeaderElement && targetHeaderElement) {
			targetHeaderElement.outerHTML = sourceHeaderElement.outerHTML;
		}

		const targetWrapElement = target.querySelector('.facets-wrap');
		const sourceWrapElement = source.querySelector('.facets-wrap');

		if (sourceWrapElement && targetWrapElement) {
			const isShowingMore = Boolean(target.querySelector('show-more-button .label-show-more.hidden'));
			if (isShowingMore) {
				sourceWrapElement
					.querySelectorAll('.facets__item.hidden')
					.forEach((hiddenItem) => hiddenItem.classList.replace('hidden', 'show-more-item'));
			}

			targetWrapElement.outerHTML = sourceWrapElement.outerHTML;
		}
	}

	static renderMobileCounts(source, target) {
		const targetFacetsList = target.querySelector('.mobile-facets__list');
		const sourceFacetsList = source.querySelector('.mobile-facets__list');

		if (sourceFacetsList && targetFacetsList) {
			targetFacetsList.outerHTML = sourceFacetsList.outerHTML;
		}
	}

	static updateURLHash(searchParams) {
		history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
	}

	static getSections() {
		return [
			{
				section: document.getElementById('product-grid').dataset.id,
			},
		];
	}

	createSearchParams(form) {
		const formData = new FormData(form);
		return new URLSearchParams(formData).toString();
	}

	onSubmitForm(searchParams, event) {
		FacetFiltersForm.renderPage(searchParams, event);
	}

	// validatePrice sets the min and max values for the price range input, if the min value is greater than the max value, it sets the min value to 0
	validatePrice(event) {
		const isMobile = window.innerWidth <= 749;
		this.minInput = isMobile ? document.getElementById('Mobile-Filter-Price-GTE') : document.getElementById('Filter-Price-GTE');
		this.maxInput = isMobile ? document.getElementById('Mobile-Filter-Price-LTE') : document.getElementById('Filter-Price-LTE');
		
		if (this.minInput && this.maxInput && event.target === this.maxInput) {
			const minPrice = parseInt(this.minInput.value);
			const maxPrice = parseInt(this.maxInput.value);
			const maxPriceMax = parseInt(this.maxInput.getAttribute('max'));
			if(minPrice > maxPrice) this.minInput.value = 0 ;
			if(maxPrice > maxPriceMax)  this.maxInput.value = maxPriceMax;
		}
	}

	onSubmitHandler(event) {
		event.preventDefault();
		this.validatePrice(event);
		const sortFilterForms = document.querySelectorAll('facet-filters-form form');
		if (event.srcElement.className == 'mobile-facets__checkbox') {
			const searchParams = this.createSearchParams(event.target.closest('form'));
			this.onSubmitForm(searchParams, event);
		} else {
			const forms = [];
			const isMobile = event.target?.closest('form')?.id === 'FacetFiltersFormMobile';

			sortFilterForms.forEach((form) => {
				if (!isMobile) {
					if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
						const noJsElements = document.querySelectorAll('.no-js-list');
						noJsElements.forEach((el) => el.remove());
						forms.push(this.createSearchParams(form));
					}
				} else if (form.id === 'FacetFiltersFormMobile') {
					forms.push(this.createSearchParams(form));
				}
			});
			this.onSubmitForm(forms.join('&'), event);
		}
	}

	onActiveFilterClick(event) {
		event.preventDefault();
		FacetFiltersForm.toggleActiveFacets();
		const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
		FacetFiltersForm.renderPage(url);
	}
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
	constructor() {
		super();
		this.querySelectorAll('input').forEach((element) => element.addEventListener('change', this.onRangeChange.bind(this)));
		this.setMinAndMaxValues();
	}

	onRangeChange(event) {
		this.setMinAndMaxValues();
	}


	setMinAndMaxValues() {
		const inputs = this.querySelectorAll('input');
		const minInput = inputs[0];
		const maxInput = inputs[1];
		if (maxInput.value) minInput.setAttribute('max', maxInput.value);
		if (minInput.value) maxInput.setAttribute('min', minInput.value);
		if (minInput.value === '') maxInput.setAttribute('min', 0);
		if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
	}

}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
	constructor() {
		super();
		const facetLink = this.querySelector('a');
		facetLink.setAttribute('role', 'button');
		facetLink.addEventListener('click', this.closeFilter.bind(this));
		facetLink.addEventListener('keyup', (event) => {
			event.preventDefault();
			if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
		});
	}

	closeFilter(event) {
		event.preventDefault();
		const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
		form.onActiveFilterClick(event);
	}
}

customElements.define('facet-remove', FacetRemove);

function removeDuplicateProducts() {
  const productGrid = document.querySelector('#product-grid');
  if (!productGrid) return;
  const productItems = productGrid.querySelectorAll('li[data-product-id]');
  const seenProductIds = new Set();
  productItems.forEach((item) => {
    const productId = item.getAttribute('data-product-id');
    if (seenProductIds.has(productId)) {
      const nextElement = item.nextElementSibling
      item.remove();
      if (nextElement) {
        if (nextElement.classList.contains("product-grid__sale-image")) nextElement.remove()
      }
    } else {
      seenProductIds.add(productId);
    }
  });
}