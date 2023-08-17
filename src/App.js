import './App.css';
import { useEffect, useState, useRef, useMemo } from 'react';
import { FaTruck } from 'react-icons/fa'
import Map, { Marker, Source, Layer } from 'react-map-gl';
import ReactGoogleAutocomplete from 'react-google-autocomplete';
import ReactSwitch from 'react-switch';
import { BsSun, BsMoon } from 'react-icons/bs';
import { useTransition, animated } from 'react-spring';

function App() {
  const [places, setPlaces] = useState([])
  const [filteredplaces, setFilteredplaces] = useState([])
  const [mapstats, setMapstats] = useState({})
  const [mapReady, setMapReady] = useState(false)
  const [checked, setChecked] = useState(false);
  const mapRef = useRef();
  
  const onMapLoad = ( map, event ) => {
    mapRef.current = map.target;
    console.log("map is: ", map.target)
    setMapstats({bounds: map.target.getBounds(), zoom: map.target.getZoom()})
    setMapReady(true)
  }

  const onMarkerClick = (markerid, lat, lng) => {
    console.log('This is ->', markerid)
    // inside the map instance you can call any google maps method
    // mapRef.current.setCenter({ lat, lng })
    mapRef.current.easeTo({
      center: [lng, lat],
      duration: 2500,
      zoom: 14.5
    });
    setCurrentPlace(markerid)
  }

  useEffect(() => {
    fetch("https://data.sfgov.org/resource/rqzj-sfat.json")
      .then(response => response.json())
      .then(data => {
        setPlaces(data.filter((place) => parseFloat(place.latitude) > 0)) 
      })
  }, [])

  const markers = useMemo(() => filteredplaces.map((place, index) => (
    <Marker key={index} latitude={parseFloat(place.latitude)} longitude={parseFloat(place.longitude)}>
      <FaTruck size={20} color={checked ? "gold" : 'red'} onClick={() => onMarkerClick(place.objectid, parseFloat(place.latitude), parseFloat(place.longitude))} />
    </Marker>
  )), [checked, filteredplaces]);

  const [viewport, setViewport] = useState({ latitude: 37.773972, longitude: -122.431297, zoom: 11 });

  useEffect(() => {
    // whenever map is changed, check to see if the latitude and longitude of each place is within the bounds of the map, display if it is
    if (mapReady) {
      const placesWithinBounds = places.filter(place => {
        return mapstats.bounds.contains([parseFloat(place.longitude), parseFloat(place.latitude)])
      })
      // console.log("places within bounds are: ", placesWithinBounds)
      setFilteredplaces(placesWithinBounds)
    }
  }, [mapReady, mapstats, places])
  
  const [currentplace, setCurrentPlace] = useState(null);

  const transitions = useTransition(currentplace, {
    from: { opacity: 0, transform: 'translate3d(50%,-50%,0)'},
    enter: { opacity: 1, transform: 'translate3d(-50%,-50%,0)' },
    leave: { opacity: 0, transform: 'translate3d(-150%,-50%,0)', marginRight: '2rem' },
    // config: { duration: 30000 },
  })

  return (
    <div className="App" style={{ height: '100vh', width: '100%' }}>
      <div className='title absolute my-0 z-10 font-bold'>
        <p>San Fran Food Trucks</p>
        <ReactGoogleAutocomplete
          apiKey={process.env.REACT_APP_API_KEY}
          options={{types: ['address']}}
          onPlaceSelected={(place) => {
            console.log("place pressed is:", place);
            if (place) {
              if (place.geometry) {
                mapRef.current.easeTo({
                  center: [place.geometry.location.lng(), place.geometry.location.lat()],
                  duration: 1000, zoom: 15
                });
              } else {
                alert("Please select a valid location!")
              }
            }
          }}
          id='searchbar'
        />
      </div>
      <div id="switchparent" className='absolute top-6 z-50'>
        <ReactSwitch
          checked={checked}
          onChange={() => setChecked(!checked)}
          handleDiameter={28}
          offColor="#20232a"
          onColor="#20232a"
          offHandleColor="#5F9EA0"
          onHandleColor="#5F9EA0"
          height={40}
          width={70}
          borderRadius={6}
          activeBoxShadow="0px 0px 1px 2px #fffc35"
          uncheckedIcon={<div className="flex flex-col justify-center items-center"><BsSun size={20} color="white" /></div>}
          checkedIcon={<div className="flex flex-col justify-center items-center"><BsMoon size={20} color="white" /></div>}
          className="react-switch"
          id="small-radius-switch"
        />
      </div>
      <Map
        ref={mapRef}
        id='mainmap'
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onViewportChange={setViewport}
        onLoad={onMapLoad}
        onMoveEnd={() => {
          console.log("new zoom is: ", mapRef.current.getZoom())
          setMapstats({bounds: mapRef.current.getBounds(), zoom: mapRef.current.getZoom()})
        }}
        initialViewState={viewport}
        style={{ width: '100vw', height: '100vh' }}
        mapStyle={checked ? "mapbox://styles/mapbox/navigation-night-v1" : "mapbox://styles/mapbox/streets-v12"}
      >
        {markers}
      </Map>
      {filteredplaces.length > 0 && transitions((style, objectId) => {
        const filteredPlace = filteredplaces.find(place => place.objectid === objectId);
        if (!filteredPlace) return null;
        return (
          <animated.div id='transitiondiv' style={style} className='flex flex-col absolute left-1/2'>
            <p>{filteredPlace.applicant}</p>
            <p>{filteredPlace.address}</p>
            <p>{filteredPlace.fooditems && filteredPlace.fooditems.charAt(0).toUpperCase() + filteredPlace.fooditems.slice(1)}</p>
          </animated.div>
        );
      })}
    </div>
  );
}

export default App;