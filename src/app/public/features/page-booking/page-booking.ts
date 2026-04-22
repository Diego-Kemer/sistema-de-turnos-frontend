import { Component, computed, effect, ElementRef, inject, OnInit, PLATFORM_ID, signal, ViewChild } from '@angular/core';

import { EmpresaPublic } from '../../data-access/empresa-public';
import { ActivatedRoute, Router } from '@angular/router';
import { Calendar } from "../../ui/components/calendar/calendar";
import { Horario } from "../../ui/components/horario/horario";
import { ClienteForm } from "../../ui/components/cliente-form/cliente-form";
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-page-booking',
  imports: [Calendar, Horario, ClienteForm, DatePipe],
  templateUrl: './page-booking.html',
  styleUrl: './page-booking.css',
})
export class PageBooking implements OnInit{
  @ViewChild(ClienteForm) clienteForm!: ClienteForm;
  @ViewChild('formSection') formSection!: ElementRef;
  @ViewChild('horariosSection') horariosSection!: ElementRef;
  private empServ = inject(EmpresaPublic);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  slug!: string;
  empresa = this.empServ.empresa;
  public fechaSeleccionada = this.empServ.fechaSeleccionada;
  public horaSeleccionada = computed(()=> this.empServ.horaSeleccionada()?.hora)
  public fallbackDescription: string = 'Reservá tu turno online de forma rápida y sencilla. Elegí el mejor horario disponible y confirmá en segundos.';
  

  constructor() {
    effect(() => {
      const hora = this.horaSeleccionada();

      if (!hora || !this.formSection) return;

      requestAnimationFrame(() => {
        setTimeout(() => {
          const top =
            this.formSection.nativeElement.getBoundingClientRect().top +
            window.scrollY -
            20;

          window.scrollTo({
            top,
            behavior: 'smooth'
          });

          setTimeout(() => {
            this.clienteForm?.focusFirstInput();
          }, 450);
        }, 250);
      });
    });
  }
  

    ngOnInit() {
      this.slug = this.route.snapshot.paramMap.get('slug')!;
      this.empServ.cargarEmpresa(this.slug)
    }

    scrollAHorarios(){

        if (!this.horariosSection) return;

        const top = this.horariosSection.nativeElement.getBoundingClientRect().top +  window.scrollY - 20;

        window.scrollTo({
          top,
          behavior: 'smooth'
        });
  }

  irAConfirmacion(turno: any) {
    if (!turno?._id) return;

    this.router.navigate(['confirmacion', turno._id], {
      relativeTo: this.route
    });
  }

  confirmarTurno() {
    if (!this.fechaSeleccionada() || !this.horaSeleccionada()) return;

    this.clienteForm.submitForm();
  }

}
