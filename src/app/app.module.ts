import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {ItineraireModal} from '../pages/itineraire/itineraire';
import {Geolocation} from '@ionic-native/geolocation';
import {StatusBar} from '@ionic-native/status-bar';
import {GoogleMaps} from '@ionic-native/google-maps';
import {SplashScreen} from '@ionic-native/splash-screen';
import {DeviceOrientation} from '@ionic-native/device-orientation';
import {HTTP} from '@ionic-native/http';

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ItineraireModal
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        ItineraireModal
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Geolocation,
        GoogleMaps,
        DeviceOrientation,
        HTTP,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {
}
