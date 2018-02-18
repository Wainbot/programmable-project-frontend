import {Component, ViewChild} from '@angular/core';
import {NavController, LoadingController, ModalController, ToastController, Loading, Platform} from 'ionic-angular';
import {GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions} from '@ionic-native/google-maps';
import {DeviceOrientation, DeviceOrientationCompassHeading} from '@ionic-native/device-orientation';
import {Geolocation} from '@ionic-native/geolocation';
import {ItineraireModal} from '../itineraire/itineraire';
import {HTTP} from '@ionic-native/http';

@Component({
    selector: 'home-page',
    templateUrl: 'home.html'
})

export class HomePage {
    @ViewChild('map') mapElement;

    map: GoogleMap;
    position: { lat: number; lng: number };
    loader: Loading;
    // problems: [{}];

    constructor(public navCtrl: NavController,
                public geolocation: Geolocation,
                public loadingCtrl: LoadingController,
                public modalCtrl: ModalController,
                public toastCtrl: ToastController,
                public platform: Platform,
                public deviceOrientation: DeviceOrientation,
                public http: HTTP) {

        this.position = {
            lat: 43.6157669,
            lng: 7.0724593
        }
    }

    ionViewDidLoad() {
        this.loader = this.loadingCtrl.create({
            spinner: 'crescent',
            content: 'Chargement...'
        });
        this.loader.present();
        this.platform.ready().then(() => {
            try {
                this.geolocation.getCurrentPosition({timeout: 2000, enableHighAccuracy: true, maximumAge: 0})
                    .then((p) => {
                        this.position = {
                            lat: p.coords.latitude,
                            lng: p.coords.longitude
                        };
                        let mapOptions: GoogleMapOptions = {
                            'controls': {
                                'compass': false,
                                'myLocationButton': true,
                                'indoorPicker': true,
                                'zoom': false
                            },
                            'gestures': {
                                'scroll': false,
                                'tilt': true,
                                'rotate': true,
                                'zoom': false
                            },
                            'camera': {
                                'target': this.position,
                                'zoom': 19,
                                'tilt': 999,
                                'bearing': 0
                            }
                        };

                        // MAP
                        this.map = GoogleMaps.create(this.mapElement.nativeElement, mapOptions);
                        this.map.one(GoogleMapsEvent.MAP_READY)
                            .then(() => {
                                this.map.setMyLocationEnabled(true);
                                this.loader.dismiss();

                                // Geolocation
                                this.geolocation.watchPosition({enableHighAccuracy: true, maximumAge: 0})
                                    .subscribe((p) => {
                                        this.position = {
                                            lat: p.coords.latitude,
                                            lng: p.coords.longitude
                                        };
                                        // change position in map
                                        this.map.animateCamera({'target': this.position, 'duration': 100});
                                    });

                                // Orientation
                                this.deviceOrientation.watchHeading({frequency: 100})
                                    .subscribe((data: DeviceOrientationCompassHeading) => {
                                        if (data.trueHeading !== null) {
                                            this.map.setCameraBearing(data.trueHeading);
                                        }
                                    });

                                // get accidents from position
                                this.getAccidents();
                            });
                    })
                    .catch((error) => alert(error));
            } catch (error) {
                alert(error);
            }
        });
    }

    openItineraire() {
        let modal = this.modalCtrl.create(ItineraireModal);
        modal.present();
    }

    addAccident() {
        this.http.post(
            'https://gestion-accident.herokuapp.com/accidents',
            {
                latitude: this.position.lat,
                longitude: this.position.lng,
                nombre: 0,
                commentaires: '',
                gravite: 0,
                lieu: ''
            },
            {})
            // .then(data => {
                // alert(JSON.stringify(data.data));
            // })
            // .catch(error => {
                // alert(JSON.stringify(error.error));
            // });
    }

    getAccidents() {
        this.http.get('https://gestion-accident.herokuapp.com/accidents/' + this.position.lat + '/' + this.position.lng, {}, {})
            .then(data => {
                this.map.clear();
                // this.problems = [];
                // alert(JSON.stringify(data.data));
                let accidents = JSON.parse(data.data);
                if (accidents.length > 0) {
                    accidents.forEach((accident) => {
                        // this.problems.push(accident);

                        let accidentPosition = {lat: accident.latitude, lng: accident.longitude};

                        this.map.addCircle({
                            'center': accidentPosition,
                            'radius': 15,
                            'strokeColor': '#9e392a',
                            'strokeWidth': 5,
                            'fillColor': '#e74c3c',
                            'opacity': 0.5
                        });

                        // this.map.addMarker({
                        //     'map': this.map,
                        //     'position': accidentPosition
                        // });
                    });
                }

                let hideFooterTimeout = setTimeout(() => {
                    this.getAccidents();
                }, 2000);
            })
            .catch(error => {
                // console.log(error.status);
                // console.log(error.error); // error message as string
                // console.log(error.headers);
                // alert(error.error);
            });
    }
}