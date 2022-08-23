import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Parks } from './Coordinates';




@Injectable({
  providedIn: 'root'
})
export class CoordinatesService {
userAddress : string = "";
apiKey : string = "MmNmZTZlMGRjZjMyNDI2MDllNDIzZTU4ZWE4MzA3YTU6NzUyOWY3MjctYjRmMC00MzAzLThhYzAtOGFkYzIzYjJmOGM4"
  constructor(private http: HttpClient) { }
  GetCoords(): Observable<Parks>{
    return this.http.get<Parks>("https://api.myptv.com/geocoding/v1/locations/by-text?searchText="+this.userAddress+"&apiKey="+this.apiKey);
  }
}
