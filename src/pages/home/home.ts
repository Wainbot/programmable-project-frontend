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
            duration: 2000,
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
            new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                position: latLng,
                icon: {
                    url: 'assets/imgs/direction.png',
                    scaledSize: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(30, 30)
                }
            });
            loader.dismiss();
        }, (err) => {
            console.log(err);
        });
    }
}