const btnConsultar = document.getElementById('btnConsultar');
const contenedor = document.getElementById('contenedor');
const mensaje = document.getElementById('mensaje');

const urlLista = 'https://ws-public.interpol.int/notices/v1/red';

btnConsultar.addEventListener('click', async () => {
    contenedor.innerHTML = '';
    mensaje.textContent = 'Cargando perfiles e imágenes...';

    try {
        // 1. Obtenemos la lista principal de notificaciones
        const response = await fetch(urlLista);
        if (!response.ok) throw new Error('Error al obtener la lista de la API');
        
        const data = await response.json();
        const notices = data._embedded.notices;

        mensaje.textContent = `Se encontraron ${notices.length} perfiles. Cargando fotos...`;

        // 2. Recorremos cada perfil y buscamos su imagen en paralelo
        const promesasTarjetas = notices.map(async (notice) => {
            const nombre = notice.name || '';
            const apellido = notice.forename || '';
            const urlDetalleImagen = notice._links?.images?.href;

            let imagenSrc = 'https://via.placeholder.com/150x180?text=Sin+Foto';

            // Si el perfil tiene enlace de imágenes, hacemos la petición para obtener la foto
            if (urlDetalleImagen) {
                try {
                    const imgRes = await fetch(urlDetalleImagen);
                    const imgData = await imgRes.json();
                    const imagenesArray = imgData._embedded?.images;
                    
                    if (imagenesArray && imagenesArray.length > 0) {
                        imagenSrc = imagenesArray[0]._links.self.href; // URL de la foto real
                    }
                } catch (e) {
                    console.error("No se pudo cargar la imagen para:", apellido);
                }
            }

            // Creamos el elemento HTML de la tarjeta
            return `
                <div class="card">
                    <img src="${imagenSrc}" alt="${nombre} ${apellido}" onerror="this.src='https://via.placeholder.com/150x180?text=Error'">
                    <h4>${apellido}</h4>
                    <p>${nombre}</p>
                </div>
            `;
        });

        // Esperamos a que todas las imágenes y tarjetas estén listas
        const tarjetasHTML = await Promise.all(promesasTarjetas);

        // Insertamos todo en el contenedor
        mensaje.textContent = '';
        contenedor.innerHTML = tarjetasHTML.join('');

    } catch (error) {
        console.error('Error:', error);
        mensaje.textContent = 'Hubo un error al cargar los datos: ' + error.message;
    }
});
