import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class VisionService {

  private http = inject(HttpClient)
  private SERVER= environments.SERVER

  private apiUrl = `${this.SERVER}/detect-objects`; // Cambia la URL si es necesario

  constructor() { }

  // Método para detectar objetos en una imagen
  detectObjects(imageUrl: string): Observable<any> {
    const params = { url: imageUrl }; // Parámetros de la solicitud
    return this.http.get<any>(this.apiUrl, { params });
  }


}
