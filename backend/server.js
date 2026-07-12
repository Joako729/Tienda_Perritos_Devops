// Comentario agregado para prueba CI/CD
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3001;

// --- CONFIGURACIÓN SEGURA PARA KUBERNETES ---
// Si no encuentra la variable de entorno, el proceso debe fallar. 
// Esto asegura que si el Secret falta, el backend no se inicie con datos erróneos.
const DB_HOST = process.env.DB_HOST || "mysql-service";
const DB_USER = process.env.DB_USER; 
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT || 3306;

app.use(cors());
app.use(express.json());

let pool;

// Inicializar conexión MySQL (Tu lógica original de Pool)
async function initDb() {
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      }
    });

    const connection = await pool.getConnection();
    console.log("✅ Conexión MySQL exitosa");
    connection.release();
  } catch (err) {
    console.log("❌ ERROR INICIANDO MYSQL");
    console.log(err);
  }
}

initDb();

// Función de manejo de errores
function handleError(res, error, message = "Error interno") {
  console.log("=================================");
  console.log("❌ ERROR REAL MYSQL:");
  console.log(error);
  console.log("=================================");
  res.status(500).json({ message, error: String(error) });
}

// --- TUS RUTAS ORIGINALES (INTACTAS) ---

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend funcionando correctamente" });
});

app.get("/api/productos", async (req, res) => {
  try {
    console.log("📌 Consultando productos...");
    const [rows] = await pool.query("SELECT * FROM productos");
    console.log("✅ Productos obtenidos:", rows);
    res.json(rows);
  } catch (err) {
    handleError(res, err, "No se pudieron obtener los productos.");
  }
});

app.get("/api/productos/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM productos WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(rows[0]);
  } catch (err) {
    handleError(res, err, "No se pudo obtener el producto.");
  }
});

app.post("/api/productos", async (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO productos(nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
      [nombre, descripcion, precio, stock]
    );
    res.json({ id: result.insertId, nombre, descripcion, precio, stock });
  } catch (err) {
    handleError(res, err, "No se pudo crear el producto.");
  }
});

app.put("/api/productos/:id", async (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;
  try {
    await pool.query(
      "UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=? WHERE id=?",
      [nombre, descripcion, precio, stock, req.params.id]
    );
    res.json({ message: "Producto actualizado" });
  } catch (err) {
    handleError(res, err, "No se pudo actualizar.");
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM productos WHERE id=?", [req.params.id]);
    res.json({ message: "Producto eliminado" });
  } catch (err) {
    handleError(res, err, "No se pudo eliminar.");
  }
});

app.listen(PORT, async () => {
  console.log(`🚀 Backend escuchando en puerto ${PORT}`);
});