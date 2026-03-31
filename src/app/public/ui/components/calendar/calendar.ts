import { Component, computed, EventEmitter, inject, Input, Output, Signal, signal } from '@angular/core';
import { EmpresaPublica } from '../../empresa-public.interface';
import { EmpresaPublic } from '../../../data-access/empresa-public';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  @Input({ required: true }) empresa!: EmpresaPublica;
  private servEmpPublic = inject(EmpresaPublic);
  public daySelected = signal<string | null>(null);
  public diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  hoy = new Date();

  mesActual = signal(new Date());

  diasDelMes = computed(() => {
    const date = this.mesActual();
    const year = date.getFullYear();
    const month = date.getMonth();

    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);

    const dias: (Date | null)[] = [];

    
    const inicio = primerDia.getDay();
    
    //Espacios vacíos para alinear el primer día del mes
    for(let i = 0; i < inicio; i++) {
      dias.push(null);
    }

    //Días reales
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push(new Date(year, month, i));
    }

    return dias;
  });

  esPasado(dia: Date | null) {
    if(!dia) return false;

    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    return dia < hoy;
  }

  esDiaHabil(fecha: Date | null): boolean {
    if(!fecha) return false;

    const dias = this.empresa?.diasHabiles ?? [];
    const dia = fecha.getDay();

    return dias.find(d => d.diaSemana === dia)?.habilitado ?? false;
  }


  seleccionarFecha(dia: Date | null) {
    if(!dia) return;

    if (this.esPasado(dia)) return;
    if (!this.esDiaHabil(dia)) return;
    this.daySelected.set(dia.toString());
    const fechaISO = dia.toISOString().split('T')[0];
    this.servEmpPublic.setFecha(fechaISO);
  }

  cambiarMes(offset: number) {
    const actual = this.mesActual();
    const nuevo = new Date(actual.getFullYear(), actual.getMonth() + offset, 1);
    this.mesActual.set(nuevo);
  }

}
