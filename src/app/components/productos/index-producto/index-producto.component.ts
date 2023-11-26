import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GLOBAL } from 'src/app/services/GLOBAL';
import { ClienteService } from 'src/app/services/cliente.service';
import { io } from "socket.io-client";
import { GuestService } from 'src/app/services/guest.service';

declare var noUiSlider:any;
declare var $:any;
declare var iziToast:any;

@Component({
  selector: 'app-index-producto',
  templateUrl: './index-producto.component.html',
  styleUrls: ['./index-producto.component.css']
})
export class IndexProductoComponent implements OnInit{

  public config_global: any = {};
  public filter_categoria = '';
  public productos :Array<any>=[];
  public filter_producto='';
  public load_data=true;
  public url;
  public filter_cat_productos = 'todos';
  public route_categoria:any;
  public page = 1;
  public pageSize = 15;
  public sort_by = 'Defecto';
  public carrito_data : any = {
    variedad: '',
    cantidad: 1
  };
  public token;
  public btn_cart = false;
  public socket = io('http://localhost:4201');
  public descuento_activo : any = undefined;

  constructor(
    private _clienteService : ClienteService,
    private _route : ActivatedRoute,
    private _guestService: GuestService
  ){
    this.url = GLOBAL.url;
    this.token = localStorage.getItem('token');
    this._clienteService.obtener_config_publico().subscribe(
      response=>{
        this.config_global = response.data;
      }
    );

    this._route.params.subscribe(
      params=>{
        this.route_categoria = params['categoria'];
        if (this.route_categoria) {
          this._clienteService.listar_productos_publico('').subscribe(
            response=>{

              this.productos = response.data;
              this.productos = this.productos.filter(item=>item.categoria.toLowerCase() == this.route_categoria);
              this.load_data = false;
            }
          );
        }else{
          this._clienteService.listar_productos_publico('').subscribe(
            response=>{
              console.log(response)
              this.productos = response.data;
              this.load_data = false;
            }
          );
        }
      }
    );
  }

  ngOnInit(): void {
    var slider : any = document.getElementById('slider');
    noUiSlider.create(slider, {
        start: [0, 100],
        connect: true,
        range: {
            'min': 0,
            'max': 100
        },
        tooltips: [true,true],
        pips: {
          mode: 'count', 
          values: 5,
        }
    });
    slider.noUiSlider.on('update', function (values:any) {
        $('.cs-range-slider-value-min').val(values[0]);
        $('.cs-range-slider-value-max').val(values[1]);
    });
    $('.noUi-tooltip').css('font-size','12px');

    this._guestService.obtener_descuento_activo().subscribe(
      response =>{
        if (response.data) {
          this.descuento_activo = response.data[0];
        }else{
          this.descuento_activo = undefined;
        }
      }
    );

  }

  buscar_categorias(){
    if (this.filter_categoria) {
      var search = new RegExp(this.filter_categoria, 'i');    
      /*filter busca un item en un array*/
      this.config_global.categorias = this.config_global.categorias.filter(
        (item: any)=>search.test(item.titulo)
      );
    }else{
      this._clienteService.obtener_config_publico().subscribe(
        response=>{
          this.config_global = response.data;
        }
      );
    }
  }

  buscar_producto(){
    this._clienteService.listar_productos_publico(this.filter_producto).subscribe(
      response=>{
        this.productos = response.data;
        this.load_data = false;
      }
    );
  }

  buscar_precios(){
    this._clienteService.listar_productos_publico(this.filter_producto).subscribe(
      response=>{
        this.productos = response.data;
        let min = parseInt($('.cs-range-slider-value-min').val());
        let max = parseInt($('.cs-range-slider-value-max').val());
        this.productos = this.productos.filter((item)=>{
          return item.precio >= min &&
                item.precio <= max
        });
      }
    );
  }

  buscar_categoria(){
    if (this.filter_cat_productos == 'todos') {
      this._clienteService.listar_productos_publico(this.filter_producto).subscribe(
        response=>{
          this.productos = response.data;
          this.load_data = false;
        }
      );
    }else{
      this._clienteService.listar_productos_publico(this.filter_producto).subscribe(
        response=>{
          this.productos = response.data;
          this.productos = this.productos.filter(item=>item.categoria == this.filter_cat_productos);
          this.load_data = false;
        }
      );
      
    }
  }

  reset_productos(){
    this.filter_producto = '';
    this._clienteService.listar_productos_publico('').subscribe(
      response=>{
        this.productos = response.data;
        this.load_data = false;
      }
    );
  }

  orden_por(){
    if (this.sort_by == 'Defecto') {
      this._clienteService.listar_productos_publico('').subscribe(
        response=>{
          this.productos = response.data;
          this.load_data = false;
        }
      );
    }else if(this.sort_by == 'Popularidad'){
      this.productos.sort(function (a,b){
        if(a.nventas < b.nventas){
          return 1;
        }if (a.nventas > b.nventas) {
          return -1;
        }
        return 0;
      });
    }else if(this.sort_by == '+-Precio'){
      this.productos.sort(function (a,b){
        if(a.precio < b.precio){
          return 1;
        }if (a.precio > b.precio) {
          return -1;
        }
        return 0;
      });
    }else if(this.sort_by == '-+Precio'){
      this.productos.sort(function (a,b){
        if(a.precio > b.precio){
          return 1;
        }if (a.precio < b.precio) {
          return -1;
        }
        return 0;
      });
    }else if(this.sort_by == 'azTitulo'){
      this.productos.sort(function (a,b){
        if(a.titulo > b.titulo){
          return 1;
        }if (a.titulo < b.titulo) {
          return -1;
        }
        return 0;
      });
    }else if(this.sort_by == 'zaTitulo'){
      this.productos.sort(function (a,b){
        if(a.titulo < b.titulo){
          return 1;
        }if (a.titulo > b.titulo) {
          return -1;
        }
        return 0;
      });
    }
  }

  agregar_producto(producto:any){
    let data = {
      producto: producto._id,
      cliente: localStorage.getItem('_id'),
      cantidad: 1,  
      variedad: producto.variedades[0].titulo,
      precio_sub: producto.precio * this.carrito_data.cantidad
    }
    console.log(producto.precio)
    this.btn_cart = true;
    this._clienteService.agregar_carrito_cliente(data,this.token).subscribe(
      response =>{
        
        if (response.data == undefined) {
          iziToast.show({
            title: 'ERROR',
            titleColor: '#FFA500',
            theme: 'dark',
            class: 'text-danger',
            position: 'topRight',
            message: 'El producto ya existe en el carrito' 
          });
          this.btn_cart = false;
        }else{
          iziToast.show({
            title: 'ÉXITO',
            titleColor: '#FFD700',
            theme: 'dark',
            class: 'text-success',
            position: 'topRight',
            message: 'Se agregó el producto al carrito'
          });
          this.socket.emit('add-carrito-add',{data:true});
          this.btn_cart = false;
        }
      }
    );
  }

}
