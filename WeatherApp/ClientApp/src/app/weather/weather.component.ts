import { Component, OnInit } from '@angular/core';
import { Parks } from '../Coordinates';
import { CoordinatesService } from '../coordinates.service';
import { WeatherNow } from '../weatherRightNow';
import { WeatherService } from '../weather.service';
import { Forecast } from '../forecast';


@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  latitude: number = 0;
  longitude: number = 0;
  locationData: Parks = this.GetGeoData();
  currentForecast : WeatherNow = this.GetCurrentWeather();
  userAddress: string = "";
  forecast : Forecast = this.GetForecast();
  helper : boolean = true;

  constructor(private coords : CoordinatesService, private weather: WeatherService) {
   }

  GetGeoData() : Parks{
    this.coords.userAddress = this.userAddress;
    this.coords.GetCoords().subscribe((response) => {
    this.locationData = response;
    this.latitude = this.locationData.locations[0].referencePosition.latitude;
    this.longitude = this.locationData.locations[0].referencePosition.longitude;
    this.coords.latitude = this.latitude;
    this.coords.longitude = this.longitude;
    this.GetCurrentWeather();
    this.GetForecast();
    this.helper = false;
    })
    return this.locationData;
  }
  GetCurrentWeather() : WeatherNow{
    this.weather.GetCurrentWeather().subscribe((response) => {
    this.currentForecast = response;
    })
    return this.currentForecast;
  }
  GetForecast() : Forecast{
    this.weather.GetForecast().subscribe((response) => {
    this.forecast = response;
    })
    return this.forecast;
  }
  ngOnInit(): void {
  }

}
