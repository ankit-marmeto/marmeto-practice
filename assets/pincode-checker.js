class PincodeChecker extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('button');
    this.input = this.querySelector('input');
    this.failureNode = this.querySelector('[data-pincode-failure]');
    this.successNode = this.querySelector('[data-pincode-success]');
    this.alertNode = this.querySelector('[data-pincode-alert]');
    this.estDeliveryNode = this.querySelector('[data-pincode-estdelivery]');
    this.estimatedDateNode = this.querySelector('.pincode-estimatation .estimation-time');

    this.input.addEventListener('keyup', this.handleInputKeyup.bind(this));
    this.input.addEventListener('focus', this.handleInputKeyup.bind(this));
    this.button.addEventListener('click', this.handleSubmit.bind(this));
  }

  handleInputKeyup() {
    // Remove all messages when user starts typing
    this.successNode.classList.add('hidden');
    this.failureNode.classList.add('hidden');
    this.alertNode.classList.add('hidden');
  
    // Restrict user to type more than 6 digits
    if (this.input.value.length > 6) {
      this.input.value = this.input.value.slice(0, 6);
    }
  }

  handleSubmit(event) {
    event.preventDefault(); // Prevent form submission
  
    // Remove all messages
    this.successNode.classList.add('hidden');
    this.failureNode.classList.add('hidden');
    this.alertNode.classList.add('hidden');
  
    const pincode = this.input.value;
    if (this.isInvalid(pincode)) this.alertNode.classList.remove('hidden');
    else this.validatePincode(pincode)
  }

  isInvalid(input) {
    const trimmedInput = input.trim();
    return trimmedInput === '' || trimmedInput.length < 6;
  }

  validatePincode(pincode) {
    this.estimatedDateNode.innerHTML = '3 to 5';
    this.successNode.classList.remove('hidden');
  }
}

customElements.define('pincode-checker', PincodeChecker);

