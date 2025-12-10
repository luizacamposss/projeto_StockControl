const express = require("express");
const router = express.Router();
const db = require("../db");

// LISTAR EM ORDEM ALFABÉTICA
router.get("/listar", (req, res) => {
    const sql = "SELECT * FROM produtos ORDER BY nome ASC";
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
});

// MOVIMENTAÇÃO DE ESTOQUE
router.post("/movimentar", (req, res) => {
    const { produto_id, tipo, quantidade, data_mov } = req.body;

    // 🔒 Validação simples
    if (!produto_id || !tipo || !quantidade || !data_mov) {
        return res.status(400).json({ error: "Dados incompletos!" });
    }

    if (quantidade <= 0) {
        return res.status(400).json({ error: "Quantidade inválida!" });
    }

    // 1. Buscar estoque atual
    const sqlSelect = "SELECT estoque_atual, estoque_min FROM produtos WHERE id=?";
    db.query(sqlSelect, [produto_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err });

        if (rows.length === 0)
            return res.status(404).json({ error: "Produto não encontrado" });

        let { estoque_atual, estoque_min } = rows[0];

        let novoEstoque =
            tipo === "entrada"
                ? estoque_atual + quantidade
                : estoque_atual - quantidade;

        // ❗ Impedir estoque negativo
        if (tipo === "saida" && novoEstoque < 0) {
            return res
                .status(400)
                .json({ error: "Estoque insuficiente para retirada!" });
        }

        // 2. Atualizar estoque
        const sqlUpdate = "UPDATE produtos SET estoque_atual=? WHERE id=?";
        db.query(sqlUpdate, [novoEstoque, produto_id], err => {
            if (err) return res.status(500).json({ error: err });

            // 3. Registrar movimentação
            const sqlInsert =
                "INSERT INTO movimentacoes (produto_id, tipo, quantidade, data_mov) VALUES (?, ?, ?, ?)";
            db.query(sqlInsert, [produto_id, tipo, quantidade, data_mov], err => {
                if (err) return res.status(500).json({ error: err });

                // 4. Verificar alerta
                if (tipo === "saida" && novoEstoque < estoque_min) {
                    return res.json({
                        alerta: true,
                        message: "⚠ Estoque abaixo do mínimo!",
                        estoque_atual: novoEstoque
                    });
                }

                res.json({
                    message: "Movimentação registrada com sucesso!",
                    estoque_atual: novoEstoque
                });
            });
        });
    });
});

module.exports = router;
