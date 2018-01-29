import {Component} from '@angular/core';
import {ViewController} from 'ionic-angular';

@Component({
    selector: 'itineraire-page',
    templateUrl: 'itineraire.html'
})
export class ItineraireModal {

    constructor(public viewCtrl: ViewController) {

    }
    dismiss() {
        this.viewCtrl.dismiss();
    }
}