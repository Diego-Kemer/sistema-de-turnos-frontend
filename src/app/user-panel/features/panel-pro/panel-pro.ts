import { Component, inject, NgZone, OnInit, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet, RouterLinkActive } from "@angular/router";
import { GeneralData } from '../../data-access/general-data';
import { AuthStorage } from '../../../auth/data-access/auth-storage';
import { EmpresaStore } from '../../data-access/empresa.store';
import { EmpresaInterface } from '../../ui/interfaces/empresa.interface';
import { UserStorage } from '../../data-access/user.storage';
import { TurnosData } from '../../data-access/turnos-data';
import { defer, switchMap, tap } from 'rxjs';
import { TurnosStorage } from '../../data-access/turnos.storage';
import { User } from '../../ui/interfaces/user';
import { NotificacionesService } from '../../../core/services/notificaciones-service';
import { NotiService } from '../../data-access/noti-service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-panel-pro',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, DatePipe],
  templateUrl: './panel-pro.html',
  styleUrl: './panel-pro.css',
})
export class PanelPro implements OnInit{
  private router = inject(Router);
  private routeAct = inject(ActivatedRoute)
  private storageServ = inject(AuthStorage)
  private data = inject(GeneralData)
  private turnosData = inject(TurnosData)
  private turnosStorage = inject(TurnosStorage)
  private id: string | null = '';
  private empresaStorage = inject(EmpresaStore);
  public _empresa!: Signal<EmpresaInterface | null>;
  private userStorage = inject(UserStorage)
  public user: Signal<User | null> = this.userStorage.user
  public menuOpen: boolean = false;
  public abierto = signal(false);
  public servNoti = inject(NotificacionesService)
  private notiService = inject(NotiService);
  private ngZone: NgZone = inject(NgZone)
  notificaciones: any[] = [];
  noLeidas = 0;
  mostrar = false;
  animar = false;
  toastMensaje = '';
  mostrarToast = false;

  private toastTimeout: any = null;




  
  ngOnInit(): void {
    this.routeAct.paramMap.subscribe(param=>{
      this.id = param.get('id')
    })


    this.data.getMe(this.id).pipe(
      tap(res=>{
        this.empresaStorage.setEmpresa(res.empresa)
        this.userStorage.setUser(res.user)
      }),
      switchMap(res=> this.turnosData.getTurns(res.empresa._id)))
      .subscribe(turnos=>{
        this.turnosStorage.setTurnos(turnos)
      })
      
      this._empresa = this.empresaStorage.empresa
      this.servNoti.init(this._empresa()?._id ?? '');

      this.cargarNotificaciones();

    navigator.serviceWorker.ready.then(reg => {
      navigator.serviceWorker.onmessage = (event: MessageEvent) => {
         this.ngZone.run(() => {
           if (event.data?.type === 'NUEVA_NOTIFICACION') {
             this.cargarNotificaciones();
             this.animarCampanita();
   
             this.mostrarNotificacionUI(event.data.mensaje);
           }
         })
      };
    });
  }

  animarCampanita() {
    this.animar = true;

    setTimeout(() => {
      this.animar = false;
    }, 600);
  }


  logout() {
    this.storageServ.removeToken()
    this.empresaStorage.clear();
    this.router.navigate(['/auth']);
  }


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  cargarNotificaciones() {
    this.notiService.getNotificaciones(this._empresa()?._id ?? '')
      .subscribe(data => {
        this.notificaciones = data.slice(0, 10);
        this.noLeidas = data.filter(n => !n.leida).length;
      });
  }

  toggle() {
    this.mostrar = !this.mostrar;
  }

  marcarLeida(n: any) {
    if (n.leida) return;

    this.notiService.marcarLeida(n._id).subscribe(() => {
      n.leida = true;
      this.noLeidas--;
    });
  }

  mostrarNotificacionUI(mensaje: string) {
    // 🔥 limpiar timeout anterior
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastMensaje = mensaje;
    this.mostrarToast = true;

    // 🔥 nuevo timeout controlado
    this.toastTimeout = setTimeout(() => {
      this.mostrarToast = false;
      this.toastTimeout = null;
    }, 3000);
  }

  cerrarToast() {
    this.mostrarToast = false;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
  }

}
