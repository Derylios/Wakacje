//Przycisk uruchamiajacy panel z lista obektow w zasiegu widoku mapy
$(document).ready(function(){
    $("#zasiegbutton").click(function(){
    $(".map-overlay").slideToggle("slow");
    });
  });
  
// eslint-disable-next-line no-unused-vars
mapboxgl.accessToken = 'pk.eyJ1Ijoia3J6eXphayIsImEiOiJjam5jdmdzbWIyM3hyM3ZtbGIyZnV3aWYwIn0.AFENpSzlRwtosUI1efT5ow';
    const map = new mapboxgl.Map({
    container: 'map', // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/krzyzak/ck5cmlmj209541coa3kle30og', // style URL
    center: [26.130,50.306], // starting position [lng, lat]
    zoom: 4, // starting zoom
    projection: 'globe' // display the map as a 3D globe
    });

const config = {
  
  CSV:'https://derylios.github.io/Wakacje/wycieczki.csv',//'./wycieczki.csv',
  
  //funkcja Filtry
  filters: [
    {
      type: 'dropdown',
      title: 'Rok: ',
      columnHeader: 'rok', // nazwa kolumny w CSV
      listItems: [ //tu dadac lata
        '2020',
        '2021',
        '2022',
        '2023'
      ],
    },

    {
      type: 'checkbox',
      title: 'Wycieczki: ',
      columnHeader: 'nazwa', // nazwa kolumny w CSV 
      listItems: ['Na codzien', 'Krakow', 'Solina', 'Praga', 'Wroclaw'],//dodać nazwy wycieczki
    }, // ListItems - Case sensitive - must match spreadsheet entry; This will take up to six inputs but is best used with a maximum of three;
  ],
  
};

let geojsonData = {};
const filteredGeojson = {
  type: 'FeatureCollection',
  features: [],
};

// Holds visible wycieczki features for filtering
let wycieczki = [];
 
// Create a popup, but don't add it to the map yet.
const popups = new mapboxgl.Popup({
closeButton: false
});
 
const filterEl = document.getElementById('feature-filter');
const listingEl = document.getElementById('feature-listing');
 
function renderListings(features) {
    const empty = document.createElement('p');
    // Clear any existing listings
    listingEl.innerHTML = '';
    if (features.length) {
        for (const feature of features) {
            const itemLink = document.createElement('a');
            const label = `${feature.properties.nazwa} (${feature.properties.data})`;
            itemLink.href = feature.properties.adres2;
            itemLink.target = '_blank';
            itemLink.textContent = label;
            itemLink.addEventListener('mouseover', () => {
                // Highlight corresponding feature on the map
                popups
                .setLngLat(feature.geometry.coordinates)
                .setText(label)
                .addTo(map);
            });
            listingEl.appendChild(itemLink);
        }
        
        // Show the filter input
        filterEl.parentNode.style.display = 'block';
    } else if (features.length === 0 && filterEl.value !== '') {
        empty.textContent = 'pusto';
        listingEl.appendChild(empty);
    } else {
        empty.textContent = 'Przybliż do pojedyńczych punktów';
        listingEl.appendChild(empty);
    }
}
 
function normalize(string) {
return string.trim().toLowerCase();
}
 
// Because features come from tiled vector data,
// feature geometries may be split
// or duplicated across tile boundaries.
// As a result, features may appear
// multiple times in query results.
function getUniqueFeatures(features, comparatorProperty) {
    const uniqueIds = new Set();
    const uniqueFeatures = [];
    for (const feature of features) {
    const id = feature.properties[comparatorProperty];
    if (!uniqueIds.has(id)) {
        uniqueIds.add(id);
        uniqueFeatures.push(feature);
    }
    }
    return uniqueFeatures;
}


// Build dropdown list function
// title - the name or 'category' of the selection e.g. 'Languages: '
// defaultValue - the default option for the dropdown list
// listItems - the array of filter items

