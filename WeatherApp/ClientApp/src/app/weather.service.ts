import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CoordinatesService } from './coordinates.service';
import { WeatherNow } from './weatherRightNow';
import { Forecast } from './forecast';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  apiKey : string = "c11d3be3cc4fc21234585be8840124de";

  constructor(private http: HttpClient, private coord : CoordinatesService) { }
  GetCurrentWeather() : Observable<WeatherNow>{
    return this.http.get<WeatherNow>("https://api.openweathermap.org/data/2.5/weather?lat="+this.coord.latitude+"&lon="+this.coord.longitude+"&appid="+this.apiKey+"&units=imperial");
  }
  GetForecast() : Observable<Forecast> {
    return this.http.get<Forecast>("https://api.openweathermap.org/data/2.5/forecast?lat="+this.coord.latitude+"&lon="+this.coord.longitude+"&appid="+this.apiKey+"&units=imperial");
  }
}
