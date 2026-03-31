import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { EmpresaPublic } from '../../../data-access/empresa-public';

@Component({
  selector: 'app-confirmacion',
  imports: [],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.css',
})
export class Confirmacion {
  private servEmp = inject(EmpresaPublic);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private url_api = environment.apiUrl

  turno = signal<any>(null);
  loading = signal(true);
  error = signal(false);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const turnoId = params.get('turnoId');

      if (!turnoId) {
        this.error.set(true);
        this.loading.set(false);
        return;
      }

      this.cargarTurno(turnoId);
    });
  }

  cargarTurno(id: string) {
    this.http.get(`${this.url_api}/api/turnos/turno/${id}`)
      .subscribe({
        next: (res: any) => {
          this.turno.set(res);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        }
      });
  }

  descargarPDF() {
    const turnoId = this.turno()?._id;
    if (!turnoId) return;

    window.open(
      `${this.url_api}/api/turnos/turno/${turnoId}/comprobante`,
      '_blank'
    );
  }

  volverInicio() {
    this.servEmp.setFecha('')
    const slug = this.route.snapshot.paramMap.get('slug');
    this.router.navigate(['/res/', slug]);
  }

}
