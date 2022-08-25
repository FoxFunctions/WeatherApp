import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Parks } from './Coordinates';




@Injectable({
  providedIn: 'root'
})
export class CoordinatesService {
userAddress : string = "New York City";
apiKey : string = "MmNmZTZlMGRjZjMyNDI2MDllNDIzZTU4ZWE4MzA3YTU6NzUyOWY3MjctYjRmMC00MzAzLThhYzAtOGFkYzIzYjJmOGM4"
latitude : number = 40.71455001831055;
longitude : number = -74.00714111328125;
  constructor(private http: HttpClient) { }
  GetCoords(): Observable<Parks>{
    return this.http.get<Parks>("https://api.myptv.com/geocoding/v1/locations/by-text?searchText="+this.userAddress+"&apiKey="+this.apiKey);
  }
}