function buildDropDownList(title, listItems) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('div');
  filterTitle.innerText = title;
  filterTitle.classList.add('center', 'flex-parent', 'py12', 'txt-bold');
  mainDiv.appendChild(filterTitle);

  const selectContainer = document.createElement('div');
  selectContainer.classList.add('select-container', 'center');

  const dropDown = document.createElement('select');
  dropDown.classList.add('select', 'filter-option');

  const selectArrow = document.createElement('div');
  selectArrow.classList.add('select-arrow');

  const firstOption = document.createElement('option');

  dropDown.appendChild(firstOption);
  selectContainer.appendChild(dropDown);
  selectContainer.appendChild(selectArrow);
  mainDiv.appendChild(selectContainer);

  for (let i = 0; i < listItems.length; i++) {
    const opt = listItems[i];
    const el1 = document.createElement('option');
    el1.textContent = opt;
    el1.value = opt;
    dropDown.appendChild(el1);
  }
  filtersDiv.appendChild(mainDiv);
}

// Build checkbox function
// title - the name or 'category' of the selection e.g. 'Languages: '
// listItems - the array of filter items


function buildCheckbox(title, listItems) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('div');
  const formatcontainer = document.createElement('div');
  filterTitle.classList.add('center', 'flex-parent', 'py12', 'txt-bold');
  formatcontainer.classList.add(
    'center',
    'flex-parent',
    'flex-parent--column',
    'px3',
    'flex-parent--space-between-main',
  );
  const secondLine = document.createElement('div');
  secondLine.classList.add(
    'center',
    'flex-parent',
    'py12',
    'px3',
    'flex-parent--space-between-main',
  );
  filterTitle.innerText = title;
  mainDiv.appendChild(filterTitle);
  mainDiv.appendChild(formatcontainer);

  for (let i = 0; i < listItems.length; i++) {
    const container = document.createElement('label');

    container.classList.add('checkbox-container');

    const input = document.createElement('input');
    input.classList.add('px12', 'filter-option');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', listItems[i]);
    input.setAttribute('value', listItems[i]);

    const checkboxDiv = document.createElement('div');
    const inputValue = document.createElement('p');
    inputValue.innerText = listItems[i];
    checkboxDiv.classList.add('checkbox', 'mr6');
    checkboxDiv.appendChild(Assembly.createIcon('check'));

    container.appendChild(input);
    container.appendChild(checkboxDiv);
    container.appendChild(inputValue);

    formatcontainer.appendChild(container);
  }
  filtersDiv.appendChild(mainDiv);
}

const selectFilters = [];
const checkboxFilters = [];

function createFilterObject(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      checkboxFilters.push(keyValues);
    }
    if (filter.type === 'dropdown') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      selectFilters.push(keyValues);
    }
  });
}

