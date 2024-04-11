const temp = document.getElementById("temp"),
    date = document.getElementById("date-time"),
    condition = document.getElementById("condition"),
    rain = document.getElementById("rain"),
    mainIcon = document.getElementById("icon"),
    currentLocation = document.getElementById("location"),
    uvIndex = document.querySelector(".uv-index"),
    uvText = document.querySelector(".uv-text"),
    windSpeed = document.querySelector(".wind-speed"),
    sunRise = document.querySelector(".sun-rise"),
    sunSet = document.querySelector(".sun-set"),
    humidity = document.querySelector(".humidity"),
    visibilty = document.querySelector(".visibilty"),
    humidityStatus = document.querySelector(".humidity-status"),
    windDirection = document.querySelector(".wind-direction"),
    windDirectionStatus = document.querySelector(".wind-direction-status"),
    visibilityStatus = document.querySelector(".visibilty-status"),
    searchForm = document.querySelector("#search"),
    search = document.querySelector("#query"),
    celciusBtn = document.querySelector(".celcius"),
    fahrenheitBtn = document.querySelector(".fahrenheit"),
    tempUnit = document.querySelectorAll(".temp-unit"),
    hourlyBtn = document.querySelector(".hourly"),
    weekBtn = document.querySelector(".week"),
    weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
    let now = new Date(),
        hour = now.getHours(),
        minute = now.getMinutes();

    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    // 12 hours format
    hour = hour % 12;
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    let dayString = days[now.getDay()];
    return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
    date.innerText = getDateTime();
}, 1000);

// function to get public ip address
// function to get public ip address
function getPublicIpAndWeather() {
    fetch("https://geolocation-db.com/json/", {
        method: "GET",
        headers: {},
    })
        .then((response) => response.json())
        .then((data) => {
            currentCity = data.city;
            getWeatherData(data.city, currentUnit, hourlyorWeek);
        })
        .catch((err) => {
            console.error(err);
            // In case of error, default to a specific location or show an error message.
            // For example:
            // alert("Failed to fetch your location. Defaulting to a predefined location.");
            getWeatherData("Dehmi Kalan , Jaipur", currentUnit, hourlyorWeek);
        });
}

// Call the function to get the user's location and weather data
getPublicIpAndWeather();


// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
    const apiKey = "MACU3CZA2UDEFXJHHFJYAYDV6";
    fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}&contentType=json`,
        {
            method: "GET",
            headers: {},
        }
    )
        .then((response) => response.json())
        .then((data) => {
            let today = data.currentConditions;
            if (unit === "c") {
                temp.innerText = today.temp;
            } else {
                temp.innerText = celciusToFahrenheit(today.temp);
            }
            currentLocation.innerText = data.resolvedAddress;
            condition.innerText = today.conditions;
            if(today.precip)
            {
                rain.innerText = "Precipitation - " + today.precip + "%";
            }
            else{
                rain.innerText = "Precipitation - " + 0 + "%";
            }
            uvIndex.innerText = today.uvindex;
            windSpeed.innerText = today.windspeed;
            measureUvIndex(today.uvindex);
            mainIcon.src = getIcon(today.icon);
            changeBackground(today.icon);
            humidity.innerText = today.humidity + "%";
            updateHumidityStatus(today.humidity);
            visibilty.innerText = today.visibility;
            updateVisibiltyStatus(today.visibility);
            windDirection.innerText = today.winddir;
            updatewindDirectionStatus(today.winddir);
            if (hourlyorWeek === "hourly") {
                updateForecast(data.days[0].hours, unit, "day");
            } else {
                updateForecast(data.days, unit, "week");
            }
            sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
            sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
        })
        .catch((err) => {
            alert("City not found in our database");
        });
}

//function to update Forecast
function updateForecast(data, unit, type) {
    weatherCards.innerHTML = "";
    let day = 0;
    let numCards = 0;
    if (type === "day")
    {
        numCards = 24;
        for (let i = 0; i < numCards; i++) {
            let card = document.createElement("div");
            card.classList.add("card");
            let dayName = getHour(data[day].datetime);
            if (type === "week") {
                dayName = getDayName(data[day].datetime);
            }
            let dayTemp = data[day].temp;
            if (unit === "f") {
                dayTemp = celciusToFahrenheit(data[day].temp);
            }
            let iconCondition = data[day].icon;
            let iconSrc = getIcon(iconCondition);
            let tempUnit = "°C";
            if (unit === "f") {
                tempUnit = "°F";
            }
            card.innerHTML = `
                    <h2 class="day-name">${dayName}</h2>
                <div class="card-icon">
                  <img src="${iconSrc}" class="day-icon" alt="" />
                </div>
                <div class="day-temp">
                  <h2 class="temp">${dayTemp}</h2>
                  <span class="temp-unit">${tempUnit}</span>
                </div>`;
            weatherCards.appendChild(card);
            day++;
        }
    } 
    else
    {
        numCards = 7;
        for (let i = 0; i < numCards; i++) {
            let card = document.createElement("div");
            card.classList.add("card");
            let dayName = getHour(data[day].datetime);
            if (type === "week") {
                dayName = getDayName(data[day].datetime);
            }
            let dayTemp = data[day].temp;
            let minDayTemp = data[day].tempmin;
            let maxDayTemp = data[day].tempmax;
            if (unit === "f") {
                minDayTemp = celciusToFahrenheit(data[day].tempmin);
                maxDayTemp = celciusToFahrenheit(data[day].tempmax);
            }
            let iconCondition = data[day].icon;
            let iconSrc = getIcon(iconCondition);
            let tempUnit = "°C";
            if (unit === "f") {
                tempUnit = "°F";
            }
            card.innerHTML = `
                    <h2 class="day-name">${dayName}</h2>
                <div class="card-icon">
                  <img src="${iconSrc}" class="day-icon" alt="" />
                </div>
                <div class="day-temp">
                    <h2 class="temp">${minDayTemp}</h2>
                    <span class="temp-unit">${tempUnit}</span>
                </div>
                <div class="day-temp">
                    <h2 class="temp">${maxDayTemp}</h2>
                    <span class="temp-unit">${tempUnit}</span>
                </div>`;
            weatherCards.appendChild(card);
            day++;
        }
    }
    
}

// function to change weather icons
function getIcon(condition) {
    if (condition === "partly-cloudy-day") {
        return "./icons/sun/27.png";
    } else if (condition === "partly-cloudy-night") {
        return "./icons/moon/15.png";
    } else if (condition === "rain") {
        return "./icons/rain/39.png";
    } else if (condition === "clear-day") {
        return "./icons/sun/26.png";
    } else if (condition === "clear-night") {
        return "./icons/moon/10.png";
    } else {
        return "./icons/sun/26.png";
    }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
    const body = document.querySelector("body");
    let bg = "";
    if (condition === "partly-cloudy-day") {
        bg = "./images/pc.jpg";
    } else if (condition === "partly-cloudy-night") {
        bg = "./images/pcn.jpg";
    } else if (condition === "rain") {
        bg = "./images/rain.jpg";
    } else if (condition === "clear-day") {
        bg = "./images/cd.jpg";
    } else if (condition === "clear-night") {
        bg = "./images/cn.jpg";
    } else {
        bg = "./images/pc.jpg";
    }
    body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
    let hour = time.split(":")[0];
    let min = time.split(":")[1];
    if (hour > 12) {
        hour = hour - 12;
        return `${hour}:${min} PM`;
    } else {
        return `${hour}:${min} AM`;
    }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
    let hour = time.split(":")[0];
    let minute = time.split(":")[1];
    let ampm = hour >= 12 ? "pm" : "am";
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    hour = hour < 10 ? "0" + hour : hour;
    let strTime = hour + ":" + minute + " " + ampm;
    return strTime;
}

// function to get day name from date
function getDayName(date) {
    let day = new Date(date);
    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
    if (uvIndex <= 2) {
        uvText.innerText = "Low";
    } else if (uvIndex <= 5) {
        uvText.innerText = "Moderate";
    } else if (uvIndex <= 7) {
        uvText.innerText = "High";
    } else if (uvIndex <= 10) {
        uvText.innerText = "Very High";
    } else {
        uvText.innerText = "Extreme";
    }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
    if (humidity <= 30) {
        humidityStatus.innerText = "Low";
    } else if (humidity <= 60) {
        humidityStatus.innerText = "Moderate";
    } else {
        humidityStatus.innerText = "High";
    }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
    if (visibility <= 0.03) {
        visibilityStatus.innerText = "Dense Fog";
    } else if (visibility <= 0.16) {
        visibilityStatus.innerText = "Moderate Fog";
    } else if (visibility <= 0.35) {
        visibilityStatus.innerText = "Light Fog";
    } else if (visibility <= 1.13) {
        visibilityStatus.innerText = "Very Light Fog";
    } else if (visibility <= 2.16) {
        visibilityStatus.innerText = "Light Mist";
    } else if (visibility <= 5.4) {
        visibilityStatus.innerText = "Very Light Mist";
    } else if (visibility <= 10.8) {
        visibilityStatus.innerText = "Clear Air";
    } else {
        visibilityStatus.innerText = "Very Clear Air";
    }
}

// function to get wind direction status
function updatewindDirectionStatus(windDirection) {
    if (windDirection <= 90) {
        windDirectionStatus.innerText = "North";
    } else if (windDirection <= 180) {
        windDirectionStatus.innerText = "East";
    } else if (windDirection <= 270) {
        windDirectionStatus.innerText = "South";
    } else if (windDirection <= 360) {
        windDirectionStatus.innerText = "West";
    }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let location = search.value;
    if (location) {
        currentCity = location;
        getWeatherData(location, currentUnit, hourlyorWeek);
    }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
    return ((temp * 9) / 5 + 32).toFixed(1);
}

fahrenheitBtn.addEventListener("click", () => {
    changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
    changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
    if (currentUnit !== unit) {
        currentUnit = unit;
        tempUnit.forEach((elem) => {
            elem.innerText = `°${unit.toUpperCase()}`;
        });
        if (unit === "c") {
            celciusBtn.classList.add("active");
            fahrenheitBtn.classList.remove("active");
        } else {
            celciusBtn.classList.remove("active");
            fahrenheitBtn.classList.add("active");
        }
        getWeatherData(currentCity, currentUnit, hourlyorWeek);
    }
}

hourlyBtn.addEventListener("click", () => {
    changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
    changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
    if (hourlyorWeek !== unit) {
        hourlyorWeek = unit;
        if (unit === "hourly") {
            hourlyBtn.classList.add("active");
            weekBtn.classList.remove("active");
        } else {
            hourlyBtn.classList.remove("active");
            weekBtn.classList.add("active");
        }
        getWeatherData(currentCity, currentUnit, hourlyorWeek);
    }
}
