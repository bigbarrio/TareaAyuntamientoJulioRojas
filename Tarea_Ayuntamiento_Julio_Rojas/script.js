let noticias; 
let indiceActual; 
const noticiasPorPagina = 20;
let paginaActual = 1;

function cargarNoticiasXML() {
    fetch('https://www.zaragoza.es/sede/servicio/noticia/list.xml')
        .then(response => response.text())
        .then(data => {
            let parser = new DOMParser();
            let xml = parser.parseFromString(data, "application/xml");
            noticias = Array.from(xml.getElementsByTagName('noticia'));
            mostrarNoticias();
        })
        .catch(error => console.error('Error al cargar noticias:', error));
}

function mostrarNoticias() {
    let listadoNoticias = document.getElementById('listadoNoticias');
    let detalleNoticia = document.getElementById('detalleNoticia');

    listadoNoticias.innerHTML = '';
    detalleNoticia.innerHTML = ''; 
    detalleNoticia.style.display = 'none'; 
    noticias.sort((a, b) => {
        let fechaA = new Date(a.getElementsByTagName('dateCreated')[0].textContent);
        let fechaB = new Date(b.getElementsByTagName('dateCreated')[0].textContent);
        return fechaB - fechaA; 
    });
    let inicio = (paginaActual - 1) * noticiasPorPagina;
    let fin = Math.min(inicio + noticiasPorPagina, noticias.length);

    noticias.slice(inicio, fin).forEach((noticia, i) => {
        let noticiaId = noticia.getElementsByTagName('id')[0].textContent;
        let titulo = noticia.getElementsByTagName('title')[0].textContent;
        let elementosResumen = noticia.getElementsByTagName('summary');
        let resumen = elementosResumen.length > 0 ? elementosResumen[0].textContent : 'Resumen no disponible';

        let fecha = noticia.getElementsByTagName('dateCreated')[0].textContent;

        resumen = resumen.split('src=\"/cont/').join('src=\"https://www.zaragoza.es/cont/');
        resumen = resumen.replace(/width:\s*\d+px;/g, 'style="width: 200px;"');
        resumen = resumen.replace(/height:\s*\d+px;/g, 'style="height: 150px;"');

        let imagenNombre = noticia.getElementsByTagName('src')[0] ? noticia.getElementsByTagName('src')[0].textContent : null;
        let imagenSrc = imagenNombre
            ? `https://www.zaragoza.es/cont/paginas/noticias/${imagenNombre}`
            : 'imgs/sinfoto.png';  

        let divNoticia = document.createElement('div');
        divNoticia.innerHTML = `
            <h3><a href="#" onclick="cargarDetalleNoticia('${noticiaId}', ${i}); return false;">${titulo}</a></h3>
            <p>${resumen}</p>
            <img src="${imagenSrc}" alt="Imagen de noticia">
            <p>Fecha: ${fecha}</p>
        `;

        listadoNoticias.appendChild(divNoticia);
    });

    actualizarControlesPaginacion();
}

function cargarDetalleNoticia(noticiaId, indice) {
    indiceActual = indice; 
    fetch(`https://www.zaragoza.es/sede/servicio/noticia/${noticiaId}.json`)
        .then(response => response.json())
        .then(data => {
            mostrarDetalleNoticia(data);
        })
        .catch(error => console.error('Error al cargar detalles de noticia:', error));
}

function mostrarDetalleNoticia(data) {
    let detalleNoticia = document.getElementById('detalleNoticia');
    detalleNoticia.innerHTML = ''; 

    let resumen = data.summary ? data.summary.split('src=\"/cont/').join('src=\"https://www.zaragoza.es/cont/') : 'Resumen no disponible';
    resumen = resumen.replace(/width:\s*\d+px;/g, 'style="width: 200px;"');
    resumen = resumen.replace(/height:\s*\d+px;/g, 'style="height: 150px;"');

    let descripcion = data.description ? data.description.split('src=\"/cont/').join('src=\"https://www.zaragoza.es/cont/') : 'Descripción no disponible';
    let descripcionAmp = data.descriptionAmp ? data.descriptionAmp.split('src=\"/cont/').join('src=\"https://www.zaragoza.es/cont/') : '';


    let imagenPrincipalSrc = data.image && data.image.length > 0 ? `https://www.zaragoza.es/cont/paginas/noticias/${data.image[0].src}` : 'imgs/sinfoto.png';
    detalleNoticia.innerHTML += `<p><strong>Imagen:</strong></p>
        <img src="${imagenPrincipalSrc}" alt="Imagen de noticia" style="width:550px; height:350px;">`;

    let orden = data.order ? data.order.num : 'No disponible';

    detalleNoticia.innerHTML += `
        <p><strong>Título:</strong> ${data.title}</p>
        <p><strong>ID:</strong> ${data.id}</p>
        <p><strong>Resumen:</strong> ${resumen}</p>
        <p><strong>Fecha de Creación:</strong> ${data.dateCreated}</p>
        <div><strong>Descripción:</strong> ${descripcion}</div>
        ${descripcionAmp ? `<div><strong>Descripción Ampliada:</strong> ${descripcionAmp}</div>` : ''}
        ${data.category.map(cat => `<p><strong>Categoría:</strong> ${cat.title}</p>`).join('')}
        <p><strong>Grupo:</strong> ${data.group.title}</p>
        <p><strong>Orden:</strong> ${orden}</p>
        ${indiceActual > 0 ? '<button onclick="cargarNoticiaAnterior()">Anterior</button>' : ''}
        ${indiceActual < noticias.length - 1 ? '<button onclick="cargarNoticiaSiguiente()">Siguiente</button>' : ''}
    `;
    // Añadir un botón "Cerrar"
    detalleNoticia.innerHTML += `<button onclick="cerrarDetalleNoticia()">Cerrar</button>`;


    document.getElementById('detalleNoticia').style.display = 'block';
}

function cargarNoticiaSiguiente() {
    if (indiceActual < noticias.length - 1) {
        let siguienteNoticiaId = noticias[indiceActual + 1].getElementsByTagName('id')[0].textContent;
        cargarDetalleNoticia(siguienteNoticiaId, indiceActual + 1);
    }
}

function cargarNoticiaAnterior() {
    if (indiceActual > 0) {
        let anteriorNoticiaId = noticias[indiceActual - 1].getElementsByTagName('id')[0].textContent;
        cargarDetalleNoticia(anteriorNoticiaId, indiceActual - 1);
    }
}
function cerrarDetalleNoticia() {
    let detalleNoticia = document.getElementById('detalleNoticia');
    detalleNoticia.innerHTML = ''; 
    detalleNoticia.style.display = 'none'; 
}


function actualizarControlesPaginacion() {
    let totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);
    document.getElementById('infoPagina').textContent = `Página ${paginaActual} de ${totalPaginas}`;
    document.getElementById('btnAnterior').disabled = paginaActual === 1;
    document.getElementById('btnSiguiente').disabled = paginaActual === totalPaginas;
}


cargarNoticiasXML();


function cambiarPagina(cambio) {
    let totalPaginas = Math.ceil(noticias.length / noticiasPorPagina);
    paginaActual += cambio;

    
    if (paginaActual < 1) {
        paginaActual = 1;
    } else if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas;
    }

    mostrarNoticias();
    actualizarControlesPaginacion(); 
}


cargarNoticiasXML();


