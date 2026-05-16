const DEFAULT_CITY = 'New York';

document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initParticles();
    initNavbar();
    initScrollAnimations();
    initClock();
    initWeather();
    initContactForm();
});

function initLoader() {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 1500);
}

function initParticles() {
    const container = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}vw`;
        particle.style.top = `${posY}vh`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        container.appendChild(particle);
    }
}

function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(current)) {
                item.classList.add('active');
            }
        });
    });

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('.fade-in');
    elementsToAnimate.forEach(el => observer.observe(el));
}

function initClock() {
    const timeElement = document.getElementById('clock-time');
    const dateElement = document.getElementById('clock-date');

    function updateClock() {
        const now = new Date();
        
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;

        const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }

    setInterval(updateClock, 1000);
    updateClock();
}

function initWeather() {
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');

    fetchWeatherData(DEFAULT_CITY);

    searchBtn.addEventListener('click', () => {
        if (cityInput.value.trim() !== '') {
            fetchWeatherData(cityInput.value.trim());
        }
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && cityInput.value.trim() !== '') {
            fetchWeatherData(cityInput.value.trim());
        }
    });
}

async function fetchWeatherData(city) {
    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        if (!geoRes.ok) throw new Error('Geocoding Failed');
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('City not found');
        }
        
        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        const locName = `${location.name}, ${location.country}`;

        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`);
        if (!weatherRes.ok) throw new Error('Weather fetch failed');
        const weatherData = await weatherRes.json();

        updateCurrentWeatherUI(weatherData, locName);
        updateForecastUI(weatherData);

    } catch (error) {
        console.error(error);
        document.getElementById('location-name').textContent = "Connection Failed";
        document.getElementById('weather-description').textContent = error.message;
    }
}

function updateCurrentWeatherUI(data, locName) {
    const current = data.current;
    const daily = data.daily;
    
    document.getElementById('location-name').textContent = locName;
    document.getElementById('weather-description').textContent = getWeatherDescription(current.weather_code);
    document.getElementById('current-temp').textContent = `${Math.round(current.temperature_2m)}°`;
    
    document.getElementById('humidity-val').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-val').textContent = `${current.wind_speed_10m.toFixed(1)} km/h`;
    
    const sunriseTime = new Date(daily.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const sunsetTime = new Date(daily.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('sunrise-val').textContent = sunriseTime;
    document.getElementById('sunset-val').textContent = sunsetTime;

    document.getElementById('uv-val').textContent = daily.uv_index_max[0] ? daily.uv_index_max[0].toFixed(1) : "N/A";
    document.getElementById('aqi-val').textContent = "Good";

    setWeatherIcon('weather-icon-main', current.weather_code, true);
}

function updateForecastUI(data) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';
    
    const daily = data.daily;

    for (let i = 0; i < 7 && i < daily.time.length; i++) {
        const dateObj = new Date(daily.time[i]);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const tempMax = Math.round(daily.temperature_2m_max[i]);
        const wCode = daily.weather_code[i];

        const card = document.createElement('div');
        card.className = 'forecast-card glass hover-scale';
        
        let iconHtml = getWeatherIconHtml(wCode);

        card.innerHTML = `
            <span class="day">${dayName}</span>
            ${iconHtml}
            <div class="temps">
                <span class="max">${tempMax}°</span>
            </div>
        `;
        container.appendChild(card);
    }
}

function getWeatherDescription(code) {
    const descMap = {
        0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle", 55: "Dense drizzle",
        56: "Light freezing drizzle", 57: "Dense freezing drizzle", 61: "Slight rain", 63: "Moderate rain",
        65: "Heavy rain", 66: "Light freezing rain", 67: "Heavy freezing rain", 71: "Slight snow",
        73: "Moderate snow", 75: "Heavy snow", 77: "Snow grains", 80: "Slight rain showers",
        81: "Moderate rain showers", 82: "Violent rain showers", 85: "Slight snow showers",
        86: "Heavy snow showers", 95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
    };
    return descMap[code] || "Unknown";
}

function getWeatherIconHtml(code) {
    let iconClass = 'fa-cloud icon-glow';
    
    if (code === 0) iconClass = 'fa-sun icon-glow-yellow';
    else if (code === 1 || code === 2) iconClass = 'fa-cloud-sun icon-glow-yellow';
    else if (code === 3) iconClass = 'fa-cloud icon-glow';
    else if (code === 45 || code === 48) iconClass = 'fa-smog icon-glow';
    else if ([51, 53, 55, 56, 57].includes(code)) iconClass = 'fa-cloud-rain icon-glow-blue';
    else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) iconClass = 'fa-cloud-showers-heavy icon-glow-blue';
    else if ([71, 73, 75, 77, 85, 86].includes(code)) iconClass = 'fa-snowflake icon-glow-cyan';
    else if ([95, 96, 99].includes(code)) iconClass = 'fa-bolt icon-glow-yellow';
    
    return `<i class="fa-solid ${iconClass}"></i>`;
}

function setWeatherIcon(elementId, code, isLarge = false) {
    const el = document.getElementById(elementId);
    el.className = '';
    const iconHtml = getWeatherIconHtml(code);
    const match = iconHtml.match(/class="(.*?)"/);
    if (match) {
        let classes = match[1];
        if (isLarge) {
            classes = classes.replace('icon-glow-yellow', '').replace('icon-glow-blue', '').replace('icon-glow-cyan', '').replace('icon-glow', '');
            classes += ' icon-glow-large';
        }
        el.className = classes;
    }
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        
        btn.textContent = 'Transmitting...';
        btn.disabled = true;

        setTimeout(() => {
            btn.textContent = 'Transmission Successful';
            btn.classList.add('bg-green');
            form.reset();
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('bg-green');
                btn.disabled = false;
            }, 3000);
        }, 1500);
    });
}
