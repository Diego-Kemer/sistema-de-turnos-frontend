import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, ElementRef, EventEmitter, inject, Input, OnInit, Output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { EmpresaPublic } from '../../../data-access/empresa-public';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
})
export class ClienteForm implements OnInit{
  @ViewChild('inputNombre') inputNombre!: ElementRef;
  @Input() empresaId!: string;
  
  @Output() turnoCreado = new EventEmitter<any>();
  
  private servEmpPublic = inject(EmpresaPublic)
  private url_api = environment.apiUrl
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  public hora: string | null = null;
  public fecha: string | null = null;
  
  form!: FormGroup;
  
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(){
    effect(()=>{
      if(this.fecha != this.servEmpPublic.fechaSeleccionada()) this.servEmpPublic.setHora(null);
      this.fecha = this.servEmpPublic.fechaSeleccionada();
      this.hora = this.servEmpPublic.horaSeleccionada()?.hora ?? null;
    })
  }
  
  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.minLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      notas: ['']
    });
  }

  puedeEnviar = computed(() =>
    this.form.valid && this.fecha && this.hora
  );


  crearTurno() {
    if (!this.puedeEnviar()) return;

    this.loading.set(true);
    this.error.set(null);

    const payload = {
      empresaId: this.empresaId,
      fecha: this.fecha,
      hora: this.hora,
      ...this.form.value
    };

    this.http.post(`${this.url_api}/api/turnos/turno`, payload).subscribe({
      next: (res: any) => {
        console.log(res)
        this.loading.set(false);
        this.turnoCreado.emit(res.turno);
        this.form.reset();
      },
      error: (err) => {
        console.log(err)
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al crear turno');
      }
    });
  }

  submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.crearTurno();
  }

  focusFirstInput() {
    this.inputNombre?.nativeElement.focus();
  }
}
