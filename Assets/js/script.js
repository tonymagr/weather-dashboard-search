// Weather Dashboard jQuery
// ------------------------

// element targeting
const citySearchEl = $("#city-search");
const searchCityEl = $("#search-city");

// constants
const apiKey = "2829bb7521a6e57fb0393e7a19834658";
// variables
let city, state, pos, cityNameInp, requestUrl5Day, requestUrlCurr, lattitude, longitude;
let reqState = false;

//function definitions

//target functions

function citySearchSubmit(event) {
  // Prevent the default behavior
  event.preventDefault();

  cityNameInp = searchCityEl.val().trim();

  // Check for input errors

  // No city or state selected
  if (cityNameInp === "") {
    console.log(`No city-state selected: ${cityNameInp}.`);
    return;
  } else {
    console.log(`City-state selected: ${cityNameInp}.`);
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
  console.log(city);
  if (reqState) {
    state = cityNameInp.slice(pos + 1, cityNameInp.length).trim();
    console.log(state);
  }
  // Clear input fields
  $('input[type="text"]').val("");
  // Construct URL for city-state or just city
  if (reqState) {
    requestUrl5Day = `https://api.openweathermap.org/data/2.5/forecast?q=${city},${state},USA&appid=${apiKey}`;
  } else {
    requestUrl5Day = `https://api.openweathermap.org/data/2.5/forecast?q=${city},USA&appid=${apiKey}`;
  }
  get5DayAndCurr();
}

async function get5DayAndCurr () {
  console.log("requestUrl5Day",requestUrl5Day);
  await get5DayForecast();

  requestUrlCurr = `https://api.openweathermap.org/data/2.5/weather?lat=${lattitude}&lon=${longitude}&appid=${apiKey}`;
  console.log("requestUrlCurr",requestUrlCurr);
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
    //Display result fields
    console.log(data);
    lattitude = data.city.coord.lat;
    longitude = data.city.coord.lon;
    console.log(lattitude);
    console.log(longitude);
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
  }
  catch (err) {
    console.log(`Open weather call for current day: JSON or fetch error`);
  }
}

// Main
citySearchEl.on("submit",citySearchSubmit);


// - Throwaway
// const requestURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state}&limit=1&appid=45dc14616eaf796db0039aab6f9100f4`;
// const requestURL = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=45dc14616eaf796db0039aab6f9100f4`;
  
