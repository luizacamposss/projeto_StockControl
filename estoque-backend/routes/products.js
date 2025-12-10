const express = require("express");
const router = express.Router();
const db = require("../db");

// LISTAR TODOS OS PRODUTOS
router.get("/", (req, res) => {
    db.query("SELECT * FROM produtos", (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
});

// BUSCA POR TERMO
router.get("/buscar", (req, res) => {
    const termo = `%${req.query.q}%`;

    const sql = "SELECT * FROM produtos WHERE nome LIKE ?";
    db.query(sql, [termo], (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
});

// CADASTRAR PRODUTO
router.post("/", (req, res) => {
    const { nome, marca, modelo, material, tamanho, peso, tensao, estoque_min, estoque_atual } = req.body;

    const sql = `INSERT INTO produtos 
    (nome, marca, modelo, material, tamanho, peso, tensao, estoque_min, estoque_atual)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [nome, marca, modelo, material, tamanho, peso, tensao, estoque_min, estoque_atual], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Produto cadastrado com sucesso!" });
    });
});

// EDITAR PRODUTO
router.put("/:id", (req, res) => {
    const id = req.params.id;
    const { nome, marca, modelo, material, tamanho, peso, tensao, estoque_min, estoque_atual } = req.body;

    const sql = `UPDATE produtos SET 
        nome=?, marca=?, modelo=?, material=?, tamanho=?, peso=?, tensao=?, estoque_min=?, estoque_atual=?
        WHERE id=?`;

    db.query(sql, [nome, marca, modelo, material, tamanho, peso, tensao, estoque_min, estoque_atual, id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Produto atualizado com sucesso!" });
    });
});

// EXCLUIR PRODUTO
router.delete("/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM produtos WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Produto removido!" });
    });
});

module.exports = router;
