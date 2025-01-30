
function setDefaultState() {
  if (window.location.href.includes('#orders')) showContent('order');
  else {
    document.querySelectorAll('.content-div').forEach((div) => div.classList.add('inactive-content'));
    document.getElementById('dashboard-content')?.classList.remove('inactive-content');
    document.querySelectorAll('.tab-details').forEach((t) => t.classList.remove('active-tab'));
    const dashboardTab = document.querySelector('.tab-details[data-tab-id="dashboard"]');
    if (dashboardTab && !document.querySelector('body').classList.contains('customers/order')) {
      dashboardTab.classList.add('active-tab');
    } else if (document.querySelector('body').classList.contains('customers/order')) {
      document.querySelector('.tab-details[data-tab-id="order"]').classList.add('active-tab');
    }
  }

  // Check if the page query parameter is set to 'showProfileLink' and then handle profile actions
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');

  if (pageParam === 'address') {
    showContent('address');
  } else if (pageParam === 'order') {
    showContent('order');
  } else if (pageParam === 'wishlist') {
    showContent('wishlist');
  }

  function checkURL() {
    const currentURL = window.location.href;
    if (currentURL.includes('view=orders')) {
      showContent('order');
    }
  }
  checkURL();
}

window.addEventListener('load', setDefaultState);

function showContent(tab) {
  if (tab !== 'wishlist') {
    document.querySelectorAll('.content-div').forEach((div) => div.classList.add('inactive-content'));
    document.querySelector(`#${tab}-content`).classList.remove('inactive-content');
    document.querySelector(`#${tab}-content`).classList.add('active-content');
    document.querySelectorAll('.tab-details').forEach((t) => t.classList.remove('active-tab'));
  } else {
    window.location.href ='https://raymond-india.myshopify.com/apps/advanced-wishlist';
  }
  
  const clickedTab = document.querySelector(`.tab-details[data-tab-id='${tab}']`);
  if (clickedTab) {
    clickedTab.classList.add('active-tab');
  }
}

function handleAnchorClick(tabName) {
  // Redirect to another page
  window.location.replace(`/account?page=${tabName}`);
}

