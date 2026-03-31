import { effect, Injectable, signal } from "@angular/core";
import { EmpresaInterface } from "../ui/interfaces/empresa.interface";
import { DiaHabil } from "../ui/interfaces/dia-habil.interface";

@Injectable({providedIn: 'root'})
export class EmpresaStore{
    private storageKey = 'empresaData'
    private _empresa = signal<EmpresaInterface | null>(
        this.getEmpresaFromStorage()
    );

    empresa = this._empresa.asReadonly();

    constructor(){
        effect(()=>{
            const empresa = this._empresa();
            if(empresa){
                localStorage.setItem(this.storageKey, JSON.stringify(empresa));
            }else{
                localStorage.removeItem(this.storageKey);
            }
        })
    }

    setEmpresa(empresa: EmpresaInterface){
        this._empresa.set(empresa);
    }

    clear(){
        this._empresa.set(null);
    }

    getEmpresaFromStorage(): EmpresaInterface | null{
        const empresa = localStorage.getItem(this.storageKey);
        return empresa ? JSON.parse(empresa) : null;
    }
    updateDiasHabiles(dias: DiaHabil[]) {
        this._empresa.update(emp => {
        if (!emp) return emp;
        return {
            ...emp,
            diasHabiles: dias
        };
        });
    }
}