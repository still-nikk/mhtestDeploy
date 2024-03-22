mapboxgl.accessToken = 'pk.eyJ1Ijoia2V3YWwyMTA1IiwiYSI6ImNsdTA1NXoyMTA3aWkyaW13OHNqZ2h4bDQifQ.JqrilNyDxi9flLHowJlH3w';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [73.8567, 18.5204],
      zoom: 11
    });

    var geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    });

    geocoder.on('result', function(e) {
      x = e.result;
      y = x.center;
      var z = y[0]+','+y[1];
      console.log(z)
      new mapboxgl.Marker()
    .setLngLat(e.result.geometry.coordinates)
    .addTo(map);
      // Store the result somewhere, e.g., in a global variable or send to a server
    });

    
    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));