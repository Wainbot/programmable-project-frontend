import {Component, ViewChild, ElementRef} from '@angular/core';
import {NavController, LoadingController, ModalController, ToastController} from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { ItineraireModal } from '../itineraire/itineraire';

declare var google;

@Component({
    selector: 'home-page',
    templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild('map') mapElement: ElementRef;
    map: any;

    constructor(public navCtrl: NavController, public geolocation: Geolocation, public loadingCtrl: LoadingController, public modalCtrl: ModalController, public toastCtrl: ToastController) {

    }

    ionViewDidLoad() {
        this.loadMap();
    }

    openItineraire() {
        let modal = this.modalCtrl.create(ItineraireModal);
        modal.present();
    }

    addAccident(){
        new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            position: this.map.getCenter(),
        });
        let toast = this.toastCtrl.create({
            message: 'Accident ajouté',
            duration: 3000,
            dismissOnPageChange: true,
            cssClass: "toast-accident",
            position: 'top'
        });
        toast.present();
    }

    loadMap() {
        let loader = this.loadingCtrl.create({
            spinner: 'crescent',
            content: 'Chargement...'
        });
        loader.present();
        this.geolocation.getCurrentPosition().then((position) => {
            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            let mapOptions = {
                center: latLng,
                zoom: 17,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };
            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
            // mapboxgl.accessToken = 'pk.eyJ1Ijoid2FpbmJvdCIsImEiOiJjamN6dnhycDgyY2htMnBvNXo0NTd5d3lqIn0.iOErKmorD8us28LNPyXadg';

            // let map = new mapboxgl.Map({
            //     container: 'map',
            //     style: 'mapbox://styles/mapbox/light-v9',
            //     center: [position.coords.longitude, position.coords.latitude],
            //     zoom: 15
            // });

            // let geojson = {
            //     type: 'FeatureCollection',
            //     features: [{
            //         type: 'Feature',
            //         geometry: {
            //             type: 'Point',
            //             coordinates: [-77.032, 38.913]
            //         },
            //         properties: {
            //             title: 'Mapbox',
            //             description: 'Washington, D.C.'
            //         }
            //     },
            //         {
            //             type: 'Feature',
            //             geometry: {
            //                 type: 'Point',
            //                 coordinates: [-122.414, 37.776]
            //             },
            //             properties: {
            //                 title: 'Mapbox',
            //                 description: 'San Francisco, California'
            //             }
            //         }]
            // };

            // add markers to map
            // geojson.features.forEach(function(marker) {
            //     let el = document.createElement('div');
            //     el.className = 'marker';
            //     new mapboxgl.Marker(el)
            //         .setLngLat(marker.geometry.coordinates)
            //         .addTo(map);
            // });

            loader.dismiss();
        }, (err) => {
            console.log(err);
        });
    }
}