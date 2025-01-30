if (window.innerWidth < 768) {
  const searchIcon = document.querySelector(
    "header .st-search-box.hidden-desktop .icon-search"
  );
  const searchInput = document.querySelector(
    "#search_mini_form .wizzy-search-form .wizzy-search-input"
  );
  searchIcon.addEventListener("click", () => {
    searchInput.click();
    // searchInput.foucs();
    // console.log("Search Icon is clicked");
  });
}

const headerSection = document.querySelector(".section-header");
window.addEventListener("scroll", () => {
  const wizzyAutoCompleteWrapper = document.querySelector(
    ".wizzy-autocomplete-wrapper"
  );
  if (window.scrollY > 0) {
    if (
      headerSection &&
      headerSection.classList.contains("scrolled-past-header")
    ) {
      if (wizzyAutoCompleteWrapper) {
        wizzyAutoCompleteWrapper.classList.add("wrapper-to-top");
      }
    }
  } else {
    if (wizzyAutoCompleteWrapper) {
      wizzyAutoCompleteWrapper.classList.remove("wrapper-to-top");
    }
  }
});

if (window.innerWidth > 768) {
  document.body.addEventListener("click", function (event) {
    if (
      event.target.matches(".wizzy-facet-head") ||
      event.target.matches(".facet-head-title")
    ) {
      const closestBlock = event.target.closest(
          ".wizzy-filters-facet-block.facet-block-top"
        ),
        filterBox = document.querySelector(".wizzy-search-filters-list-top");
      if (closestBlock) {
        let left = closestBlock.offsetLeft;
        let top = closestBlock.offsetTop;
        let height = filterBox.offsetHeight;
        // console.log("left====>", left);
        document
          .querySelectorAll(".wizzy-facet-list")
          .forEach(function (element) {
            element.style.left = left + "px";
            // element.style.top = top - height + "px";
          });
      }
    }
  });
}

const addSizeKSASorting = (filter) => {
  let isJson = false;
  let isSortJson = false;
  if (typeof filter == "string") {
    isJson = true;
    filter = JSON.parse(filter);
  }
  if (typeof filter.sort == "string") {
    isSortJson = true;
    filter.sort = JSON.parse(filter.sort);
  }
  let newSort = [];
  if (filter.sort[0].field === "relevance") {
    newSort.push(
      {
        field: "product_ksa:float",
        order: "desc",
      },
      {
        field: "name",
        order: "asc",
      }
    );
    filter.sort.forEach((x) => {
      if (x.field != "product_ksa:float") {
        newSort.push(x);
      }
    });
  } else {
    newSort = filter.sort;
  }

  filter.sort = newSort;
  if (isSortJson) {
    filter.sort = JSON.stringify(filter.sort);
  }
  if (isJson) {
    filter = JSON.stringify(filter);
  }
};

