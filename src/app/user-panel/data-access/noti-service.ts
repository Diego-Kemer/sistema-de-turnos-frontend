import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotiService {

  private http = inject(HttpClient);
  private url = environment.apiUrl;
  
  getNotificaciones(empresaId: string) {
    return this.http.get<any[]>(`${this.url}/api/notificaciones/${empresaId}`);
  }

  marcarLeida(id: string) {
    return this.http.put(`${this.url}/api/notificaciones/${id}`, {});
  }
}
