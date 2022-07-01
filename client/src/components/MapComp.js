import React, { useEffect, useRef } from 'react'
import mapboxGl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Box } from '@mui/material'
import { useAppContext } from '../context/appContext'

mapboxGl.accessToken = 'pk.eyJ1IjoianMwMDAiLCJhIjoiY2tzZXltb2YxMTUyZDMwb2Q1d2I4ZzFnYiJ9.5qVNCSjIGDPYA1EhDHLWUw'

function Map(props) {
    const mapContainer = useRef()
    const map = useRef()
    const contextValues = useAppContext()

    useEffect(() => {       //whenever facing issues change map to map.current
        map.current = new mapboxGl.Map({
            container: mapContainer.current,
            style: props.mapStyle || 'mapbox://styles/mapbox/light-v10',
            center: contextValues.rangePointCoords.length > 0 ? contextValues.rangePointCoords : [-2, 10],
            zoom: props.zoom || 2
        })
        if (props.cluster) {
            map.current.on('load', () => {
                if (map.current.getSource('pets_shelters')) {
                    map.current.removeLayer('clusters')
                    map.current.removeLayer('cluster-count')
                    map.current.removeLayer('unclustered-point')
                    map.current.removeSource('pets_shelters')
                }
                if (map.current.getSource('polygon')) {
                    map.current.removeLayer('range-radius')
                    map.current.removeSource('polygon')
                }
                // Add a new source from our GeoJSON data and
                // set the 'cluster' option to true. GL-JS will
                // add the point_count property to your source data.
                map.current.addSource('pets_shelters', {      //Adds data (or source in mapbox terms)
                    type: 'geojson',
                    data: {
                        type: "FeatureCollection",
                        features: props.data.map((element) => {
                            if (element.species && element.shelter) {
                                return {    //Do not plot points for pets in shelters, as already plotting shelters.
                                    type: "feature",
                                    properties: {},
                                    geometry: {
                                        type: "point",
                                        coordinates: []
                                    }
                                }
                            }
                            return {
                                type: "feature",
                                properties: {
                                    name: element.name,
                                    address: element.location.address || '',
                                    description: element.location.description || '',
                                    dataType: element.species ? 'pet' : 'shelter',
                                    link: `${element.species ? 'pets' : 'shelters'}/${element._id}`
                                },
                                geometry: {
                                    type: element.location.type,
                                    coordinates: element.location.coordinates
                                }
                            }
                        })
                    },
                    cluster: true,
                    clusterMaxZoom: 14, // Max zoom to cluster points on
                    clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
                })
                map.current.addLayer({      //Adds cluster points only, from data
                    id: 'clusters',
                    type: 'circle',
                    source: 'pets_shelters',
                    filter: ['has', 'point_count'],
                    paint: {
                        // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                        // with three steps to implement three types of circles:
                        //   * Blue, 20px circles when point count is less than 100
                        //   * Yellow, 30px circles when point count is between 100 and 750
                        //   * Pink, 40px circles when point count is greater than or equal to 750
                        'circle-color': [
                            'step',
                            ['get', 'point_count'],
                            '#51bbd6',
                            100,
                            '#f1f075',
                            750,
                            '#f28cb1'
                        ],
                        'circle-radius': [
                            'step',
                            ['get', 'point_count'],
                            20,
                            100,
                            30,
                            750,
                            40
                        ]
                    }
                })
                map.current.addLayer({      //Adds text inside cluster points
                    id: 'cluster-count',
                    type: 'symbol',
                    source: 'pets_shelters',
                    filter: ['has', 'point_count'],
                    layout: {
                        'text-field': '{point_count_abbreviated}',
                        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                        'text-size': 12
                    }
                })
                map.current.addLayer({      //Adds unclustered points
                    id: 'unclustered-point',
                    type: 'circle',
                    source: 'pets_shelters',
                    filter: ['!', ['has', 'point_count']],
                    paint: {
                        'circle-color': '#11b4da',
                        'circle-radius': 4,
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#fff'
                    }
                })
                map.current.on('click', 'clusters', (e) => {        //Makes clusters interactive, unclusters them on click
                    const features = map.current.queryRenderedFeatures(e.point, {
                        layers: ['clusters']
                    })
                    const clusterId = features[0].properties.cluster_id
                    map.current.getSource('pets_shelters').getClusterExpansionZoom(
                        clusterId,
                        (err, zoom) => {
                            if (err) return

                            map.current.easeTo({
                                center: features[0].geometry.coordinates,
                                zoom: zoom
                            })
                        }
                    )
                })
                map.current.on('click', 'unclustered-point', (e) => {   //Makes individual points interactive,, display info on click
                    const coordinates = e.features[0].geometry.coordinates.slice()

                    // Ensure that if the map is zoomed out such that
                    // multiple copies of the feature are visible, the
                    // popup appears over the copy being pointed to.
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
                    }
                    new mapboxGl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(
                            `<a href=${e.features[0].properties.link} style='font-family: 'roboto', sans-serif'>${e.features[0].properties.name}</a>`
                        )
                        .addTo(map.current)
                })

                map.current.on('mouseenter', 'clusters', () => {
                    map.current.getCanvas().style.cursor = 'pointer'
                })
                map.current.on('mouseleave', 'clusters', () => {
                    map.current.getCanvas().style.cursor = ''
                })
                if (contextValues.rangePointCoords.length > 0) {
                    function createGeoJSONCircle(center, radiusInKm) {
                        let coords = {
                            latitude: center[1],
                            longitude: center[0]
                        }

                        let km = radiusInKm

                        let ret = []
                        let distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180))
                        let distanceY = km / 110.574

                        let theta, x, y
                        for (let i = 0; i < 64; i++) {
                            theta = (i / 64) * (2 * Math.PI)
                            x = distanceX * Math.cos(theta)
                            y = distanceY * Math.sin(theta)

                            ret.push([coords.longitude + x, coords.latitude + y])
                        }
                        ret.push(ret[0])

                        return {
                            "type": "geojson",
                            "data": {
                                "type": "FeatureCollection",
                                "features": [{
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "Polygon",
                                        "coordinates": [ret]
                                    }
                                }]
                            }
                        }
                    }
                    map.current.addSource("polygon", createGeoJSONCircle(contextValues.rangePointCoords, contextValues.range))
                    map.current.addLayer({
                        id: "range-radius",
                        source: "polygon",
                        type: "fill",
                        paint: {
                            "fill-color": "#8bcc8a",
                            "fill-opacity": 0.5
                        }
                    })
                }
            })
        }
        if (contextValues.rangePointCoords.length > 0)
            new mapboxGl.Marker().setLngLat(contextValues.rangePointCoords).addTo(map.current)
        else if (!props.cluster && map.current.center !== props.center) {
            const center = props.center || [-2, 10]
            map.current.setCenter(center)
            map.current.on('load', () => {
                new mapboxGl.Marker().setLngLat(map.current.getCenter()).addTo(map.current)
            })
        }
    }, [contextValues.rangePointCoords, props.data, props.center, props.cluster, props.style, props.zoom])
    //changed dependenies from contextValues.pets, contextValues.shelter to props.data

    return (
        <Box ref={mapContainer} sx={{ height: '100%' }} />
    )
}

export default Map