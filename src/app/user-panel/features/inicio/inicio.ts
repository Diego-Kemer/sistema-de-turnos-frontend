import { Component, computed, effect, inject, OnInit, Signal } from '@angular/core';
import { InicioDataTurnos } from '../../ui/components/inicio-data-turnos/inicio-data-turnos';
import { TurnosData } from '../../data-access/turnos-data';
import { DataTurnos } from '../../ui/interfaces/data-turnos';
import { TodaySchedule } from '../../ui/interfaces/today-schedule';
import { InicioDataSchedule } from '../../ui/components/inicio-data-schedule/inicio-data-schedule';
import { AddTurno } from "../../ui/buttons/add-turno/add-turno";
import { EmpresaStore } from '../../data-access/empresa.store';
import { UserStorage } from '../../data-access/user.storage';
import { User } from '../../ui/interfaces/user';
import { TurnosStorage } from '../../data-access/turnos.storage';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [
    InicioDataTurnos,
    InicioDataSchedule,
    AddTurno
],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  public _turnos = inject(TurnosStorage) 
  public dataSchedule: Array<TodaySchedule> = [];
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public empresa!: any;
  private _empresaS = inject(EmpresaStore);
  private _userS = inject(UserStorage);         
  public user: Signal<User | null> = this._userS.user;
  private parseFechaHora(turno: any): Date {
    return new Date(`${turno.fecha}T${turno.hora}`);
  }

  constructor() {
    effect(() => {
      const turnos = this._turnos.turnos() ?? [];

      const hoyStr = new Date().toLocaleDateString('sv-SE');
      const ahora = new Date();

      const turnosHoy = turnos.filter(t => t.fecha === hoyStr);
      const proximos = turnos.filter(t => this.parseFechaHora(t) > ahora);
      const semana = turnos.filter(t => {
        const fecha = this.parseFechaHora(t);
        const diff = (fecha.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      });

      this._turnos.setTurnosHoy(turnosHoy);
      this._turnos.setTurnosProximos(proximos);
      this._turnos.setTurnosManana(semana);
      console.log(this._turnos.turnosHoy())
    });
  }

  ngOnInit(): void {
    this.empresa = this._empresaS.empresa
  }

  dataTurnos = computed<Array<DataTurnos>>(() => {
    const turnos = this._turnos.turnos() ?? [];
    
    const cancelados = turnos.filter(t => t.estado === 'cancelado');

    return [
      {
        _id: 'upcoming',
        title: 'Próx. turnos',
        value: this._turnos.turnosProximos()?.length ?? 0,
        unit: 'turnos',
        description: 'Turnos próximos',
        color: '#3867c1',
        icon: 'calend'
      },
      {
        _id: 'today',
        title: 'Turnos hoy',
        value: this._turnos.turnosHoy()?.length ?? 0,
        unit: 'turnos',
        description: 'Agendados para hoy',
        color: '#db833c',
        icon: 'clock'
      },
      {
        _id: 'week',
        title: 'Esta semana',
        value: this._turnos.turnosManana()?.length ?? 0,
        unit: 'turnos',
        description: 'Próximos 7 días',
        color: '#6b9660',
        icon: 'chart'
      },
      {
        _id: 'cancelled',
        title: 'Cancelados',
        value: cancelados.length,
        unit: 'turnos',
        description: 'Turnos cancelados',
        color: '#d06265',
        icon: 'close'
      }
    ];
  });


   currentDate = new Date();
  selectedDate = new Date();

  daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  // Simulación: días con turnos
  daysWithEvents = [2, 5, 8, 12, 15, 21];

  get monthYear(): string {
    return this.currentDate.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric'
    });
  }

  get daysInMonth(): number[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }

  get firstDayOffset(): number {
    const firstDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1
    ).getDay();
    return (firstDay + 6) % 7; // lunes primero
  }

  prevMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
  }

  selectDay(day: number) {
    this.selectedDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      day
    );
  }

  isSelected(day: number): boolean {
    return (
      this.selectedDate.getDate() === day &&
      this.selectedDate.getMonth() === this.currentDate.getMonth() &&
      this.selectedDate.getFullYear() === this.currentDate.getFullYear()
    );
  }

  hasEvents(day: number): boolean {
    return this.daysWithEvents.includes(day);
  }

  irATurnos() {
    this.router.navigate(['../turnos'], {
      relativeTo: this.route
    });
  }
}
