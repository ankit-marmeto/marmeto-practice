function isSafari() { // this will check if the browser is safari mobile or not
  return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
          navigator.userAgent &&
          navigator.userAgent.indexOf('CriOS') == -1 &&
          navigator.userAgent.indexOf('FxiOS') == -1 &&
          window.innerWidth < 768;
}
const dialog = document.querySelector('dialog#size_chart-dialog')
// this below condition will work only in safari mobile 
if (isSafari() ) {
  const clonedDialog = dialog.cloneNode(true);
  document.querySelector('body').appendChild(clonedDialog);
  dialog.remove();
}

const sizeDialog = document.getElementById('size_chart-dialog');
const sizeGuideBtn = document.querySelector('.size_guide-enabled .size_guide');
const sizeGuideCloseBtn = document.getElementById('dialog-close-btn');
const inchTabBtn = document.querySelector('.size_chart-tab.inch');
const cmTabBtn = document.querySelector('.size_chart-tab.cm');

sizeGuideBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  isSafari() ? sizeDialog.setAttribute('open', 'true') : sizeDialog.showModal();
  document.querySelector('body').classList.add('overflow-hidden');
  inchTabBtn.addEventListener('click', changeActive);
  cmTabBtn.addEventListener('click', changeActive);
});

sizeGuideCloseBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  isSafari() ? sizeDialog.removeAttribute('open') : sizeDialog.close();
  document.querySelector('body').classList.remove('overflow-hidden');
  inchTabBtn.removeEventListener('click', changeActive);
  cmTabBtn.removeEventListener('click', changeActive);
});

function changeActive() {
  const activeBtn = event.target;
  if (activeBtn.classList.contains('active')) return;
  const previousActive = activeBtn.previousElementSibling || activeBtn.nextElementSibling;
  activeBtn.classList.add('active');
  previousActive.classList.remove('active');

  const contentContainers = document.querySelectorAll('.size_chart-content');
  contentContainers.forEach((container) => {
    container.classList.toggle('active');
  })
}

class SizeChart extends HTMLElement {
  constructor() {
    super();

    this.completeChart = JSON.parse(this.querySelector('script#size_chart').innerHTML);
    this.filterData();
    this.fillInchData();
    this.fillCmData();
  }

  filterData() {
    this.chart = [];
    this.inchChart = [];
    this.cmChart = [];
    // Filter redundant data
    this.completeChart.forEach((value) => {
      const modifiedChart = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          // Exclude BrandName, Fit, and id
          if (key !== 'BrandName' && key !== 'Fit' && key !== 'id' && key !== 'Product') {
            // Remove "Garment", "HSP", "from", "Full" from each key wherever it exists
            const modifiedKey = key.replace('Garment', '').replace('HSP', '').replace('from', '').replace('Full', '').replace('Frontlength', 'FrontLength');
            modifiedChart[modifiedKey] = value[key];
          }
        }
      }
      this.chart.push(modifiedChart);
    });
    this.chart.forEach((value) => {
      const itemInInch = {};
      const itemInCm = {};
      for (const key in value) {
        if (key.endsWith('Cm') || key === 'Size' || key === 'brandSize') {
          const modifiedKey = key.replace('Cm', '');
          itemInCm[modifiedKey] = value[key];
        }
        if (!key.endsWith('Cm')){
          itemInInch[key] = value[key];
        }
      }
      this.inchChart.push(itemInInch);
      this.cmChart.push(itemInCm);
    });
  }

  fillInchData() {
    this.sizeChartInchWrapper = this.querySelector('.size_chart-content.inch');
    this.headerWrapper = document.createElement('div');
    this.headerWrapper.classList.add('size_chart-header');
    this.sizeChartInchWrapper.appendChild(this.headerWrapper);

    // Check if inchChart is not empty
    if (this.inchChart.length > 0) {
      const firstItem = this.inchChart[0];
      for (const key in firstItem) {
        if (Object.hasOwnProperty.call(firstItem, key)) {
          // key variable contains each key of the first item in inchChart
          const div = document.createElement('div');
          div.classList.add(`size_chart-${key}`);
          const modifiedKey = this.addSpaceBetweenWords(key);
          div.textContent = modifiedKey;
          this.headerWrapper.appendChild(div);
        }
      }
      this.inchChart.forEach((item) => {
        this.sizesWrapper = document.createElement('div');
        this.sizesWrapper.classList.add('size_chart-sizes');
        this.sizeChartInchWrapper.appendChild(this.sizesWrapper);
        for (const key in item) {
          if (Object.hasOwnProperty.call(item, key)) {
            const div = document.createElement('div');
            div.classList.add(`size_chart-${key}`);
            div.textContent = item[key];
            this.sizesWrapper.appendChild(div);
          }
        }
      });
    }
  }
  
  fillCmData() {
    this.sizeChartCmWrapper = this.querySelector('.size_chart-content.cm');
    this.headerWrapper = document.createElement('div');
    this.headerWrapper.classList.add('size_chart-header');
    this.sizeChartCmWrapper.appendChild(this.headerWrapper);

    // Check if inchChart is not empty
    if (this.cmChart.length > 0) {
      const firstItem = this.cmChart[0];
      for (const key in firstItem) {
        if (Object.hasOwnProperty.call(firstItem, key)) {
          // key variable contains each key of the first item in inchChart
          const div = document.createElement('div');
          div.classList.add(`size_chart-${key}`);
          const modifiedKey = this.addSpaceBetweenWords(key);
          div.textContent = modifiedKey;
          this.headerWrapper.appendChild(div);
        }
      }
      this.cmChart.forEach((item) => {
        this.sizesWrapper = document.createElement('div');
        this.sizesWrapper.classList.add('size_chart-sizes');
        this.sizeChartCmWrapper.appendChild(this.sizesWrapper);
        for (const key in item) {
          if (Object.hasOwnProperty.call(item, key)) {
            const div = document.createElement('div');
            div.classList.add(`size_chart-${key}`);
            div.textContent = item[key];
            this.sizesWrapper.appendChild(div);
          }
        }
      });
    }
  }

  addSpaceBetweenWords(key) {
    return key.replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
customElements.define('size-chart', SizeChart);
