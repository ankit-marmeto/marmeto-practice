let initialCount;
let activeCount;

const incrementButton = document.getElementById('load-more-button');
const decrementButton = document.getElementById('view-less-button')

const maxCount = parseInt(incrementButton.dataset.collectionSize)

incrementButton.addEventListener('click', incrementItems);
decrementButton.addEventListener('click', decrementItems)

assignCountValues()

// Function to assign initial count values based on screen width
function assignCountValues() {
  if (window.innerWidth < 750) {
    const mobileCount = parseInt(incrementButton.dataset.mobileCount)
    initialCount = mobileCount;
    activeCount = mobileCount;
  } else {
    const desktopCount = parseInt(incrementButton.dataset.desktopCount)
    initialCount = desktopCount;
    activeCount = desktopCount;
  }
}

// Function to show/hide elements based on active count
const elements = document.querySelectorAll('.category-section__collections--item');
function loadContent() {
  elements.forEach((element, index) => {
    const adjustedIndex = index + 1;
    if (adjustedIndex <= activeCount) {
      element.classList.remove('hidden');
      element.style.display = 'block';
    } else {
      element.classList.add('hidden');
    }
  });
  activeCount>initialCount ? decrementButton.classList.remove('hidden') : decrementButton.classList.add('hidden');
  activeCount===maxCount ? incrementButton.classList.add('hidden') : incrementButton.classList.remove('hidden');
}

// Functions to increment or decrement active count based on button click
function incrementItems() {
  const stepSize = initialCount
  const remainingCount = maxCount - activeCount;
  activeCount += Math.min(stepSize, remainingCount);
  loadContent();
}
function decrementItems() {
  const stepSize = initialCount
  activeCount -= activeCount % stepSize || stepSize;
  console.log(activeCount)
  loadContent();
}
