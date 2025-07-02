const btn = document.getElementById("btnEntrar");
if (btn) {
  btn.addEventListener("click", () => {
    document.querySelector(".portada").style.display = "none";
    document.getElementById("seccionCategorias").scrollIntoView({ behavior: "smooth" });
  });
}

const categorias = [
  { nombre: "Mujer", clave: "women's clothing" },
  { nombre: "Accesorios", clave: "jewelery" },
  { nombre: "Hombre", clave: "men's clothing" },
  { nombre: "Tecnología", clave: "electronics" }
];

const carrusel = document.getElementById("carruselCategorias");

categorias.forEach(cat => {
  const div = document.createElement("div");
  div.className = "categoria-card";
  div.textContent = cat.nombre;
  div.addEventListener("click", () => {
    filtrarPorCategoria(cat.clave);
  });
  carrusel.appendChild(div);
});

let productosOriginales = [];
let categoriaSeleccionada = null;
let textoBusqueda = "";

async function cargarProductos() {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    productosOriginales = await res.json();
    aplicarFiltrosYBusqueda();
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

function mostrarProductos(productos) {
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  productos.forEach(p => {
    const card = document.createElement("div");
    card.className = "producto";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" />
      <h3>${p.title}</h3>
      <p>$${p.price}</p>
      <button>Agregar</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      agregarAlCarrito(p);
    });
    grid.appendChild(card);
  });
}

function filtrarPorCategoria(clave) {
  categoriaSeleccionada = clave;
  aplicarFiltrosYBusqueda();
}

document.getElementById("btnQuitarFiltros").addEventListener("click", () => {
  categoriaSeleccionada = null;
  textoBusqueda = "";
  document.getElementById("searchInput").value = "";
  aplicarFiltrosYBusqueda();
});

document.getElementById("searchInput").addEventListener("input", e => {
  textoBusqueda = e.target.value.toLowerCase();
  aplicarFiltrosYBusqueda();
});

function aplicarFiltrosYBusqueda() {
  let filtrados = [...productosOriginales];

  if (categoriaSeleccionada) {
    filtrados = filtrados.filter(p => p.category === categoriaSeleccionada);
  }

  if (textoBusqueda) {
    filtrados = filtrados.filter(p => p.title.toLowerCase().includes(textoBusqueda));
  }

  mostrarProductos(filtrados);
}

// -------------------- CARRITO --------------------

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function renderizarCarrito() {
  const lista = document.getElementById("listaCarrito");
  const total = document.getElementById("totalCarrito");
  const contador = document.getElementById("contadorCarrito");

  lista.innerHTML = "";
  let totalCompra = 0;
  let cantidadTotal = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.title} - $${item.price.toFixed(2)} x ${item.cantidad}
      <button onclick="modificarCantidad(${index}, 1)">+</button>
      <button onclick="modificarCantidad(${index}, -1)">-</button>
      <button onclick="eliminarDelCarrito(${index})">X</button>
    `;
    lista.appendChild(li);
    totalCompra += item.price * item.cantidad;
    cantidadTotal += item.cantidad;
  });

  total.textContent = totalCompra.toFixed(2);
  contador.textContent = cantidadTotal;
}

function agregarAlCarrito(producto) {
  const index = carrito.findIndex(item => item.id === producto.id);
  if (index !== -1) {
    carrito[index].cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

function modificarCantidad(index, cambio) {
  carrito[index].cantidad += cambio;
  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

document.getElementById("vaciarCarrito").addEventListener("click", () => {
  carrito = [];
  localStorage.removeItem("carrito");
  renderizarCarrito();
});

// Mostrar/ocultar carrito
const abrirCarrito = document.getElementById("abrirCarrito");
const cerrarCarrito = document.getElementById("cerrarCarrito");
const carritoContenedor = document.getElementById("carrito");

if (abrirCarrito && cerrarCarrito && carritoContenedor) {
  abrirCarrito.addEventListener("click", () => {
    carritoContenedor.classList.add("visible");
  });

  cerrarCarrito.addEventListener("click", () => {
    carritoContenedor.classList.remove("visible");
  });
}

// -------------------- INICIO DE LA NUEVA FUNCIONALIDAD: HISTÓRICO DE COMPRAS --------------------

// Referencias a los nuevos elementos del DOM
const btnComprar = document.getElementById("btnComprar");
const btnVerHistorial = document.getElementById("verHistorialBtn");
const modalHistorial = document.getElementById("historialModal");
const btnCerrarHistorial = document.getElementById("cerrarHistorial");

// 1. Lógica del Botón "Comprar"
btnComprar.addEventListener("click", () => {
  // Validar que el carrito no esté vacío
  if (carrito.length === 0) {
    alert("El carrito está vacío. No puedes realizar una compra.");
    return;
  }

  // Obtener el historial de compras existente o crear un array vacío
  const historial = JSON.parse(localStorage.getItem("historialCompras")) || [];

  // Crear un nuevo objeto de compra
  const nuevaCompra = {
    fecha: new Date().toLocaleString('es-ES'), // Formato de fecha y hora local
    items: carrito,
    total: carrito.reduce((acc, item) => acc + item.price * item.cantidad, 0)
  };

  // Agregar la nueva compra al principio del historial
  historial.unshift(nuevaCompra);

  // Guardar el historial actualizado en localStorage
  localStorage.setItem("historialCompras", JSON.stringify(historial));

  // Vaciar el carrito actual
  carrito = [];
  localStorage.removeItem("carrito");
  renderizarCarrito(); // Actualizar la UI del carrito

  // Notificar al usuario y cerrar el carrito
  alert("¡Compra realizada con éxito! Tu historial ha sido actualizado.");
  carritoContenedor.classList.remove("visible");
});

// 2. Lógica para mostrar la ventana modal del historial
function mostrarHistorial() {
  const historial = JSON.parse(localStorage.getItem("historialCompras")) || [];
  const contenidoHistorial = document.getElementById("historialContenido");
  
  // Limpiar el contenido previo
  contenidoHistorial.innerHTML = "";

  if (historial.length === 0) {
    contenidoHistorial.innerHTML = "<p>Aún no has realizado ninguna compra.</p>";
    return;
  }

  // Crear y añadir cada compra al contenedor del historial
  historial.forEach(compra => {
    const compraDiv = document.createElement("div");
    compraDiv.className = "compra-item"; // Para aplicar estilos CSS

    // Generar la lista de productos para esta compra
    const listaItems = compra.items.map(item => 
      `<li>${item.title} (x${item.cantidad}) - $${(item.price * item.cantidad).toFixed(2)}</li>`
    ).join("");

    compraDiv.innerHTML = `
      <h4>Compra del: ${compra.fecha}</h4>
      <p><strong>Total pagado: $${compra.total.toFixed(2)}</strong></p>
      <ul>${listaItems}</ul>
    `;

    contenidoHistorial.appendChild(compraDiv);
  });
}

// 3. Event Listeners para la ventana modal
btnVerHistorial.addEventListener("click", () => {
  mostrarHistorial(); // Cargar los datos
  modalHistorial.style.display = "block"; // Mostrar la modal
});

btnCerrarHistorial.addEventListener("click", () => {
  modalHistorial.style.display = "none"; // Ocultar la modal
});

// Cerrar la modal si el usuario hace clic fuera del contenido
window.addEventListener("click", (event) => {
  if (event.target == modalHistorial) {
    modalHistorial.style.display = "none";
  }
});

// -------------------- FIN DE LA NUEVA FUNCIONALIDAD --------------------

// Inicialización
renderizarCarrito();
cargarProductos();