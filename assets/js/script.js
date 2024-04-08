$(document).ready(function() {
    const apiKey = '8c44f04932903a2a2fdf19c1771884c8';
    
    displaySearchHistory();
    // Function to fetch latitude and longitude for the given city
    function fetchCoordinates(city) {
        const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

        $.ajax({
            url: geocodeUrl,
            method: 'GET',
            success: function(response) {
                if (response && response.length > 0) {
                    const lat = response[0].lat;
                    const lon = response[0].lon;
                    fetchWeather(lat, lon); // Fetch weather using the obtained coordinates
                    fetchForecast(lat, lon); // Fetch forecast using the obtained coordinates
                    updateSearchHistory(city);
                } else {
                    alert('City not found. Please try another search.');
                }
            },
            error: function() {
                alert('Failed to fetch location data. Please try again.');
            }
        });
    }

    // Function to fetch and display current weather using latitude and longitude
    function fetchWeather(lat, lon) {
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        $.ajax({
            url: currentWeatherUrl,
            method: 'GET',
            success: function(response) {
                // Display current weather
                $('#current-weather').html(`
                    <h3>Current Weather for ${response.name} (${new Date().toLocaleDateString()})</h3>
                    <p>Temperature: ${response.main.temp}°C</p>
                    <p>Humidity: ${response.main.humidity}%</p>
                    <p>Wind Speed: ${response.wind.speed}m/s</p>
                    <img src="http://openweathermap.org/img/wn/${response.weather[0].icon}.png" alt="Weather Icon">
                `);
            },
            error: function() {
                alert('Failed to fetch current weather. Please check the coordinates and try again.');
            }
        });
    }

    // Function to fetch and display the 5-day weather forecast using latitude and longitude
    function fetchForecast(lat, lon) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        $.ajax({
            url: forecastUrl,
            method: 'GET',
            success: function(response) {
                let forecastHtml = '<h3>5-Day Forecast</h3><div class="row">';

                response.list.forEach((entry, index) => {
                    if(index % 8 === 0) { // Assuming data comes every 3 hours, 8 data points represent one day
                        forecastHtml += `
                            <div class="col">
                                <h5>${new Date(entry.dt_txt).toLocaleDateString()}</h5>
                                <img src="http://openweathermap.org/img/wn/${entry.weather[0].icon}.png" alt="Weather Icon">
                                <p>Temp: ${entry.main.temp}°C</p>
                                <p>Humidity: ${entry.main.humidity}%</p>
                            </div>
                        `;
                    }
                });

                forecastHtml += '</div>';
                $('#forecast-weather').html(forecastHtml);
            },
            error: function() {
                alert('Failed to fetch forecast data. Please check the coordinates and try again.');
            }
        });
    }
    function updateSearchHistory(city) {
        let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        if (!history.includes(city)) {
            history.push(city);
            localStorage.setItem('searchHistory', JSON.stringify(history));
        }
        displaySearchHistory();
    }

    // Display search history from localStorage
    function displaySearchHistory() {
        let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        $('#search-history').empty(); // Assuming you have an element with id="search-history"
        history.forEach(city => {
            $('#search-history').append(`<button class="btn btn-light history-item d-flex flex-column mb-2" data-city="${city}">${city}</button>`);
        });
    }

    // Event listener for the search button
    $('#search-btn').click(function() {
        const city = $('#city-input').val().trim();
        if(city !== '') {
            fetchCoordinates(city);
        }
    });

    // Event listener for search history items
    $(document).on('click', '.history-item', function() {
        const city = $(this).attr('data-city');
        fetchCoordinates(city);
    });
});