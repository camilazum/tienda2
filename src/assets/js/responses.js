function getBotResponse(input) {
    const key = "contacto";
    const key1 = "descuentos";
    const key2 = "galletas";
    const key3 = "caramelos";
    const key4 = "helados";
    const key5 = "chocolates";
    const key11 = "chocolates";
    const key6 = "delivery";
    const key7 = "pago";
    const key8 = "categorías";
    const key9 = "adiós";
    const key10 = "hola";
    

    // Simple responses
    if (input.toLowerCase().includes(key10.toLowerCase())) {
        return "Hola, bienvenido al Tienda LUJO. Estoy aquí para resolver tus dudas, puedes preguntarme algo.";
    } else if (input.toLowerCase().includes(key9.toLowerCase())) {
        return "Nos vemos luego y gracias por visitar El Tienda LUJO!";
    } else if (input.toLowerCase().includes(key.toLowerCase()) ) {
        return "Si deseas mayor información, contáctanos al correo tiendalujo@hotmail.com o al siguiente teléfono +51 987465321";
    } else if (input.toLowerCase().includes(key1.toLowerCase()) ) {
        return "Los descuentos vigentes podrás visualizarlos en la página de inicio";
    } else if (input.toLowerCase().includes(key2.toLowerCase()) ) {
        return "Entre nuestras categorías de Galletas tenemos los siguientes productos: Galletas con Chispas de Colores, Galleta de Canela, Galleta con Manjar, Galleta con Glaseado, Galleta de Avena, Galleta con Chispas de Chocolates";
    } else if (input.toLowerCase().includes(key3.toLowerCase()) ) {
        return "Entre nuestras categorías de Caramelos tenemos los siguientes productos: Caramelos con Sabor a Sosa, Caramelos con Relleno, Caramelos de Menta, Caramelos de Frutas, Caramelos Duros";
    } else if (input.toLowerCase().includes(key4.toLowerCase()) ) {
        return "Entre nuestras categorías de Caramelos tenemos los siguientes productos: Helado de Vainilla, Helado de Piña, Helado de Mango con Fresa, Helado de Limón, Helado de Fresa, Helado de Mango";
    } else if (input.toLowerCase().includes(key5.toLowerCase()) ) {
        return "Entre nuestras categorías de Chicles tenemos los siguientes productos: Gomitas de Ositos";
    } else if (input.toLowerCase().includes(key11.toLowerCase()) ) {
        return "Entre nuestras categorías de Chocolates tenemos los siguientes productos: Chocolate Negro, Chocolate con Manjar, Chocolate con Leche, Chocolate con Frutos Secos, Chocolates con Fresas, Chocolate Blanco";
    } else if (input.toLowerCase().includes(key6.toLowerCase()) ) {
        return "Contamos con 3 métodos de delivery con sus respectivos costos, estos son: Gratis S/.0 (1 mes), Estándar S/.18.00 (2 a 3 semanas) y Express S/.25.00 (1 a 2 semanas) ";
    } else if (input.toLowerCase().includes(key8.toLowerCase()) ) {
        return "Contamos con varias categorías en nuestros productos como: Galletas, Caramelos, Helados, Pastillas, Chocolates y Chicles ";
    } else if (input.toLowerCase().includes(key7.toLowerCase()) ) {
        return "Estos son nuestros metodos de pago: visa, paypal, mastercard";
    }else if (input == "Compra realizada!") {
        return "Gracias por realizar tu compra en la tienda, Recuerda que hay mas productos a la espera de ti!!";
    }else if(input == "Gracias por la ayuda! :)"){
        return "Gracias a ti, recuerda que si tienes alguna consulta puedes hacerla desde este ChatBot";
    }else{
        return "No entiendo tu mensaje, intenta denuevo!";
    }
}