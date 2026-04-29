import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {

  private urlApi = environment.apiUrl
  private publicKey = environment.publicKey;

  constructor(private http: HttpClient) {}

  async init(empresaId: string) {
    console.log('init');

    const permiso = await Notification.requestPermission();

    if (permiso !== 'granted') return;

    const registro = await navigator.serviceWorker.ready;

    try{
      const subscription = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.base64ToUint8Array(this.publicKey)
      });
      
      console.log('suscripcion', subscription)
      this.http.post(`${this.urlApi}/api/push/suscribe/${empresaId}`, {
        subscription
      }).subscribe({
        next: ()=> console.log('Suscripcion en backend'),
        error: err => console.log('err', err)
      });
    }catch (err){
      console.log('error al sus', err)
    }
  }

  private base64ToUint8Array(base64: string) {
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const base64Safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');

    const raw = atob(base64Safe);
    return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
  }
}