function applyFilters() {
  const filterForm = document.getElementById('filters');

  filterForm.addEventListener('change', function () {
    const filterOptionHTML = this.getElementsByClassName('filter-option');
    const filterOption = [].slice.call(filterOptionHTML);

    const geojSelectFilters = [];
    const geojCheckboxFilters = [];

    filteredGeojson.features = [];

    filterOption.forEach((filter) => {
      if (filter.type === 'checkbox' && filter.checked) {
        checkboxFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojCheckboxFilters.push(geojFilter);
            }
          });
        });
      }
      if (filter.type === 'select-one' && filter.value) {
        selectFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojSelectFilters.push(geojFilter);
            }
          });
        });
      }
    });

    if (geojCheckboxFilters.length === 0 && geojSelectFilters.length === 0) {
      geojsonData.features.forEach((feature) => {
        filteredGeojson.features.push(feature);
      });
    } else if (geojCheckboxFilters.length > 0) {
      geojCheckboxFilters.forEach((filter) => {
        geojsonData.features.forEach((feature) => {
          if (feature.properties[filter[0]].includes(filter[1])) {
            if (
              filteredGeojson.features.filter(
                (f) => f.properties.id === feature.properties.id,
              ).length === 0
            ) {
              filteredGeojson.features.push(feature);
            }
          }
        });
      });
      if (geojSelectFilters.length > 0) {
        const removeIds = [];
        filteredGeojson.features.forEach((feature) => {
          let selected = true;
          geojSelectFilters.forEach((filter) => {
            if (
              feature.properties[filter[0]].indexOf(filter[1]) < 0 &&
              selected === true
            ) {
              selected = false;
              removeIds.push(feature.properties.id);
            } else if (selected === false) {
              removeIds.push(feature.properties.id);
            }
          });
        });
        let uniqueRemoveIds = [...new Set(removeIds)];
        uniqueRemoveIds.forEach(function (id) {
          const idx = filteredGeojson.features.findIndex(
            (f) => f.properties.id === id,
          );
          filteredGeojson.features.splice(idx, 1);
        });
      }
    } else {
      geojsonData.features.forEach((feature) => {
        let selected = true;
        geojSelectFilters.forEach((filter) => {
          if (
            !feature.properties[filter[0]].includes(filter[1]) &&
            selected === true
          ) {
            selected = false;
          }
        });
        if (
          selected === true &&
          filteredGeojson.features.filter(
            (f) => f.properties.id === feature.properties.id,
          ).length === 0
        ) {
          filteredGeojson.features.push(feature);
        }
      });
    }

    map.getSource('locationData').setData(filteredGeojson);
  });
}

function filters(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      buildCheckbox(filter.title, filter.listItems);
    } else if (filter.type === 'dropdown') {
      buildDropDownList(filter.title, filter.listItems);
    }
  });
}

function removeFilters() {
  const input = document.getElementsByTagName('input');
  const select = document.getElementsByTagName('select');
  const selectOption = [].slice.call(select);
  const checkboxOption = [].slice.call(input);
  filteredGeojson.features = [];
  checkboxOption.forEach((checkbox) => {
    if (checkbox.type === 'checkbox' && checkbox.checked === true) {
      checkbox.checked = false;
    }
  });

  selectOption.forEach((option) => {
    option.selectedIndex = 0;
  });

  map.getSource('locationData').setData(geojsonData);
  buildLocationList(geojsonData);
}
//funkcja przycisku removefilters w module filtry
function removeFiltersButton() {
  const removeFilter = document.getElementById('removeFilters');
  removeFilter.addEventListener('click', () => {
    removeFilters();
  });
}
//dodanie funkcji przycisku przylizajacego do wybranych punktow na mapie w module filtry
function ZoomToButton() {
document.getElementById('zoomToButton').addEventListener('click', () => {
  const bounds = getBoundsForPoints(filteredGeojson.features);
  map.fitBounds(bounds, { padding: 50 });
});
}
//dodanie funkcji przycisku przylizajacego do wszystkich punktow na mapie w module filtry
function ZoomToAllButton() {
document.getElementById('zoomToAllButton').addEventListener('click', () => {
  const bounds = getBoundsForPoints(geojsonData.features);
  map.fitBounds(bounds, { padding: 50 });
});
}

createFilterObject(config.filters);
applyFilters();
filters(config.filters);
removeFiltersButton();
ZoomToButton();
ZoomToAllButton();


