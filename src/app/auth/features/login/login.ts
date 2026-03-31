import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../data-access/auth';
import { Router, RouterLinkWithHref } from '@angular/router';
import { AuthStorage } from '../../data-access/auth-storage';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLinkWithHref
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit{
  public form!: FormGroup;
  public loading: boolean = false;
  public errorMsg: string = '';
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private storageServ = inject(AuthStorage)
  
  
  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    })
  }

  send(){
    if(this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMsg = '';

    this.auth.login(this.form.value).subscribe({
      next: (res: any) =>{
        this.loading = false;

        if(res.token){
          const id = res.empresa.owner
          this.storageServ.setToken(res.token)  
          this.router.navigate([`/user-panel/${id}/inicio`])
        }else{
          this.errorMsg = 'Error al iniciar sesión. Por favor, verifica tus credenciales.'
        }
      },
      error: ()=>{
        this.loading = false;
        this.errorMsg = 'Ocurrió un error al iniciar sesión'
      }
    })
  }

}
