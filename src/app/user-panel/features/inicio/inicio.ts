import { Component, computed, effect, inject, OnInit, signal, Signal } from '@angular/core';
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
import { Turns } from '../../../shared/interfaces/turns';

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
  public proximosCinco: any = [];
  private parseFechaHora(turno: any): Date {
    return new Date(`${turno.fecha}T${turno.hora}`);
  }

  daysWithEvents = computed(() => {
    const turnos = this._turnos.turnos() ?? [];

    const dias = new Set<number>();
    const d = this.currentDate()

    const mesActual = d.getMonth();
    const anioActual = d.getFullYear();

    turnos.forEach(t => {
      const fecha = new Date(`${t.fecha}T${t.hora}`);

      const mismoMes =
        fecha.getMonth() === mesActual &&
        fecha.getFullYear() === anioActual;

      if (mismoMes) {
        dias.add(fecha.getDate());
      }
    });

    return dias; // 👈 Set
  });
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


      this.proximosCinco = (this._turnos.turnos() ?? [])
        .filter(t => this.parseFechaHora(t) > ahora)
        .sort((a, b) =>
          this.parseFechaHora(a).getTime() - this.parseFechaHora(b).getTime()
        )
        .slice(0, 5);

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


   currentDate = signal(new Date());
  selectedDate = new Date();

  daysOfWeek = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SAB', 'DOM'];

  

  get monthYear(): string {
    const d = this.currentDate();
    return d.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric'
    });
  }

  get daysInMonth(): number[] {
    const d = this.currentDate()
    const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => i + 1);
  }

  get firstDayOffset(): number {
    const d = this.currentDate()
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    return (firstDay + 6) % 7; // lunes primero
  }

  prevMonth() {
    const d = this.currentDate()
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth() {
    const d = this.currentDate()
    this.currentDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1)) 
  }

  selectDay(day: number) {
    const d = this.currentDate()
    this.selectedDate = new Date(d.getFullYear(), d.getMonth(), day);
  }

  isSelected(day: number): boolean {
    const d = this.currentDate()
    return (
      this.selectedDate.getDate() === day &&
      this.selectedDate.getMonth() === d.getMonth() &&
      this.selectedDate.getFullYear() === d.getFullYear()
    );
  }

  hasEvents(day: number): boolean {
    return this.daysWithEvents().has(day);
  }

  irATurnos() {
    this.router.navigate(['../turnos'], {
      relativeTo: this.route
    });
  }
  
}
