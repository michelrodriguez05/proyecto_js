
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

async function cargarProductos() {
  try {
    const res = await fetch("https://fakestoreapi.com/products");
    const data = await res.json();
    mostrarProductos(data);
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

function filtrarPorCategoria(cat) {
  fetch("https://fakestoreapi.com/products/category/" + encodeURIComponent(cat))
    .then(res => res.json())
    .then(data => mostrarProductos(data))
    .catch(err => console.error("Error al filtrar categoría:", err));
}

document.getElementById("searchInput").addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();
  fetch("https://fakestoreapi.com/products")
    .then(res => res.json())
    .then(data => {
      const filtrado = data.filter(p => p.title.toLowerCase().includes(texto));
      mostrarProductos(filtrado);
    });
});


let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function renderizarCarrito() {
  const lista = document.getElementById("listaCarrito");
  const total = document.getElementById("totalCarrito");
  const contador = document.getElementById("contadorCarrito");

  lista.innerHTML = "";
  let totalCompra = 0;

  carrito.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.title} - $${item.price.toFixed(2)}
      <button onclick="eliminarDelCarrito(${index})">X</button>`;
    lista.appendChild(li);
    totalCompra += item.price;
  });

  total.textContent = totalCompra.toFixed(2);
  contador.textContent = carrito.length;
}

function agregarAlCarrito(producto) {
  carrito.push(producto);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

// Mostrar/ocultar carrito (imagen del ícono)
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

// Carga inicial
renderizarCarrito();
cargarProductos();
