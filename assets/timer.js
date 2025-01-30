 // Promotional banner Javascript
  /*
    function startCountdown()
    * convert date{input text} and returns count down timer.
    * @param date{input}
    */
    function startCountdown(targetDate) {
      const interval = setInterval(updateCountdown, 1000);
      function updateCountdown() {
        const currentDate = new Date().getTime();
        const timeDifference = targetDate - currentDate;
        if (timeDifference <= 0) {
          clearInterval(interval);
          // Set all countdown elements to zero
          document.querySelector("#days").textContent = "00";
          document.querySelector("#hours").textContent = "00";
          document.querySelector("#minutes").textContent = "00";
          document.querySelector("#seconds").textContent = "00";
        } else {
          const days = padDigits(
            Math.floor(timeDifference / (1000 * 60 * 60 * 24))
          );
          const hours = padDigits(
            Math.floor(
              (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            )
          );
          const minutes = padDigits(
            Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
          );
          const seconds = padDigits(
            Math.floor((timeDifference % (1000 * 60)) / 1000)
          );
          const daysElement = document.querySelector("#days");
          const hoursElement = document.querySelector("#hours");
          const minutesElement = document.querySelector("#minutes");
          const secondsElement = document.querySelector("#seconds");
          daysElement.textContent = days;
          hoursElement.textContent = hours;
          minutesElement.textContent = minutes;
          secondsElement.textContent = seconds;
        }
      }
      function padDigits(number) {
        return number < 10 ? `0${number}` : number;
      }
    }
    const inputDate = document.querySelector(
      ".promotional-banner__input-text-box"
    )?.value;
    const dateArray = inputDate?.split("/");
    if (dateArray) {
      const targetDate = new Date(
        `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}T00:00:00`
      ).getTime();
      if (targetDate > new Date()) {
        startCountdown(targetDate);
      }
    }


