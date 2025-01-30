let checkbox = document.getElementById("myCheckbox");
let errorDiv = document.getElementById("error");
let registerButton = document.querySelector(".register_button");

checkbox.addEventListener("click", function() {
    // Check if it's checked
    if (checkbox.checked) {
        console.log("Checkbox is checked");
        registerButton.classList.remove("disabled");
        // Hide error message if checkbox is checked
        errorDiv.style.display = "none";
    } else {
        registerButton.classList.add("disabled");
        console.log("Checkbox is not checked");
    }
});
// document.getElementById("create_customer").addEventListener("submit", function(event) {
   
//     // If checkbox is not checked
//     if (checkbox.checked) {
//         console.log("Checkbox not checked");
         
//     }
//     else {
        
//         event.preventDefault();
//         // Show error message
//         errorDiv.style.display = "block";
//     }
// });
