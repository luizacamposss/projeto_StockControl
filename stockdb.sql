--DDL

-- 1. Tabela Usuario
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL, 
    ativo BOOLEAN DEFAULT TRUE
);

-- 2. Tabela Produto
CREATE TABLE Produto (
    id_produto SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    descricao TEXT,
    tipo_produto VARCHAR(50), 
    nivel_minimo_estoque INTEGER DEFAULT 0, -- Para o alerta configurável
    ativo BOOLEAN DEFAULT TRUE
);

-- 3. Tabela Estoque (1:1 com Produto)
CREATE TABLE Estoque (
    id_produto INTEGER PRIMARY KEY, -- PK e FK para garantir 1:1
    quantidade_atual INTEGER DEFAULT 0 NOT NULL,
    data_ultima_atualizacao TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
);

-- 4. Tabela MovimentacaoEstoque
CREATE TABLE MovimentacaoEstoque (
    id_movimentacao SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_usuario INTEGER NOT NULL,
    tipo VARCHAR(10) CHECK (tipo IN ('ENTRADA', 'SAIDA')) NOT NULL, 
    quantidade INTEGER NOT NULL,
    data_movimentacao TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    observacoes TEXT,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- 5. Tabela Caracteristica
CREATE TABLE Caracteristica (
    id_caracteristica SERIAL PRIMARY KEY,
    nome VARCHAR(50) UNIQUE NOT NULL, 
    descricao VARCHAR(255)
);

-- 6. Tabela Associativa ProdutoCaracteristica (N:M)
CREATE TABLE ProdutoCaracteristica (
    id_produto INTEGER NOT NULL,
    id_caracteristica INTEGER NOT NULL,
    valor_caracteristica VARCHAR(100) NOT NULL, 
    
    PRIMARY KEY (id_produto, id_caracteristica), -- Chave Primária Composta
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto),
    FOREIGN KEY (id_caracteristica) REFERENCES Caracteristica(id_caracteristica)
);

-- function
-- Garante que a função anterior seja descartada antes de criar a nova
DROP FUNCTION IF EXISTS atualizar_estoque_apos_movimentacao() CASCADE; 

-- CRIA a Função que contém a lógica de SUMA/SUBTRAÇÃO
CREATE OR REPLACE FUNCTION atualizar_estoque_apos_movimentacao()
RETURNS TRIGGER AS $$
BEGIN
    -- Lógica IF/ELSE para determinar a operação de estoque
    IF NEW.tipo = 'ENTRADA' THEN
        -- SOMA a quantidade ao estoque atual
        UPDATE Estoque
        SET quantidade_atual = quantidade_atual + NEW.quantidade,
            data_ultima_atualizacao = NOW()
        WHERE id_produto = NEW.id_produto;
    
    ELSIF NEW.tipo = 'SAIDA' THEN
        -- SUBTRAI a quantidade do estoque atual
        UPDATE Estoque
        SET quantidade_atual = quantidade_atual - NEW.quantidade,
            data_ultima_atualizacao = NOW()
        WHERE id_produto = NEW.id_produto;
    END IF;

    -- Retorna NEW (necessário para triggers AFTER INSERT)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- trigger
-- CRIA o Trigger que dispara a função após uma nova inserção
CREATE TRIGGER trg_atualizar_estoque
AFTER INSERT ON MovimentacaoEstoque
FOR EACH ROW
EXECUTE FUNCTION atualizar_estoque_apos_movimentacao();

-- views
-- para alerta de estoque baixo
CREATE VIEW v_alertas_estoque_baixo AS
SELECT
    P.nome AS Produto,
    P.marca AS Marca,
    E.quantidade_atual AS EstoqueAtual,
    P.nivel_minimo_estoque AS NivelMinimo,
    (P.nivel_minimo_estoque - E.quantidade_atual) AS DiferencaParaReposicao
FROM
    Produto P
INNER JOIN
    Estoque E ON P.id_produto = E.id_produto
WHERE
    E.quantidade_atual <= P.nivel_minimo_estoque
ORDER BY
    DiferencaParaReposicao DESC;

-- para detalhamento de caracteristicas
CREATE VIEW v_detalhe_produto_caracteristica AS
SELECT
    P.id_produto,
    P.nome AS Produto,
    P.modelo AS Modelo,
    C.nome AS Caracteristica, 
    PC.valor_caracteristica AS ValorDetalhe
FROM
    Produto P
INNER JOIN
    ProdutoCaracteristica PC ON P.id_produto = PC.id_produto
INNER JOIN
    Caracteristica C ON PC.id_caracteristica = C.id_caracteristica
ORDER BY
    P.nome, C.nome;