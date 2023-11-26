import { Component, OnInit } from '@angular/core';
import { GuestService } from 'src/app/services/guest.service';

declare var iziToast:any;

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent implements OnInit{

  public contacto: any ={};
  public load_btn = false;

  constructor(
    private _guestSevice: GuestService
  ){}

  ngOnInit(): void {
    
  }

  registro(registroForm:any){
    if (registroForm.valid) {
      this.load_btn = true;
      this._guestSevice.enviar_mensaje_contanto(this.contacto).subscribe(
        response=>{
          console.log(response);
          iziToast.show({
            title: 'ÉXITO',
            titleColor: '#FFD700',
            theme: 'dark',
            class: 'text-success',
            position: 'topRight',
            message: 'Se envío correctamente el mensaje'
          });
          this.contacto = {};
          this.load_btn = false;
        }
      );
    }else{
      iziToast.show({
        title: 'ERROR',
        titleColor: '#FFA500',
        theme: 'dark',
        class: 'text-danger',
        position: 'topRight',
        message: 'Los datos del formulario no son válidos'
      });
    }
  }

}
