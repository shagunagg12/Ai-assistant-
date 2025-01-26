// Speech recognition setup
const recognition = new (window.SpeechRecognition ||
  window.webkitSpeechRecognition)();
recognition.lang = "en-US";
const btn = document.querySelector("#listen-btn");

// Attach click event listener to the button
btn.addEventListener("click", function () {
  // Function to convert text to speech
  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  // Function to handle recognized commands
  function handleCommand(command) {
    if (command.includes("open youtube")) {
      speak("Opening YouTube...");
      window.location.href = "https://www.youtube.com";

    } else if (command.includes("open google")) {
      speak("Opening Google...");
      window.location.href="https://www.google.com";
    } else if (command.includes("open facebook")) {
      speak("Opening Facebook...");
      window.location.href="https://www.facebook.com";
    } else if (command.includes("open instagram")) {
      speak("Opening Instagram...");
      window.location.href="https://www.instagram.com";
    } else if (command.includes("open whatsapp")) {
      speak("Opening WhatsApp...");
      window.location.href="https://www.whatsapp.com";
    } else {
      // Perform a Google search if command not recognized
      speak("Searching Google for " + command);
      window.location.href=
        `https://www.google.com/search?q=${encodeURIComponent(command)}`;
    }
  }

  // Greet the user and then start listening
  speak("Hello, how can I help you?");

  // Delay to ensure greeting completes before starting recognition
  setTimeout(() => {
    btn.innerHTML = "Listening...👂";
    btn.classList.add("listening");
    recognition.start();
  }, 2500);

  
  recognition.onresult = (event) => {
    console.log(event);
    const command = event.results[0][0].transcript.toLowerCase();
    handleCommand(command);
  };

  
  recognition.onend = () => {
    btn.innerHTML = "Start Listening";
    btn.classList.remove("listening");
  };
});