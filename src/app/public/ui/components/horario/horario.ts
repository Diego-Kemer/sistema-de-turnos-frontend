import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { EmpresaPublic } from '../../../data-access/empresa-public';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-horario',
  imports: [DatePipe],
  templateUrl: './horario.html',
  styleUrl: './horario.css',
})
export class Horario{
  @Input() empresaId!: string;
  @Output() horariosListos = new EventEmitter<void>();


  private servEmpPublic = inject(EmpresaPublic)

  private url_api = environment.apiUrl
  private lastFecha: string = ''
  public fecha!: string;

  horarios = signal<any[]>([]);
  loading = signal(false);
  seleccion = signal<string | null>(null);

  constructor(private http: HttpClient) {
    
    effect(() => {
      const fecha = this.servEmpPublic.fechaSeleccionada();
      if (!fecha || !this.empresaId) return;
      if (fecha === this.lastFecha) return;

      this.lastFecha = fecha;
      this.seleccion.set(null);
      this.fecha = fecha;
      this.cargarHorarios();
    });
    
  }

  cargarHorarios() {
    this.loading.set(true);
    this.servEmpPublic.obtenerHorarios(this.empresaId, this.fecha).subscribe({
      next: (res) => {
        this.horarios.set(res);
        this.loading.set(false);

        this.horariosListos.emit();
      },
      error: () => {
        this.horarios.set([]);
        this.loading.set(false);
      }
    });
  }

  horariosConEstado = computed(() => {
    const horarios = this.horarios(); // ['09:30', '10:00', etc]
    const fecha = this.servEmpPublic.fechaSeleccionada();
    const turnos = this.servEmpPublic.turnos(); // turnos ya tomados

    if (!fecha) return [];

    const ahora = new Date();

    return horarios.map(hora => {
      const fechaHora = this.parseFechaHora(fecha, hora);

      const esPasado = fechaHora < ahora;

      const estaOcupado = turnos.some(
        t => t.fecha === fecha && t.hora === hora
      );

      return {
        hora,
        disabled: esPasado || estaOcupado
      };
    });
  });

  seleccionarHora(hora: string) {
    this.seleccion.set(hora);
    const data = {fecha: this.fecha, hora}
    this.servEmpPublic.setHora(data);
  }

  private parseFechaHora(fecha: string, hora: string): Date {
    const [y, m, d] = fecha.split('-');
    const [h, min] = hora.split(':');

    return new Date(+y, +m - 1, +d, +h, +min);
  }

}
