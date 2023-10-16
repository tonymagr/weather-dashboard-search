// Weather Dashboard jQueryn-img
// ------------------------

// element targeting
const citySearchEl = $("#city-search");
const searchCityEl = $("#search-city");
const prevCitiesEL = $("#prev-cities");

// constants and variables
const apiKey = "2829bb7521a6e57fb0393e7a19834658";
let city, state, pos, cityNameInp, requestUrl5Day, requestUrlCurr, lattitude, longitude;
let weatherDateInp, weatherDateConv, hourAdj, todayDt, iconCode, weatherIconUrl, fiveDayForecast;
let forecastIdx, windSpeed, humidPerc;
let reqState = false;
const currDate = new Date();

//function definitions

//target functions

function citySearchSubmit(event) {
  // Prevent the default behavior
  event.preventDefault();

  cityNameInp = searchCityEl.val().trim();

  // Check for input errors

  // No city or state selected
  if (cityNameInp === "") {
    alert("No city-state selected.");
    return;
  }
  // Parse city name and state abbrev. if ", state abbrev" was entered.
  pos = cityNameInp.search(",");
  if (pos === -1) {
    reqState = false;
    city = cityNameInp.slice(0, cityNameInp.length).trim();
  } else {
    reqState = true;
    city = cityNameInp.slice(0 , pos);
  }
  if (reqState) {
    state = cityNameInp.slice(pos + 1, cityNameInp.length).trim();
  }
  // Clear input fields
  $('input[type="text"]').val("");
  // Construct URL for city-state or just city
  if (reqState) {
    requestUrl5Day = `https://api.openweathermap.org/data/2.5/forecast/?q=${city},${state},USA&units=imperial&appid=${apiKey}`;
  } else {
    requestUrl5Day = `https://api.openweathermap.org/data/2.5/forecast?q=${city},USA&units=imperial&appid=${apiKey}`;
  }
  get5DayAndCurr();
}

async function get5DayAndCurr () {
  await get5DayForecast();

  requestUrlCurr = `https://api.openweathermap.org/data/2.5/weather?lat=${lattitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;
  getCurrentWeath();
}

async function get5DayForecast () {
  try {
    const response = await fetch(requestUrl5Day);
    const data = await response.json();
    if (!response.ok) {
      console.log(`Open weather call for forecast: ${response.statusText}`);
      return;
    }
    //Access result fields
    console.log(data);
    lattitude = data.city.coord.lat;
    longitude = data.city.coord.lon;

    // Load 5-Day Forecast array
    // "hourAdj = Math.ceil(currDate.getHours() / 3) - 1"  explained:
    //                         Depending on user's hour of day, set hour adjuster to find Noon of 
    //                         forecast days.
    // "(i + 1) * 8 - hourAdj"  explained:  8 temp data items are returned per day in 3-hour increments.
    //                         Want daily Noon temp, which is found offset by hour adjuster.

    hourAdj = Math.ceil(currDate.getHours() / 3) - 1;
    console.log("hourAdj:", hourAdj);
    //Initialize forecast array
    fiveDayForecast = [];
   
    //Populate forecast array and cards on page
    for (let i = 0; i < 5; i++) {
      forecastIdx = (i + 1) * 8 - hourAdj;
      forecastTemp = data["list"][forecastIdx]["main"]["temp"];
      weatherDateInp = data["list"][forecastIdx]["dt_txt"];
      console.log("weatherDateInp:", weatherDateInp);
      weatherDateConv = new Date(weatherDateInp).toLocaleDateString("en-US");
      iconCode = data["list"][forecastIdx]["weather"]["0"]["icon"];
      console.log(i,iconCode);
      windSpeed = data["list"][forecastIdx]["wind"]["speed"];
      humidPerc = data["list"][forecastIdx]["main"]["humidity"];
      fiveDayForecast.push({temp: forecastTemp,
                            date: weatherDateConv,
                            icon: iconCode,
                            wind: windSpeed,
                            humidity: humidPerc
      });

      // Initialize card and display on page
      let forecastDayEl = $(`#forecast-day-${i}`);

      forecastDayEl.html("");
      forecastDayEl.append(`<h5>${weatherDateConv}</h5>`);
      weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
      forecastDayEl.append(`<img class="icon-size" src=${weatherIconUrl}>`);
      forecastDayEl.append(`<p>Temp: ${forecastTemp}&deg</p>`);
      forecastDayEl.append(`<p>Wind: ${windSpeed} MPH</p>`);
      forecastDayEl.append(`<p>Humidity: ${humidPerc}%</p>`);
    }
    console.log("temp array", fiveDayForecast);
  }
  catch (err) {
    console.log(`Open weather call for forecast: JSON or fetch error`);
  }
}

async function getCurrentWeath () {
  try {
    const response = await fetch(requestUrlCurr);
    const data = await response.json();
    if (!response.ok) {
      console.log(`Open weather call for current day: ${response.statusText}`);
      return;
    }
    //Display result fields
    console.log(data);
    todayDt = currDate.toLocaleDateString("en-US");
    $("#city-date").html(`${data.name} (${todayDt})`);
    iconCode = data["weather"]["0"]["icon"];
    weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    $("#curr-icon-img").attr("src", weatherIconUrl);
    $("#curr-temp").html(`Temp: ${data.main.temp}&deg`);
    $("#curr-wind").html(`Wind: ${data.wind.speed} MPH`);
    $("#curr-humidity").html(`Humidity: ${data.main.humidity}%`);

  }
  catch (err) {
    console.log(`Open weather call for current day: JSON or fetch error`);
  }
}

// Main
citySearchEl.on("submit",citySearchSubmit);

// Append blank section in aside below query box. Take away if there is history
prevCitiesEL.append(`<section class="height-300 border-top"></section>`);


// - Throwaway
// const requestURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state}&limit=1&appid=45dc14616eaf796db0039aab6f9100f4`;
// const requestURL = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=45dc14616eaf796db0039aab6f9100f4`;
  
