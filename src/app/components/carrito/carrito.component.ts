import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ClienteService } from 'src/app/services/cliente.service';
import { io } from "socket.io-client";
import { GuestService } from 'src/app/services/guest.service';
import { Router } from '@angular/router';
import { subscribeOn } from 'rxjs';

declare var iziToast:any;
declare var Cleave:any;
declare var StickySidebar:any;
declare var paypal:any;

interface HtmlInputEvent extends Event{
  target : HTMLInputElement & EventTarget;
} 


@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit{

  @ViewChild('paypalButton', { static: true })
  paypalElement!: ElementRef;

  public id_cliente;
  public token;
  public carrito_arr : Array<any> = [];
  public url;
  public subtotal = 0;
  public total_pagar: any = 0;
  public socket = io('http://localhost:4201');
  public direccion_principal : any = {};
  public envios: Array<any> = [];
  public precio_envio: any = "0";
  public igv: any = "0";
  public venta : any = {};
  public dventa : Array<any> = [];
  public card_data: any = {};
  public btn_load = false;
  public carrito_load = true;
  public user : any = {};
  public error_cupon = '';
  public descuento =0;
  public descuento_activo : any = undefined;

  constructor(
    private _clienteService: ClienteService,
    private _guestService: GuestService,
    private _router: Router
  ){
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this.id_cliente = localStorage.getItem('_id');
    this.venta.cliente = this.id_cliente;
    
    this._clienteService.obtener_carrito_cliente(this.id_cliente,this.token).subscribe(
      response=>{
        this.carrito_arr = response.data;
        this.calcular_carrito();
        this.calcular_total('Envío Gratis');
      }
    );
    this._guestService.get_Envios().subscribe(
      response =>{
        this.envios = response;
      }
    );
    this.user = JSON.parse(localStorage.getItem('user_data')!);
  }

  ngOnInit(): void {

    setTimeout(()=>{
      new Cleave('#cc-number',{
        creditCard: true,
        onCreditCardTypeChanged: function(type:any){
        }
      });

      new Cleave('#cc-exp-date',{
        date: true,
        datePattern: ['m','Y']
      });

      var sidebar = new StickySidebar('.sidebar-sticky', {topSpacing: 20});
    });
    
    this._guestService.obtener_descuento_activo().subscribe(
      response =>{
        if (response.data) {
          this.descuento_activo = response.data[0];
        }else{
          this.descuento_activo = undefined;
        }
      }
    );

    this.init_Data();


    paypal.Buttons({
      style: {
          layout: 'horizontal'
      },
      createOrder: (data:any,actions:any)=>{
  
          return actions.order.create({
            purchase_units : [{
              description : 'Pago en Tienda Lujo',
              amount : {
                currency_code : 'USD',
                value: this.total_pagar
              },
            }]
          });
        
      },

      onApprove : async (data:any,actions:any)=>{
        const order = await actions.order.capture();
        console.log(order);
        this.venta.transaccion = order.purchase_units[0].payments.capture[0].id;
        console.log(this.dventa);
        
        this.venta.detalles = this.dventa;
        this._clienteService.registro_compra_cliente(this.venta, this.token).subscribe(
          response =>{
            this._clienteService.enviar_correo_compra_cliente(response.venta._id, this.token).subscribe(
              response=>{
                this._router.navigate(['/']);
              }
            );
          }
        );
      },
      onError : (err:any) =>{
    
      },
      onCancel: function (data:any, actions:any) {
        
      }
    }).render(this.paypalElement.nativeElement);
  
    
  }

  init_Data(){
    this._clienteService.obtener_carrito_cliente(this.id_cliente, this.token).subscribe(
      response=>{
        this.carrito_arr = response.data;
        console.log(this.carrito_arr)
        this.carrito_arr.forEach(element =>{
          this.dventa.push({
            producto: element.producto._id,
            subtotal: element.producto.precio,
            cantidad: element.producto.cantidad,
            cliente: localStorage.getItem('_id')
          });
        });
        this.carrito_load = false;
        this.calcular_carrito();
        this.calcular_total('Envio Gratis');
      }
    );
  }

  get_direccion_principal(){
    this._clienteService.obtener_direccion_principal_cliente(localStorage.getItem('_id'),this.token).subscribe(
      response=>{
        if (response.data == undefined) {
          this.direccion_principal = undefined;
        }else{
          this.direccion_principal = response.data;
          this.venta.direccion = this.direccion_principal._id;
        }
      }
    );
  }

  calcular_carrito() {
    this.subtotal = 0.0;
    if(this.descuento_activo == undefined){
      this.carrito_arr.forEach(element => {
        this.subtotal = this.subtotal + parseInt(element.producto.precio);
      });
    }else if(this.descuento_activo != undefined){
      this.carrito_arr.forEach(element => {
        let new_precio =  Math.round(parseInt(element.producto.precio) - (parseInt(element.producto.precio)*this.descuento_activo.descuento)/100);
        this.subtotal = this.subtotal + new_precio;
      });
    }    
    /* this.subtotal = 0.0;  
    this.carrito_arr.forEach(element => {
      // Seleccionar el precio adecuado según la presencia o ausencia de descuento activo
      const precio = (this.descuento_activo == undefined) ? element.producto.precio : (element.producto.precio - (element.producto.precio * this.descuento_activo.descuento) / 100);
      // Calcular el precio total considerando la cantidad de elementos
      const precioTotal = precio * element.cantidad;  
      this.subtotal += precioTotal;
    }); */
  }

  eliminar_item(id:any){
    this._clienteService.eliminar_carrito_cliente(id, this.token).subscribe(
      response =>{
        iziToast.show({
          title: 'ÉXITO',
          titleColor: '#FFD700',
          theme: 'dark',
          class: 'text-success',
          position: 'topRight',
          message: 'Se eliminó el producto correctamente'
        });
        this.socket.emit('delete-carrito',{data:response.data});
        this.init_Data();
      }
    )
  }

  calcular_total(envio_titulo:any){
      this.subtotal = 0.0;
      if (this.descuento_activo == undefined) {
        this.carrito_arr.forEach(element => {
          this.subtotal += element.precio_sub;
        });
      } else if (this.descuento_activo != undefined) {
        this.carrito_arr.forEach(element => {
          let new_precio = element.precio_sub - (element.precio_sub * this.descuento_activo.descuento) / 100;
          this.subtotal += new_precio;
        });
      
    }
    console.log(this.subtotal)
    this.igv = parseFloat(this.subtotal.toString()) * 0.18;
    this.total_pagar = parseFloat(this.subtotal.toString()) + parseFloat(this.precio_envio) + parseFloat(this.igv);
    this.venta.subtotal = this.total_pagar;
    this.venta.envio_precio = parseInt(this.precio_envio);
    this.venta.envio_titulo = envio_titulo;
    console.log(this.venta);
    console.log(this.total_pagar);
  }

  get_token_culqi(){
    if (this.card_data && this.card_data.exp) {
      let exp_arr = this.card_data.exp.toString().split('/');
      // Resto del código aquí
    } else {
      console.error('this.card_data o this.card_data.exp es undefined.');
      return; // Salir de la función si card_data o card_data.exp es undefined
    }
  
    
    let month;
    let year;
    let exp_arr= this.card_data.exp.toString().split('/');

    let data = {
      "card_number": this.card_data.ncard.toString().replace(/ /g, "").substr(0,16),
      "cvv": this.card_data.cvc,
      "expiration_month": exp_arr[0],
      "expiration_year": exp_arr[1].toString().substr(0,4),
      "email": this.user.email,
    }
    console.log(data);
    this.btn_load = true;
    this._clienteService.get_token_culqi(data).subscribe(
      response =>{
        
        let charge = {
          "amount": this.subtotal+'00',
          "currency_code": "PEN",
          "email": this.user.email,
          "source_id": response.id
        }
        console.log(charge)
        this._clienteService.get_charge_culqi(charge).subscribe(
          response=>{
            this.venta.transaccion = response.id;
        
            this.venta.detalles = this.dventa;
            this._clienteService.registro_compra_cliente(this.venta, this.token).subscribe(
              response =>{
                this.btn_load = false;
                this._clienteService.enviar_correo_compra_cliente(response.venta._id, this.token).subscribe(
                  response=>{
                    this._router.navigate(['/']);
                  }
                );
                
              }
            );
          }
        );
      }
    );
  }

  validar_cupon(){
    if (this.venta.cupon) {
      if (this.venta.cupon.toString().length <= 25) {
        //SI ES VALIDO
        this._clienteService.validar_cupon_admin(this.venta.cupon, this.token).subscribe(
          response =>{
            if (response.data != undefined) {
              this.error_cupon ='';
              if (response.data.tipo == 'Valor fijo') {
                this.descuento = response.data.valor;
                this.total_pagar = this.total_pagar - this.descuento;
              }else if(response.data.tipo == 'Porcentaje'){
                this.descuento = (this.total_pagar * response.data.valor)/100;
                this.total_pagar = this.total_pagar - this.descuento;
              }
            }else{
              this.error_cupon = 'El cupón no se pudo canjear';
            }
          }
        );
      }else{
        //NO ES VALIDO
        this.error_cupon = 'El cupón debe de ser menos de 25 caracteres';
      }
    }else{
      this.error_cupon = 'El cupón no es válido';
    }
  }

}
