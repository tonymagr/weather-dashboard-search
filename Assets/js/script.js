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
let forecastIdx, windSpeed, humidPerc, foundPrev;
let reqState = false;
let reqLatLong = false;
const currDate = new Date();

//Local storage variables
let locStorArray = [];
let cityStage = {id: "", cityState: "", lat: "", long: ""};

//function definitions

//target functions

async function citySearchSubmit(event) {
  console.log("---In citySearchSubmit");
  // Prevent the default behavior
  event.preventDefault();

  cityNameInp = searchCityEl.val().trim();
  console.log("cityNameInp:",cityNameInp);
  reqLatLong = false;
  reqState = false;

  // Check for input errors

  // No city or state selected
  if (cityNameInp === "") {
    alert("No city-state selected.");
    return;
  }
  // Parse city name and state abbrev. if ", state abbrev" was entered.
  console.log("reqState:",reqState);
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
  console.log("reqState:",reqState);

  // Clear input fields
  $('input[type="text"]').val("");

  // Construct URL for city-state or just city
  console.log("reqLatLong:", reqLatLong);
  if (reqLatLong) {
    requestUrl5Day = `https://api.openweathermap.org/data/2.5/forecast/?lat=${lattitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;
  } else if (reqState) {
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
  console.log("foundPrev:", foundPrev);
  // let tblIdx = locStorArray.findIndex(function(city) {
  //   console.log("Found in prev search-,city,",city,"locStorArray:",locStorArray,"cityId:",cityId);  
  //   return city.id == cityId;
  // });
  // console.log("tblIdx:",tblIdx);
  // if (tblIdx === -1) {

  // if city was not already searched, do three or (conditionally) four things listed below:
  if (!foundPrev) {
    // 1. Add to recent searches table
    console.log("cityStage:",cityStage);
    console.log("locStorArray before push:",locStorArray);
    cityStage.id = cityId;
    cityStage.cityState = cityNameInp;
    cityStage.lat = lattitude;
    cityStage.long = longitude;
    locStorArray.push(cityStage);
    console.log("cityStage:",cityStage);
    console.log("locStorArray after push:",locStorArray);
    
    // 2. Check if one over max 
    if (locStorArray.length >= 9) {
      // Remove first (oldest) item from array
      locStorArray.shift();
      console.log("locStorArray after shift:",locStorArray);
    }
    // 3. Save updated array to storage
    localStorage.setItem("city-searches", JSON.stringify(locStorArray));
    console.log("locStorArray after setItem:",locStorArray);
    // return;

    // 4. Display previous search cityStage as buttons from array
    // renderPrevSearches();
  }
}

function renderPrevSearches () {
  console.log("---In renderPrevSearches");
  prevCitiesEL.html("");
  console.log("locStorArray in render func:", locStorArray);

  for (i = 0; i < locStorArray.length; i++) {
    let holdCityState = locStorArray[i].cityState;
    prevCitiesEL.append(`<button id="btn-${i}">${holdCityState}</button>`);
    console.log("i", i, "locStorArray[i].cityState", locStorArray[i].cityState);
    console.log("holdCityState", holdCityState);
  }
}

async function get5DayAndCurr () {
  console.log("---In get5DayAndCurr");
  await get5DayForecast();

  requestUrlCurr = `https://api.openweathermap.org/data/2.5/weather?lat=${lattitude}&lon=${longitude}&units=imperial&appid=${apiKey}`;
  await getCurrentWeath();
}

async function get5DayForecast () {
  console.log("---In get5DayForecast");
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
    cityId = data.city.id;

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
    console.log("temp array", fiveDayForecast);
  }
  catch (err) {
    console.log(`Open weather call for forecast: JSON or fetch error`);
  }
}

async function getCurrentWeath () {
  console.log("---In getCurrentWeath");
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

// // Previous searches and storage management
// // ----------------------------------------

// function searchNameFormSubmit(event) {
//   // Prevent the default behavior
//   event.preventDefault();
  
//   // Max saves reached
//   if (locStorArray.length >= 7) {
//   }

//   // Save in local storage and internal array
//   movieEntry.schName = searchName;
//   movieEntry.movTitle = mTitle;
//   movieEntry.yr = mYear;
//   movieEntry.omdbUrl = requestURL;
//   locStorArray.push(movieEntry);
  
//   localStorage.setItem("city-searches", JSON.stringify(locStorArray));

//   // Clear and call to display updated movie searches
//   renderPrevSearches();
// }

// prevSearchEl.on("click", function(event) {
//   element = event.target;

//   if (element.matches("button") && element.className.substring(10,30).trim() === "view-button") {
//     // View movie info
//     // Button IDs are in format btnx0 or btnx1 where x is the li row. Element/buttonid[3] is the 4th character.
//     i = element.id[3];
//     requestURL = locStorArray[i].omdbUrl

//     renderAllMovieData();
//   }

//   if (element.matches("button") && element.className.substring(10,30).trim() === "delete-button") {
//     // Delete saved search (li) row
//     // Button IDs are in format btnx0 or btnx1 where x is the li row. Element/buttonid[3] is the 4th character.
//     i = element.id[3];
//     locStorArray.splice(i,1);
//     // Call to remove item from local storage
//     resetLocalStorage();

//     // Redisplay form
//     renderPrevSearches();
//   }
// });

// function resetLocalStorage () {
//   // Delete local storage, to be reloaded from saved array
//   localStorage.removeItem("city-searches");

//   // Reload local storage, at present with one less row after delete button
//   for (i = 0; i < locStorArray.length; i++) {
//     movieEntry.schName = locStorArray[i].schName;
//     movieEntry.movTitle = locStorArray[i].movTitle;
//     movieEntry.yr = locStorArray[i].yr;
//     movieEntry.omdbUrl = locStorArray[i].omdbUrl;
  
//     localStorage.setItem("city-searches", JSON.stringify(locStorArray));
//   }
// }

//-----
// Main
//-----

// Retrieve city-searches array of "city-searches" objects from storage
locStorArray = JSON.parse(localStorage.getItem("city-searches"));
console.log("locStorArray after retrieve from storage", locStorArray);
if (locStorArray === null) {
  locStorArray = []
}
// Display previous search cities as buttons from array
renderPrevSearches();

citySearchEl.on("submit",citySearchSubmit);


// - Throwaway
// const requestURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state}&limit=1&appid=45dc14616eaf796db0039aab6f9100f4`;
// const requestURL = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=45dc14616eaf796db0039aab6f9100f4`;
  
// function renderPrevSearches () {
//   console.log("---In renderPrevSearches");
//   // Clear previous searches display
//   prevCitiesEL.html("");
//   console.log("locStorArray in render func:",locStorArray);
//   // prevSearchEl.addClass("strong-ovrd");  

//   // If there were any stored cities, create them in section 
//   // Initialize
//   i = 0;
//   $.each(locStorArray, function(i) {
//     prevCitiesEL.append(`<button id="btn-${i}">${locStorArray[i].cityState}</button>`);
//     console.log("i",i,"locStorArray[i].cityState",locStorArray[i].cityState);
//   })
// }