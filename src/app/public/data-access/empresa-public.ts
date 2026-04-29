import { effect, EventEmitter, inject, Injectable, Output, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { EmpresaPublica } from '../ui/empresa-public.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Turns } from '../../shared/interfaces/turns';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmpresaPublic {
  private _fechaSeleccionada = signal<string | null>(null);
  private _horaSeleccionada = signal<any | null>(null);
  private _empresa = signal<EmpresaPublica | null>(null);
  private _turnos = signal<any[]>([]);
  private API_URL: string = environment.apiUrl
  private http = inject(HttpClient);
  private primaryColor = signal('#0f27ff');
  private document = inject(DOCUMENT);
  horariosPorFecha = signal<Record<string, string[]>>({});


  constructor() {
    effect(() => {
      const empresa = this._empresa();

      if (!empresa) return;

      this.document.documentElement.style.setProperty(
        '--color-principal',
        this.primaryColor()
      );
    });
  }



  empresa = this._empresa.asReadonly();
  fechaSeleccionada = this._fechaSeleccionada.asReadonly();
  horaSeleccionada = this._horaSeleccionada.asReadonly();
  turnos = this._turnos.asReadonly()


  cargarEmpresa(slug: string) {
    return this.http.get<EmpresaPublica>(`${this.API_URL}/api/empresa/public/${slug}`)
      .subscribe((emp: any) => {
        this._empresa.set(emp.emp); 
        this.setPrimaryColor(emp.emp.colorTema);
      });
  }

  traerTurnos(empresaId: string){
    return this.http.get<Turns[]>(`${this.API_URL}/api/turnos/${empresaId}`)
  }

  obtenerHorarios(empresaId: string, fecha: string): Observable<any>{
    return this.http.get<any>(`${this.API_URL}/api/turnos/disponibles/${empresaId}/${fecha}`)
  }
  setFecha(fecha: string) {
    this._fechaSeleccionada.set(fecha);
  }

  setHora(data: any) {
    this._horaSeleccionada.set(data);
  }

  setTurnos(turnos: Turns[]){
    this._turnos.set(turnos)
  }

  setPrimaryColor(color?: string) {
    this.primaryColor.set(color || '#3867c1');
  }
}
