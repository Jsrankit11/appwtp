const API_KEY = 'YOUR_OPENWEATHER_API_KEY';
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
    if (API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        renderMockData(city);
        return;
    }

    try {
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
        if (!weatherRes.ok) throw new Error('City not found');
        const weatherData = await weatherRes.json();

        updateCurrentWeatherUI(weatherData);

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();
        
        updateForecastUI(forecastData);

    } catch (error) {
        console.error(error);
        document.getElementById('location-name').textContent = "Connection Failed";
        document.getElementById('weather-description').textContent = error.message;
    }
}

function updateCurrentWeatherUI(data) {
    document.getElementById('location-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('weather-description').textContent = data.weather[0].description;
    document.getElementById('current-temp').textContent = `${Math.round(data.main.temp)}°`;
    
    document.getElementById('humidity-val').textContent = `${data.main.humidity}%`;
    document.getElementById('wind-val').textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    document.getElementById('sunrise-val').textContent = sunrise;
    document.getElementById('sunset-val').textContent = sunset;

    document.getElementById('uv-val').textContent = "N/A";
    document.getElementById('aqi-val').textContent = "Good";

    setWeatherIcon('weather-icon-main', data.weather[0].icon, true);
}

function updateForecastUI(data) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';

    const dailyData = {};
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date] && item.dt_txt.includes("12:00:00")) {
            dailyData[date] = item;
        }
    });

    Object.values(dailyData).slice(0, 7).forEach(dayData => {
        const dateObj = new Date(dayData.dt * 1000);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(dayData.main.temp);
        const iconCode = dayData.weather[0].icon;

        const card = document.createElement('div');
        card.className = 'forecast-card glass hover-scale';
        
        let iconHtml = getWeatherIconHtml(iconCode);

        card.innerHTML = `
            <span class="day">${dayName}</span>
            ${iconHtml}
            <div class="temps">
                <span class="max">${temp}°</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function getWeatherIconHtml(iconCode) {
    const iconMap = {
        '01d': '<i class="fa-solid fa-sun icon-glow-yellow"></i>',
        '01n': '<i class="fa-solid fa-moon icon-glow"></i>',
        '02d': '<i class="fa-solid fa-cloud-sun icon-glow-yellow"></i>',
        '02n': '<i class="fa-solid fa-cloud-moon icon-glow"></i>',
        '03d': '<i class="fa-solid fa-cloud icon-glow"></i>',
        '03n': '<i class="fa-solid fa-cloud icon-glow"></i>',
        '04d': '<i class="fa-solid fa-cloud icon-glow"></i>',
        '04n': '<i class="fa-solid fa-cloud icon-glow"></i>',
        '09d': '<i class="fa-solid fa-cloud-showers-heavy icon-glow-blue"></i>',
        '09n': '<i class="fa-solid fa-cloud-showers-heavy icon-glow-blue"></i>',
        '10d': '<i class="fa-solid fa-cloud-rain icon-glow-blue"></i>',
        '10n': '<i class="fa-solid fa-cloud-rain icon-glow-blue"></i>',
        '11d': '<i class="fa-solid fa-bolt icon-glow-yellow"></i>',
        '11n': '<i class="fa-solid fa-bolt icon-glow-yellow"></i>',
        '13d': '<i class="fa-solid fa-snowflake icon-glow-cyan"></i>',
        '13n': '<i class="fa-solid fa-snowflake icon-glow-cyan"></i>',
        '50d': '<i class="fa-solid fa-smog icon-glow"></i>',
        '50n': '<i class="fa-solid fa-smog icon-glow"></i>'
    };
    return iconMap[iconCode] || '<i class="fa-solid fa-cloud icon-glow"></i>';
}

function setWeatherIcon(elementId, iconCode, isLarge = false) {
    const el = document.getElementById(elementId);
    el.className = '';
    const iconHtml = getWeatherIconHtml(iconCode);
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

function renderMockData(city) {
    document.getElementById('location-name').textContent = city || DEFAULT_CITY;
    document.getElementById('weather-description').textContent = "clear sky (MOCK)";
    document.getElementById('current-temp').textContent = "24°";
    
    document.getElementById('humidity-val').textContent = "45%";
    document.getElementById('wind-val').textContent = "12.5 km/h";
    document.getElementById('uv-val').textContent = "6.2";
    document.getElementById('aqi-val').textContent = "42";
    document.getElementById('sunrise-val').textContent = "06:15 AM";
    document.getElementById('sunset-val').textContent = "07:45 PM";

    const container = document.getElementById('forecast-container');
    container.innerHTML = '';
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    days.forEach((day, index) => {
        const card = document.createElement('div');
        card.className = 'forecast-card glass hover-scale';
        const temp = 20 + Math.floor(Math.random() * 10);
        card.innerHTML = `
            <span class="day">${day}</span>
            <i class="fa-solid ${index % 2 === 0 ? 'fa-sun icon-glow-yellow' : 'fa-cloud-sun icon-glow-yellow'}"></i>
            <div class="temps">
                <span class="max">${temp}°</span>
            </div>
        `;
        container.appendChild(card);
    });
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
