import './App.css';
import { useEffect, useState, useRef } from 'react';
import { useGeolocated } from 'react-geolocated';
import {FaMapMarkerAlt} from 'react-icons/fa'
import Map, {Marker} from 'react-map-gl';
import ReactGoogleAutocomplete from 'react-google-autocomplete';
import 'mapbox-gl/dist/mapbox-gl.css';

function App() {
  const [searchinput, setSearchinput] = useState("")
  const [places, setPlaces] = useState([])
  const [filteredplaces, setFilteredplaces] = useState([])
  const [mapstats, setMapstats] = useState({})
  const [mapReady, setMapReady] = useState(false)
  const mapRef = useRef(null)

  /**
   * @description This function is called when the map is ready
   * @param {Object} map - reference to the map instance
   * @param {Object} maps - reference to the maps library
   */
  const onMapLoad = ( map, event ) => {
    mapRef.current = map.target;
    console.log("map is: ", map.target)
    setMapstats({bounds: map.target.getBounds(), zoom: map.target.getZoom()})
    setMapReady(true)
  }

  const onMarkerClick = (markerid, lat, lng) => {
    console.log('This is ->', markerid)
    // inside the map instance you can call any google maps method
    mapRef.current.setCenter({ lat, lng })
    // mapRef.current.panTo(new window.google.maps.LatLng(lat, lng))
  }

  useEffect(() => {
    fetch("https://data.sfgov.org/resource/rqzj-sfat.json")
      .then(response => response.json())
      .then(data => {
        setPlaces(data)
      })
    console.log("coords are: ", coords)
  }, [])

  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
      positionOptions: {
        enableHighAccuracy: true,
      },
      userDecisionTimeout: Infinity,
    });

  const [viewport, setViewport] = useState({
    // latitude: coords ? coords.latitude : 38.8951,
    latitude: 37.773972,
    // longitude: coords ? coords.longitude : -77.0364,
    longitude: -122.431297,
    zoom: 11
  });

  useEffect(() => {
    // whenever map is changed, check to see if the latitude and longitude of each place is within the bounds of the map, display if it is
    if (mapReady) {
      const placesWithinBounds = places.filter(place => {
        // console.log("parse latitude is: ", parseFloat(place.latitude), "parse longitude is: ", parseFloat(place.longitude))
        // if (parseFloat(place.latitude) > 90
        return mapstats.bounds.contains([parseFloat(place.longitude), parseFloat(place.latitude)])
      })
      console.log("places within bounds are: ", placesWithinBounds)
      setFilteredplaces(placesWithinBounds)
    }
  }, [mapReady, mapstats, places])

  return (
    <div className="App">
      {!isGeolocationAvailable ? (
        <div>Your browser does not support Geolocation</div>
      ) : !isGeolocationEnabled ? (
        <div>Checking to see if your geolocation is enabled...</div>
      ) : coords ? (
        <div style={{ height: '100vh', width: '100%' }}>
          {/* <input id='searchbar' value={searchinput} onChange={(e) => setSearchinput(e.target.value)} placeholder='Enter Location' 
            style={{zIndex: 999}}
          /> */}
          <ReactGoogleAutocomplete
            apiKey={process.env.REACT_APP_API_KEY}
            onPlaceSelected={(place) => {
              console.log(place);
            }}
            id='searchbar'
          />
          <Map
            mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            onViewportChange={setViewport}
            onLoad={onMapLoad}
            onMoveEnd={() => {
              console.log("new zoom is: ", mapRef.current.getZoom())
              setMapstats({bounds: mapRef.current.getBounds(), zoom: mapRef.current.getZoom()})
            }}
            initialViewState={viewport}
            style={{ width: '100vw', height: '100vh' }}
            mapStyle="mapbox://styles/mapbox/streets-v9"
          >
            {filteredplaces.map((place, index) => {
              // console.log("place is: ", place)
              return (
                <Marker key={index} anchor="bottom" latitude={parseFloat(place.latitude)} longitude={parseFloat(place.longitude)}
                  style={{transform: 'none !important'}}
                  // pitchAlignment='viewport' 
                  // offset={[0, 180]}
                  // onClick={() => onMarkerClick(index, parseFloat(place.latitude), parseFloat(place.longitude))}
                >
                <FaMapMarkerAlt className='marker-icon' size={40} />
                {mapstats.zoom >= 12 && <p className='applicanttext'>{place.applicant}</p>}
              </Marker>
              )
            })}
          </Map>
        </div>
      ) : (
        <div>Getting the location data&hellip; </div>
      )}
    </div>
  );
}

export default App;
