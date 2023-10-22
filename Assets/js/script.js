// Weather Dashboard jQueryn-img
// ------------------------

// element targeting
const citySearchEl = $("#city-search");
const searchCityEl = $("#search-city");
const prevCitiesEL = $("#prev-cities");

// constants and variables
const apiKey = "2829bb7521a6e57fb0393e7a19834658";
let i, city, state, pos, cityNameInp, requestUrl5Day, requestUrlCurr, lattitude, longitude, cityId;
let weatherDateInp, weatherDateConv, hourAdj, todayDt, iconCode, weatherIconUrl, fiveDayForecast;
let forecastIdx, windSpeed, humidPerc, foundPrev, idxFirstButton, elemIdShift, responseStatus;
let reqState = false;
const currDate = new Date();

//Local storage variables
let locStorArray = [];
let cityStage = {id: "", cityState: "", lat: "", long: ""};

//function declarations

//target functions

prevCitiesEL.on("click", async function(event) {
  // Prevent the default behavior of refreshing form immediately
  element = event.target;

  if (element.matches("button")) {
    // Adjust array index lookup by number of button list shifts (idxFirstButton) after reaching max buttons
    elemIdShift = element.id.substring(4,5) - idxFirstButton;
    lattitude = locStorArray[elemIdShift].lat;
    longitude = locStorArray[elemIdShift].long;
    requestUrl5Day = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lattitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;
    
    // Call to display current and forecast weather with saved lat and long
    await get5DayAndCurr();
  }
});

async function citySearchSubmit(event) {
  // Prevent the default behavior of refreshing form immediately
  event.preventDefault();

  cityNameInp = searchCityEl.val().trim();
  reqState = false;

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

  await get5DayAndCurr();

  // Check if this city was already searched; 
  foundPrev = false;

  for (i = 0; i < locStorArray.length; i++) {
    if (!foundPrev && cityId === locStorArray[i].id) {
      foundPrev = true;
    }
  }
  
  // if city was not already searched, do four or (conditionally) five things listed below:
  if (!foundPrev) {
    // 1. Add to recent searches table
    cityStage.id = cityId;
    cityStage.cityState = cityNameInp;
    cityStage.lat = lattitude;
    cityStage.long = longitude;
    locStorArray.push(cityStage);
    
    // 2a and 2b. Check if one over max - should be at most 8 buttons at one time
    if (locStorArray.length >= 9) {
      // a. Remove item 0 (oldest item) from array
      locStorArray.shift();
      // a. Remove first (oldest) button from page
      $(`#btn-${idxFirstButton}`).remove();
      idxFirstButton++;
    }
  
    // 3. Save updated array to storage
    localStorage.setItem("city-searches", JSON.stringify(locStorArray));

    // 4. Add new button to end of list
    // Index is new last item in array, length - 1. Adjust by idxFirstButton which tracks # of shifts
    i = locStorArray.length - 1 + idxFirstButton;
    prevCitiesEL.append(`<button id="btn-${i}">${cityStage.cityState}</button>`);

    // 5. Reinitialize stage record for reuse
    cityStage = {id: "", cityState: "", lat: "", long: ""};

    // Create and append button
  }
}

function renderPrevSearches () {
  // Clear section and identify first button as 0 on refresh
  prevCitiesEL.html("");
  idxFirstButton = 0;

  // Build button list on page
  for (i = 0; i < locStorArray.length; i++) {
    let holdCityState = locStorArray[i].cityState;
    prevCitiesEL.append(`<button id="btn-${i}">${holdCityState}</button>`);
  }
}

async function get5DayAndCurr () {
  await get5DayForecast();

  if (responseStatus === 200) {
    requestUrlCurr = `https://api.openweathermap.org/data/2.5/weather?lat=${lattitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;
    await getCurrentWeath();
  }
}

async function get5DayForecast () {
  try {
    const response = await fetch(requestUrl5Day);
    const data = await response.json();
    responseStatus = response.status;
    if (!response.ok) {
      console.log(`Open weather call for 5 day forecast: ${response.statusText}`);
      alert(`Requested city not found: ${cityNameInp}. Message: ${response.statusText}`);
      return;
    }
    //Access result fields
    lattitude = data.city.coord.lat;
    longitude = data.city.coord.lon;
    cityId = data.city.id;

    // Load 5-Day Forecast array
    // "hourAdj = Math.ceil(currDate.getHours() / 3) - 1"  explained:
    //                         Depending on user's hour of day, set hour adjuster to find Noon of 
    //                         forecast days.
    // "(i + 1) * 8 - hourAdj"  explained:  8 temp data items are returned per day in 3-hour increments.
    //                         Want daily Noon temp, which is found offset by hour adjuster.

    hourAdj = Math.ceil(currDate.getHours() / 3) - 1;
    //Initialize forecast array
    fiveDayForecast = [];
   
    //Populate forecast array and cards on page
    for (i = 0; i < 5; i++) {
      forecastIdx = (i + 1) * 8 - hourAdj;
      forecastTemp = data["list"][forecastIdx]["main"]["temp"];
      weatherDateInp = data["list"][forecastIdx]["dt_txt"];
      weatherDateConv = new Date(weatherDateInp).toLocaleDateString("en-US");
      iconCode = data["list"][forecastIdx]["weather"]["0"]["icon"];
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
  }
  catch (err) {
    console.log(`Open weather call for forecast: JSON or fetch error`);
  }
}

async function getCurrentWeath () {
  try {
    const response = await fetch(requestUrlCurr);
    const data = await response.json();
    responseStatus = response.status;
    if (!response.ok) {
      console.log(`Open weather call for current day: ${response.statusText}`);
      alert(`Requested city not found: ${cityNameInp}. Message: ${response.statusText}`);
      return;
    }
    //Display result fields
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

//------------------------
// Executes on start-up
//------------------------

// Retrieve city-searches array of "city-searches" objects from storage
locStorArray = JSON.parse(localStorage.getItem("city-searches"));
if (locStorArray === null) {
  locStorArray = []
}
// Display previous search cities as buttons from array
renderPrevSearches();

// Await submit
citySearchEl.on("submit",citySearchSubmit);
