import {Component, ViewChild} from '@angular/core';
import {NavController, LoadingController, ModalController, ToastController, Loading, Platform} from 'ionic-angular';
import {GoogleMaps, GoogleMap, GoogleMapsEvent, GoogleMapOptions, LatLng} from '@ionic-native/google-maps';
import {DeviceOrientation, DeviceOrientationCompassHeading} from '@ionic-native/device-orientation';
import {Geolocation} from '@ionic-native/geolocation';
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
    oldAccidents;
    bouchonLoader = false;
    bouchonAccident = false;
    bouchonTravaux = false;
    accidentPopup = false;
    voteYesLoader = false;
    voteNonLoader = false;

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
        };

        this.oldAccidents = [];
        this.accidentPopup = false;
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

    addAccident(message, gravite) {
        this.http.post(
            'https://gestion-accident.herokuapp.com/accidents',
            {
                latitude: this.position.lat,
                longitude: this.position.lng,
                nombre: 1,
                commentaires: message,
                gravite: gravite,
                lieu: ''
            },
            {})
            .then(data => {
                let toast = this.toastCtrl.create({
                    message: 'Incident déclaré !',
                    duration: 2000,
                    dismissOnPageChange: true,
                    cssClass: "toast-accident",
                    position: 'top'
                });
                toast.present();
                this.bouchonLoader = false;
                this.bouchonTravaux = false;
                this.bouchonAccident = false;
            });
    }

    getAccidents() {
        this.http.get('https://gestion-accident.herokuapp.com/accidents/' + this.position.lat + '/' + this.position.lng, {}, {})
            .then(data => {
                this.map.clear();

                let accidents = JSON.parse(data.data);
                let notSameAccidents = [];

                if (accidents.length > 0) {
                    if (this.oldAccidents.length > 0) {
                        notSameAccidents = accidents.filter((newA) => {
                            return !this.oldAccidents.find((oldA) => {
                                return newA.longitude == oldA.longitude && newA.latitude == oldA.latitude;
                            });
                        });
                    } else {
                        notSameAccidents = accidents;
                    }
                }

                if (notSameAccidents.length > 0) {
                    let message = notSameAccidents.length + ' nouveaux incidents se trouvent sur votre route';
                    if (notSameAccidents.length == 1) {
                        message = notSameAccidents.length + ' nouvel incident se trouve sur votre route';
                    }
                    let toast = this.toastCtrl.create({
                        message: message,
                        duration: 4000,
                        dismissOnPageChange: true,
                        cssClass: "toast-accident",
                        position: 'top'
                    });
                    toast.present();
                }

                this.oldAccidents = accidents;

                if (accidents.length > 0) {
                    accidents.forEach((accident) => {
                        let accidentPosition = {lat: accident.latitude, lng: accident.longitude};

                        this.map.addCircle({
                            'center': accidentPosition,
                            'radius': 16,
                            'strokeColor': '#9e392a',
                            'strokeWidth': 1,
                            'fillColor': 'rgb(158, 57, 42, 0.1)',
                            'clickable': true
                        }).then(circle => {
                            circle.on(GoogleMapsEvent.CIRCLE_CLICK)
                                .subscribe((position: LatLng) => {
                                    this.accidentPopup = accidents.find((b) => {
                                        return (Math.abs(parseInt(position[0].lng) - parseInt(b.longitude)) < 0.001) && (Math.abs(parseInt(position[0].lat) - parseInt(b.latitude)) < 0.001);
                                    });
                                    if (typeof this.accidentPopup === 'undefined' || this.accidentPopup === null) {
                                        this.accidentPopup = false;
                                    } else {
                                        this.accidentPopup['gravitePerc'] = (parseInt(this.accidentPopup['gravite']) * 10) + '%';
                                    }
                                });
                        });
                    });
                }

                setTimeout(() => {
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

    vote(accident, YesNo) {
        if (YesNo) {
            accident.oui++;
        } else {
            accident.non++;
        }
        this.http.put(
            'https://gestion-accident.herokuapp.com/accidentsC',
            {
                latitude: accident.latitude,
                longitude: accident.longitude,
                nombre: accident.nombre,
                commentaires: accident.commentaires,
                gravite: accident.gravite,
                lieu: accident.lieu,
                gps: accident.gps,
                oui: accident.oui,
                non: accident.non
            },
            {})
            .then(data => {
                this.voteYesLoader = false;
                this.voteNonLoader = false;
                this.accidentPopup = false;
                let toast = this.toastCtrl.create({
                    message: 'Merci d\'avoir voté !',
                    duration: 2000,
                    dismissOnPageChange: true,
                    cssClass: "toast-accident",
                    position: 'top'
                });
                toast.present();
            })
            .catch(error => alert(JSON.stringify(error)));
    }
}