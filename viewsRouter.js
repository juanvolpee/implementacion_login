const express = require('express');
const router = express.Router();

module.exports = function(io) {
  router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
  });

  // Socket.io para actualizar en tiempo real
  io.on('connection', socket => {
    console.log('Nuevo cliente conectado');
    // Manejar eventos de actualización de productos
     socket.on('actualizarProductos', data => {
       // Actualizar la lista de productos en la vista
       io.emit('productosActualizados', data);
     });
  });

  return router;
};

// Definir una ruta para mostrar todos los productos
router.get('/products', (req, res) => {
  // Aquí deberías obtener la lista de todos los productos desde tu base de datos o donde los tengas almacenados
  const products = [
    { id: 1, name: 'Producto 1', price: 10, category: 'Categoría 1' },
    { id: 2, name: 'Producto 2', price: 20, category: 'Categoría 2' },
    // Agrega más productos aquí según sea necesario
  ];

  // Renderiza la vista de productos y pasa los datos de los productos a la vista
  res.render('products', { products });
});


const Cart = require('../models/Cart'); // Importa el modelo de Carrito

// Definir una ruta para mostrar un carrito específico
router.get('/carts/:cid', async (req, res) => {
  const cartId = req.params.cid;

  try {
    // Busca el carrito por su ID y popula los productos asociados
    const cart = await Cart.findById(cartId).populate('products').exec();
    if (!cart) {
      return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }
    res.render('cart', { cart }); // Renderiza la vista de carrito y pasa los datos del carrito a la vista
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error al obtener el carrito' });
  }
});


 


const session = require('express-session'); // Importa express-session

// Simulación de una base de datos de usuarios
const users = [
  { id: 1, username: 'usuario1', email: 'usuario1@ejemplo.com', password: 'contraseña1', role: 'usuario' },
  { id: 2, username: 'adminCoder', email: 'adminCoder@coder.com', password: 'adminCod3r123', role: 'admin' }
];
// Configuración de express-session
router.use(session({
    secret: 'secreto', // Clave secreta para firmar la cookie de sesión
    resave: false,
    saveUninitialized: true
}));

// Ruta para mostrar el formulario de registro
router.get('/signup', (req, res) => {
    res.render('signup'); // Renderiza la vista de registro
});

// Ruta para procesar el registro de usuario
router.post('/signup', (req, res) => {
    // Aquí se procesaría la información del formulario de registro
    // Código para registrar al usuario en la base de datos
    res.redirect('/login'); // Redirige al usuario a la página de inicio de sesión después de registrarse
});

// Ruta para mostrar el formulario de inicio de sesión
router.get('/login', (req, res) => {
    res.render('login'); // Renderiza la vista de inicio de sesión
});

// Ruta para procesar el inicio de sesión
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Verificar las credenciales del usuario
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
      // Las credenciales son válidas
      // Establecer el usuario en la sesión
      req.session.user = user;

      // Verificar si el usuario es un administrador
      if (user.email === 'adminCoder@coder.com' && user.password === 'adminCod3r123') {
          user.role = 'admin'; // Asignar el rol de administrador al usuario
      } else {
          user.role = 'usuario'; // Asignar el rol de usuario normal al usuario
      }

      // Redirigir al usuario a la página de productos
      res.redirect('/products');
  } else {
      // Las credenciales son inválidas
      res.redirect('/login');
  }
});




// Ruta para mostrar la página de productos
router.get('/products', (req, res) => {
  // Verificar si el usuario está autenticado (por ejemplo, mediante sesiones)
  if (req.session.user) {
      // Si el usuario está autenticado, pasamos los datos del usuario a la vista
      const user = req.session.user;
      // Renderizamos la vista de productos y pasamos los datos del usuario como una variable
      res.render('products', { user });
  } else {
      // Si el usuario no está autenticado, redirigimos al usuario al formulario de inicio de sesión
      res.redirect('/login');
  }
});


router.post('/logout', (req, res) => {
  // Destruir la sesión
  req.session.destroy(err => {
      if (err) {
          console.error('Error al destruir la sesión:', err);
      } else {
          console.log('Sesión de usuario destruida');
          // Redirigir al usuario a la página de inicio de sesión
          res.redirect('/login');
      }
  });
});



module.exports = router;
