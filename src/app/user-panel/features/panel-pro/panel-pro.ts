import { Component, inject, OnInit, Signal } from '@angular/core';
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


@Component({
  selector: 'app-panel-pro',
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
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
  }
  logout() {
    this.storageServ.removeToken()
    this.empresaStorage.clear();
    this.router.navigate(['/auth']);
  }


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


}
