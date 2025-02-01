// Speech recognition setup
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
const btn = document.querySelector("#listen-btn");
const textInput = document.querySelector("#text-command");
const sendTextBtn = document.querySelector("#send-text");
const themeToggle = document.querySelector(".theme-toggle");
const helpToggle = document.querySelector(".help-toggle");
const helpContent = document.querySelector(".help-content");
const historyList = document.querySelector("#history-list");
const featureItems = document.querySelectorAll(".feature-item");

// State management
let isListening = false;
let calendarEvents = [];
let darkTheme = false;

// Weather API key (replace with your own from OpenWeatherMap)
const lat = 40.7128; // Example latitude
const lon = -74.0060; // Example longitude
const WEATHER_API_KEY = "9c88369c7cd4dcaa4098597803ee660d"; // Your actual API key

const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`;
console.log(url);

function init() {
    loadTheme();
    setupEventListeners();
    initParticles();
}

// Setup event listeners
function setupEventListeners() {
    btn.addEventListener("click", toggleListening);
    textInput.addEventListener("keypress", handleTextInput);
    sendTextBtn.addEventListener("click", () => handleCommand(textInput.value));
    themeToggle.addEventListener("click", toggleTheme);
    helpToggle.addEventListener("click", toggleHelp);
    featureItems.forEach(item => {
        item.addEventListener("click", () => {
            handleCommand(item.dataset.command);
        });
    });
}

// Toggle listening state
function toggleListening() {
    if (!isListening) {
        startListening();
    } else {
        stopListening();
    }
}

// Start listening for voice input
function startListening() {
    speak("How can I help you?");
    setTimeout(() => {
        isListening = true;
        btn.innerHTML = '<i class="fas fa-microphone-slash"></i> Listening...';
        btn.classList.add("listening");
        document.querySelector(".voice-wave").style.display = "flex";
        recognition.start();
    }, 1000);
}

// Stop listening for voice input
function stopListening() {
    isListening = false;
    btn.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
    btn.classList.remove("listening");
    document.querySelector(".voice-wave").style.display = "none";
    recognition.stop();
}

// Handle text input
function handleTextInput(e) {
    if (e.key === "Enter") {
        handleCommand(textInput.value);
        textInput.value = "";
    }
}

// Function to convert text to speech
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

// Add command to history
function addToHistory(command) {
    const li = document.createElement("li");
    li.textContent = command;
    historyList.insertBefore(li, historyList.firstChild);
    if (historyList.children.length > 10) {
        historyList.removeChild(historyList.lastChild);
    }
}

// Toggle theme
function toggleTheme() {
    darkTheme = !darkTheme;
    document.body.classList.toggle("dark-theme");
    themeToggle.innerHTML = darkTheme ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem("theme", darkTheme ? "dark" : "light");
}

// Load theme from localStorage
function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        darkTheme = true;
        document.body.classList.add("dark-theme");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// Toggle help menu
function toggleHelp() {
    helpContent.classList.toggle("active");
}

// Get weather data
async function getWeather(city) {
    try {
        // First, encode the city name to handle spaces and special characters
        const encodedCity = encodeURIComponent(city);
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${WEATHER_API_KEY}&units=metric`;
        
        console.log('Fetching weather for:', city);
        console.log('API URL:', apiUrl);

        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log('Weather API Response:', data);

        if (data.cod && data.cod !== 200) {
            throw new Error(data.message || 'City not found');
        }

        const weatherDescription = data.weather[0].description;
        const temperature = Math.round(data.main.temp);
        const humidity = data.main.humidity;
        const windSpeed = Math.round(data.wind.speed);
        
        return `The weather in ${city} is ${weatherDescription} with a temperature of ${temperature}°C. 
                Humidity is ${humidity}% and wind speed is ${windSpeed} m/s.`;
    } catch (error) {
        console.error('Weather API Error Details:', {
            error: error.message,
            city: city,
            timestamp: new Date().toISOString()
        });
        
        if (error.message.includes('not found')) {
            return `Sorry, I couldn't find weather information for "${city}". Please check the city name and try again.`;
        }
        return "Sorry, there was an error getting the weather information. Please try again in a moment.";
    }
}

// Calculate expression
function calculate(expression) {
    try {
        return eval(expression);
    } catch (error) {
        return "Sorry, I couldn't calculate that.";
    }
}

// Handle commands
async function handleCommand(command) {
    command = command.toLowerCase().trim();
    addToHistory(command);
    let response = "";

    try {
        if (command.includes("open")) {
            if (command.includes("youtube")) {
                window.location.href = "https://www.youtube.com";
                response = "Opening YouTube...";
            } else if (command.includes("google")) {
                window.location.href = "https://www.google.com";
                response = "Opening Google...";
            } else if (command.includes("facebook")) {
                window.location.href = "https://www.facebook.com";
                response = "Opening Facebook...";
            } else if (command.includes("instagram")) {
                window.location.href = "https://www.instagram.com";
                response = "Opening Instagram...";
            } else if (command.includes("whatsapp")) {
                window.location.href = "https://www.whatsapp.com";
                response = "Opening WhatsApp...";
            } else if (command.includes("calendar")) {
                window.open("https://calendar.google.com", "_blank");
                response = "Opening Google Calendar...";
            }
        } else if (command.includes("weather")) {
            const cityMatch = command.match(/weather(?:\s+in)?\s+(.+)/i);
            if (!cityMatch) {
                response = "Please specify a city name, for example: 'Weather in London'";
            } else {
                const city = cityMatch[1].trim();
                response = await getWeather(city);
            }
        } else if (command.includes("time")) {
            const now = new Date();
            response = `The current time is ${now.toLocaleTimeString()}`;
        } else if (command.includes("calculate")) {
            const expression = command.replace("calculate ", "");
            const result = calculate(expression);
            response = `The result is ${result}`;
        } else if (command.includes("joke")) {
            try {
                const jokeResponse = await fetch("https://v2.jokeapi.dev/joke/Programming?safe-mode");
                const jokeData = await jokeResponse.json();
                response = jokeData.type === "single" ? jokeData.joke : `${jokeData.setup} ... ${jokeData.delivery}`;
            } catch (error) {
                response = "Sorry, I couldn't fetch a joke right now.";
            }
        } else if (command.includes("calendar")) {
            window.open("https://calendar.google.com", "_blank");
            response = "Opening Google Calendar...";
        } else {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(command)}`;
            response = "Searching Google for " + command;
        }
    } catch (error) {
        console.error('Command handling error:', error);
        response = "Sorry, I encountered an error processing your request. Please try again.";
    }

    speak(response);
    return response;
}

// Initialize particles
function initParticles() {
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: '#ffffff'
            },
            shape: {
                type: 'circle'
            },
            opacity: {
                value: 0.5,
                random: false
            },
            size: {
                value: 3,
                random: true
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.4,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'out',
                bounce: false
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: 'grab'
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 1
                    }
                },
                push: {
                    particles_nb: 4
                }
            }
        },
        retina_detect: true
    });
}

// Handle recognition results
recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    handleCommand(command);
};

recognition.onend = () => {
    stopListening();
};

// Initialize the app
init();