import { Component, OnInit } from '@angular/core';
import { Parks } from '../Coordinates';
import { CoordinatesService } from '../coordinates.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  latitude: number = 0;
  locationData: Parks = this.GetGeoData();
  userAddress: string = "";
  longitude: number = 6;

  constructor(private coords : CoordinatesService) { }

  GetGeoData() : Parks{
    this.coords.userAddress = this.userAddress;
    this.coords.GetCoords().subscribe((response) => {
    this.locationData = response;
    this.latitude = this.locationData.locations[0].referencePosition.latitude;
    this.longitude = this.locationData.locations[0].referencePosition.longitude;
    })
    
    return this.locationData;
  }
  ngOnInit(): void {
  }

}