//dodanie danych z csv csv
map.on('load', () => {
  map.setFog({}); // Set the default atmosphere style
  // csv2geojson - following the Sheet Mapper tutorial https://www.mapbox.com/impact-tools/sheet-mapper
  console.log('loaded');
  $(document).ready(() => {
    console.log('ready');
    $.ajax({
      type: 'GET',
      url: config.CSV,
      dataType: 'text',
      success: function (csvData) {
        makeGeoJSON(csvData);
      },
      error: function (request, status, error) {
        console.log(request);
        console.log(status);
        console.log(error);
      },
    });
  });

  function makeGeoJSON(csvData) {
    csv2geojson.csv2geojson(
      csvData,
      {
        latfield: 'latitude',
        lonfield: 'longitude',
        delimiter: ';',
      },
      (err, data) => {
        data.features.forEach((data, i) => {
          data.properties.id = i;
        });

        geojsonData = data;
        // Add the the layer to the map
        map.addLayer({
          id: 'locationData',
          type: 'circle',
          source: {
            type: 'geojson',
            data: geojsonData,
            cluster: true,
            clusterMaxZoom: 40, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
          },
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [  //'#3D2E5D', // color of circles
              'step',
              ['get', 'point_count'],
              '#6a3d9a',
              5,
              '#cab2d6',
              15,
              '#ff7f00',
              35,
              '#fdbf6f',
              50,
              '#e31a1c',
              100,
              '#fb9a99',
              200,
              '#33a02c',
              400,
              '#b2df8a',
              700,
              '#1f78b4',
              1000,
              '#a6cee3',
              ],
            'circle-radius': [  //5, // size of circles
              'step',
              ['get', 'point_count'],
              10,
              5,
              15,
              50,
              20,
              100,
              25,
              200,
              35,
              400,
              45,
              1000,
              60
            ],
            //'circle-stroke-color': 'white',
            //'circle-stroke-width': 1,
            //'circle-opacity': 0.7,
          },
        });

        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'locationData',
          filter: ['has', 'point_count'],
          layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
          }
        });
          
         map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: {
            type: 'geojson',
            data: geojsonData,
            cluster: true,
            //clusterMaxZoom: 14, // Max zoom to cluster points on
            //clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
          },
          filter: ['!', ['has', 'point_count']],
          paint: {
          'circle-color': '#81A8E6',
          'circle-radius': 5,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
          }
        });

        // inspect a cluster on click
map.on('click', 'locationData', (e) => {
const features = map.queryRenderedFeatures(e.point, {
layers: ['locationData']
});
const clusterId = features[0].properties.cluster_id;
map.getSource('locationData').getClusterExpansionZoom(
  clusterId,
(err, zoom) => {
  if (err) return;

map.easeTo({
center: features[0].geometry.coordinates,
zoom: zoom
});
}
);
});
 
// When a click event occurs on a feature in
// the unclustered-point layer, open a popup at
// the location of the feature, with
// description HTML from its properties.

map.on('click', 'unclustered-point', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const nazwa = e.features[0].properties.nazwa;
    const godzina = e.features[0].properties.godz;
    const Rok = e.features[0].properties.rok;
    const data = e.features[0].properties.data;
    const przycisk = e.features[0].properties['adres2'];
    //e.features[0].properties.adres2
    // upewnienie sie, ze popup wyswietla sie nad zaznaczonym obiektem
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    
// Ensure that if the map is zoomed out such that
// multiple copies of the feature are visible, the
// popup appears over the copy being pointed to.
//while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
//coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
//};
 
new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML("<h2><center><strong>"+nazwa+'</strong></center></h2><center><h1><center><strong>'+data+"</strong></center></h1><h3><center><strong>"+godzina+"</strong></center></h3><img src="+e.features[0].properties['adres']+' width=auto height=auto/></center><center><a href="'+przycisk+'" target=_blank role=button class="btn btn-primary btn-pop col-6 mx-auto" title="Wczytaj zdjęcie" >Link</a></center>')
      .addTo(map);
      flyToLocation(e.features[0].geometry.coordinates);
     
  });
 
map.on('mouseenter', 'locationData', () => {
map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'locationData', () => {
map.getCanvas().style.cursor = '';
});

map.on('mouseenter', 'unclustered-point', () => {
map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'unclustered-point', () => {
map.getCanvas().style.cursor = '';
});
      },
    );
}

map.on('moveend', () => {
const features = map.queryRenderedFeatures({ layers: ['unclustered-point'] });
 
if (features) {
const uniqueFeatures = getUniqueFeatures(features, 'id');
// Populate features for the listing overlay.
renderListings(uniqueFeatures);
 
// Clear the input container
filterEl.value = '';
 
// Store the current features in sn `layer` variable to
// later use for filtering on `keyup`.
wycieczki = uniqueFeatures;
}
});
 