window.onWizzyScriptLoaded = function () {
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_INIT,
    function (payload) {
      payload.filters.configs.keepOpenedInMobileAfterApply = true;
      payload.search.configs.pagination.infiniteScrollOffset = {
        desktop: 3500,
        mobile: 3700,
      };

      if (window.wizzyConfig.common.isOnCategoryPage) {
        payload.common.lazyDOMConfig.contentDOMIdentifiers[0] =
          "#wizzy-shopify-collection-page-wrapper";
      } else {
        payload.common.lazyDOMConfig.contentDOMIdentifiers = [
          "#MainContent",
          ".main-content",
        ];
      }
      return payload;
    }
  );

  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.AFTER_PRODUCTS_TRANSFORMED,
    function (data) {
      data.forEach((prod) => {
        prod.swatches?.forEach((swatch) => {
          if (swatch.key === "colors") {
            prod.colorSwatch = swatch;
          } else {
            prod.sizeSwatch = swatch;
          }
        });

        prod.dataURL = prod.url.match(/\/products\/(.*?)\?variant/)[1];
      });
      return data;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_RENDER_RESULTS,
    function (data) {
      data.response.payload.facets.forEach((facet) => {
        if (
          window.innerWidth < 768 &&
          facet.position &&
          facet.position == "top"
        ) {
          facet.position = "left";
        }

        if (facet.key === "sizes") {
          facet.data.sort((a, b) => parseInt(a.key) - parseInt(b.key));
        }
      });
      return data;
    }
  );

  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_AUTOCOMPLETE_EXECUTED,
    function (payload) {
      return payload;
    }
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_FILTERS_EXECUTED,
    function (data) {
      data.filters.attributeFacetValuesLimit = 50;
      // if (!window.wizzyConfig.common.isOnCategoryPage) {
      console.log(data.filters);
      addSizeKSASorting(data.filters);
      // }
      // let newSort = [];
      // if (wizzyConfig.common.isOnCategoryPage) {
      //   data.filters.sort.forEach((opt) => {
      //     if (opt.field !== "relevance") {
      //       newSort.push(opt);
      //     }
      //   });
      //   data.filters.sort = newSort;
      // }

      return data;
    },
    1
  );
  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.BEFORE_SEARCH_EXECUTED,
    function (data) {
      data.attributeFacetValuesLimit = 50;
      addSizeKSASorting(data);

      var searchform = document.querySelector(
        ".wizzy-search-form-wrapper.mf-initial "
      );
      if (searchform && searchform.classList.contains("mobileTapped")) {
        searchform.classList.remove("mobileTapped");
      }

      //remove banner and banner image for search page
      var banner = document.querySelector(
        "#shopify-section-template--23512038408559__banner"
      );
      var bannerImage = document.querySelector(
        "#shopify-section-template--23512038408559__banner_image_JmYh9c"
      );

      if (banner || bannerImage) {
        banner.style.display = "none";
        bannerImage.style.display = "none";
      }

      return data;
    }
  );

  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.VIEW_RENDERED,
    function (payload) {
      // console.log("VIEW_RENDERED", payload.data.response.payload.total);
      if (window.wizzyConfig.common.isOnCategoryPage) {
        const pageWidthDIV = document.querySelector(
          "#MainContent .page-width.scroll-trigger.animate--slide-in"
        );

        if (pageWidthDIV) {
          if (pageWidthDIV.classList.contains("page-width")) {
            pageWidthDIV.className = "";
            // console.log(pageWidthDIV);
          }
        }
      }
      const facetWrapper = document.querySelectorAll(
        ".wizzy-filters-facet-block .wizzy-facet-body .facet-search-wrapper"
      );
      if (window.innerWidth < 768) {
        facetWrapper.forEach((facet) => {
          if (facet.classList.contains("active")) {
            facet.classList.remove("active");
          }
        });
      }

      const PageCount = document.querySelector(
        ".collection-hero .collection-hero__text-wrapper #ProductCountDesktop"
      );
      if (PageCount) {
        PageCount.innerHTML =
          payload.data.response.payload.total + " " + "products";
      }
      return payload;
    }
  );

  window.wizzyConfig.events.registerEvent(
    window.wizzyConfig.events.allowedEvents.PRODUCTS_RESULTS_RENDERED,
    function (payload) {
      var filterClick = document.querySelectorAll(".wizzy-filters-facet-block");
      return (
        filterClick.forEach(function (element) {
          element.addEventListener("click", function (e) {
            var divList = document.querySelectorAll(
              ".wizzy-filters-facet-block"
            );
            divList.forEach(function (element2) {
              element2.classList.toString() ==
                e.target.parentElement.parentNode.classList.toString() ||
                element2.classList.add("collapsed");
            });
          });
        }),
        payload
      );
    }
  );
  changeTemplate("wizzy-autocomplete-topproducts");
  changeTemplate("wizzy-search-wrapper");
  changeTemplate("wizzy-search-results-product");
  changeTemplate("wizzy-facet-block");
  changeTemplate("wizzy-search-summary");
};
const changeTemplate = function (div) {
  const oldDiv = document.getElementById(div);
  const newDiv = document.getElementById(div + "-new").text;
  oldDiv.text = newDiv;
};
