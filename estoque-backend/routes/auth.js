const express = require("express");
const router = express.Router();
const db = require("../db");

// LOGIN
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM usuarios WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, result) => {
        if (err) return res.status(500).json({ error: "Erro no servidor" });

        if (result.length === 0) {
            return res.status(401).json({ error: "Usuário ou senha incorretos" });
        }

        const user = {
            id: result[0].id,
            username: result[0].username
        };

        res.json({ message: "Login realizado com sucesso!", user });
    });
});

// LOGOUT (intermediário – só para front)
router.post("/logout", (req, res) => {
    res.json({ message: "Logout realizado!" });
});

module.exports = router;
