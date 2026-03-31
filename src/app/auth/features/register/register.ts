import { Component, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../data-access/auth';
import { Router, RouterLinkWithHref } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ɵInternalFormsSharedModule, ReactiveFormsModule } from '@angular/forms';
import { AuthStorage } from '../../data-access/auth-storage';
import { DataStatic } from '../../data-access/data-static';

@Component({
  selector: 'app-register',
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, RouterLinkWithHref],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit{
  private auth = inject(Auth);
  private storageServ = inject(AuthStorage)
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private servDataStatic = inject(DataStatic)
  public form!: FormGroup;
  public colores: string[] = [];
  public imagenes: string[] = ['man', 'woman', 'anonymous']
  selectedAvatar = signal<string | null>(null);

  ngOnInit(): void {
    this.colores = this.servDataStatic.colores;
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      businessName: ['', Validators.required],
      colorTema: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      avatar: [''],
      password: ['', [Validators.required, Validators.minLength(3)]]
    })
  }
  
  seleccionar(img: string) {
    this.selectedAvatar.set(img);
  }
  send() {
    this.form.value.avatar = this.selectedAvatar()
    console.log(this.form.value)
     this.auth.register(this.form.value).subscribe((res: any) => {
       console.log(res)
       alert(res.mensaje)
       if(res.token){
         this.storageServ.setToken(res.token)
         this.router.navigate(['/auth'])
       }else{
        return
       }
     });
  }
  

}
