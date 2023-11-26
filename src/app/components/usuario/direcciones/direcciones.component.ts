import { Component, OnInit } from '@angular/core';
import { GuestService } from 'src/app/services/guest.service';
import { ClienteService } from '../../../services/cliente.service';

declare var iziToast:any;
declare var $:any;

@Component({
  selector: 'app-direcciones',
  templateUrl: './direcciones.component.html',
  styleUrls: ['./direcciones.component.css']
})
export class DireccionesComponent implements OnInit{

  public token;
  public direccion: any = {
    pais: '',
    region: '',
    provincia: '',
    distrito: '',
    principal: false
  };
  public direcciones: Array<any> = [];

  public regiones: Array<any> = [];
  public provincias: Array<any> = [];
  public distritos: Array<any> = [];

  public regiones_arr: Array<any> = [];
  public provincias_arr: Array<any> = [];
  public distritos_arr: Array<any> = [];

  public load_data = true;

  constructor(
    private _guestSercice: GuestService,
    private _clienteService: ClienteService
  ){
    this.token = localStorage.getItem('token');

    this._guestSercice.get_Regiones().subscribe(
      response => {
        this.regiones_arr = response;
      }
    );

    this._guestSercice.get_Provincias().subscribe(
      response => {
        this.provincias_arr = response;
      }
    );

    this._guestSercice.get_Distritos().subscribe(
      response => {
        this.distritos_arr = response;
      }
    );

  }

  ngOnInit(): void {
    this.obtener_direccion();
  }

  select_pais(){
    if (this.direccion.pais == "Perú") {
      $('#sl-region').prop('disabled',false);
      this._guestSercice.get_Regiones().subscribe(
        (response:any[]) => {
          response.forEach(element => {
            this.regiones.push({
              id: element.id,
              name: element.name
            });
          });
        }
      );
    }else{
      $('#sl-region').prop('disabled',true);
      $('#sl-provincia').prop('disabled',true);
      $('#sl-distrito').prop('disabled',true);
      this.regiones = [];
      this.provincias = [];
      this.distritos = [];
      this.direccion.region = '';
      this.direccion.provincia = '';
      this.direccion.distrito = '';
    }
  }

  select_region(){
    this.provincias = [];
    $('#sl-provincia').prop('disabled',false);
    $('#sl-distrito').prop('disabled',true);
    this.direccion.provincia = '';
    this.direccion.distrito = '';
    this._guestSercice.get_Provincias().subscribe(
      (response:any[]) => {
        response.forEach(element => {
          if (element.department_id == this.direccion.region) {
            this.provincias.push(
              element
            );
          }
        });
      }
    );
  }

  select_provincia(){
    this.distritos=[];
    $('#sl-distrito').prop('disabled',false);
    this.direccion.distrito = '';
    this._guestSercice.get_Distritos().subscribe(
      (response:any[]) => {
        response.forEach(element => {
          if (element.province_id == this.direccion.provincia) {
            this.distritos.push(
              element
            );
          }
        });
        console.log(this.distritos);
      }
    );
  }

  registrar(registroForm:any){
    if (registroForm.valid) {

      this.regiones_arr.forEach(element =>{
        if (parseInt(element.id) == parseInt(this.direccion.region)) {
          this.direccion.region = element.name;
        }
      });

      this.provincias_arr.forEach(element =>{
        if (parseInt(element.id) == parseInt(this.direccion.provincia)) {
          this.direccion.provincia = element.name;
        }
      });

      this.distritos_arr.forEach(element =>{
        if (parseInt(element.id) == parseInt(this.direccion.distrito)) {
          this.direccion.distrito = element.name;
        }
      });

      let data = {
        destinatario: this.direccion.destinatario,
        dni: this.direccion.dni,
        zip: this.direccion.zip,
        direccion: this.direccion.direccion,
        telefono: this.direccion.telefono,
        pais: this.direccion.pais,
        region: this.direccion.region,
        provincia: this.direccion.provincia,
        distrito: this.direccion.distrito,
        principal: this.direccion.principal,
        cliente: localStorage.getItem('_id')
      }

      this._clienteService.registro_direccion_cliente(data,this.token).subscribe(
        response => {
          this.direccion = {
            pais: '',
            region: '',
            provincia: '',
            distrito: '',
            principal: false
          };
          $('#sl-region').prop('disabled',true);
          $('#sl-provincia').prop('disabled',true);
          $('#sl-distrito').prop('disabled',true);

          iziToast.show({
            title: 'ÉXITO',
            titleColor: '#FFD700',
            theme: 'dark',
            class: 'text-success',
            position: 'topRight',
            message: 'Se agregó la nueva dirección correctamente.'
          });
        }
      )

      console.log(data)
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

  obtener_direccion(){
    this._clienteService.obtener_direcciones_todos_cliente(localStorage.getItem('_id'), this.token).subscribe(
      response=>{
        this.direcciones=response.data;
        this.load_data = false;
      }
    );
  }

  establecer_principal(id:any){
    this._clienteService.cambiar_direccion_principal_cliente(id, localStorage.getItem('_id'), this.token).subscribe(
      response=>{
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#FFD700',
          theme: 'dark',
          class: 'text-success',
          position: 'topRight',
          message: 'Se actualizó la dirección principal.'
        });
        this.obtener_direccion();
      }
    )
  }

}
