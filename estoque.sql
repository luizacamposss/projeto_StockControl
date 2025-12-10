-- ============================================================
--  CRIAÇÃO DO BANCO
-- ============================================================
CREATE DATABASE IF NOT EXISTS estoquedb;
USE estoquedb;

-- ============================================================
--  TABELA DE USUÁRIOS PARA LOGIN
-- ============================================================
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Usuário padrão para testes
INSERT INTO usuarios (nome, email, senha)
VALUES ('Administrador', 'admin@admin.com', '1234');

-- ============================================================
--  TABELA DE PRODUTOS
-- ============================================================
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    material VARCHAR(100),
    tamanho VARCHAR(50),
    peso VARCHAR(50),
    tensao VARCHAR(50),
    estoque_minimo INT DEFAULT 1,
    estoque_atual INT DEFAULT 0
);

-- Produto exemplo
INSERT INTO produtos (nome, marca, modelo, material, tamanho, peso, tensao, estoque_minimo, estoque_atual)
VALUES ('Martelo de Unha 16oz', 'MASTER', 'Perfil Reto', 'Cabo Tubular', '16oz', '500g', NULL, 2, 10);

-- ============================================================
--  TABELA DE MOVIMENTAÇÕES DE ESTOQUE
-- ============================================================
CREATE TABLE movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    tipo ENUM('entrada', 'saida') NOT NULL,
    quantidade INT NOT NULL,
    data_mov DATE NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- Movimento exemplo
INSERT INTO movimentacoes (produto_id, tipo, quantidade, data_mov)
VALUES (1, 'entrada', 5, '2025-01-01');

-- ============================================================
--  VIEW PARA CONSULTA DE ESTOQUE (Opcional)
-- ============================================================
CREATE OR REPLACE VIEW vw_estoque AS
SELECT 
    p.id,
    p.nome,
    p.estoque_atual,
    p.estoque_minimo,
    CASE 
        WHEN p.estoque_atual <= p.estoque_minimo THEN 'ESTOQUE BAIXO'
        ELSE 'OK'
    END AS status_estoque
FROM produtos p;

