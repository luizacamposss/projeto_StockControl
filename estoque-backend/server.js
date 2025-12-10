const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const stockRoutes = require("./routes/stock");

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/stock", stockRoutes);

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});