map.on('mousemove', 'locationData', (e) => {
// Change the cursor style as a UI indicator.
map.getCanvas().style.cursor = 'pointer';
});
 
map.on('mouseleave', 'locationData', () => {
map.getCanvas().style.cursor = '';
popup.remove();
});
 
filterEl.addEventListener('keyup', (e) => {
const value = normalize(e.target.value);
 
// Filter visible features that match the input value.
const filtered = [];
for (const feature of wycieczki) {
const name = normalize(feature.properties.nazwa);
const code = normalize(feature.properties.rok);
if (name.includes(value) || code.includes(value)) {
filtered.push(feature);
}
}
 
// Populate the sidebar with filtered results
renderListings(filtered);
 
// Set the filter to populate features into the layer.
if (filtered.length) {
map.setFilter('locationData', [
'match',
['get', 'id'],
filtered.map((feature) => {
return feature.properties.nazwa;
}),
true,
false
]);
}
});
 
// Call this function on initialization
// passing an empty array to render an empty state
renderListings([]);
});

function transformRequest(url) {
  const isMapboxRequest =
    url.slice(8, 22) === 'api.mapbox.com' ||
    url.slice(10, 26) === 'tiles.mapbox.com';
  return {
    url: isMapboxRequest ? url.replace('?', '?pluginName=finder&') : url,
  };
}


 //skala  
 var scale = new mapboxgl.ScaleControl({
          maxWidth: 100,
          unit: 'imperial'
        });
        map.addControl(scale);
        scale.setUnit('metric');


        // Add the control to the map.
        var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
        });
        
        document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

//Funkcja wyszukjąca i przyblizajca do wybranych punktow
const getBoundsForPoints = (points) => {
  const pointsLong = points.map(point => point.geometry.coordinates[0])
  const pointsLat = points.map(point => point.geometry.coordinates[1])
  const cornersLongLat = [
    [Math.min(...pointsLong), Math.min(...pointsLat)],
    [Math.max(...pointsLong), Math.max(...pointsLat)]
  ]
  return cornersLongLat;
}

//Tworzenie miejsca z przyciskami nawigacyjnymi
class MapboxGLButtonControl {
  constructor({
    className = "",
    title = "",
    eventHandler = evtHndlr
  }) {
    this._className = className;
    this._title = title;
    this._eventHandler = eventHandler;
  }

  onAdd(map) {
    this._btn = document.createElement("button");
    this._btn.className = "mapboxgl-ctrl-icon" + " " + this._className;
    this._btn.type = "button";
    this._btn.title = this._title;
    this._btn.onclick = this._eventHandler;

    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

/* Event Handlers */
function one(event) {
  console.log();
            // Add your custom logic here
            const bounds = getBoundsForPoints(filteredGeojson.features);
            map.fitBounds(bounds, { padding: 40 });
}

function two(event) {
  console.log();
            // Add your custom logic here
            const bounds = getBoundsForPoints(geojsonData.features);
            map.fitBounds(bounds, { padding: 40 });
}

const ctrlZoom = new MapboxGLButtonControl({
  className: "mapbox-gl-zoom-to",
  title: "zbliz do szukanych",
  eventHandler: one
});

const ctrlReZoom = new MapboxGLButtonControl({
  className: "mapbox-gl-restart-zoom",
  title: "wszystkie punkty",
  eventHandler: two
});
/* Add Controls to the Map */
map.addControl(new mapboxgl.NavigationControl(), "top-right");
map.addControl(new mapboxgl.FullscreenControl(), "top-right");
map.addControl(ctrlZoom, "top-right");
map.addControl(ctrlReZoom, "top-right");
// Add geolocate control to the map.
map.addControl(
new mapboxgl.GeolocateControl({
positionOptions: {
enableHighAccuracy: true
},
// When active the map will receive updates to the device's location as it changes.
trackUserLocation: true,
// Draw an arrow next to the location dot to indicate which direction the device is heading.
showUserHeading: true
})
);
