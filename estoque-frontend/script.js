const API = "http://localhost:3000";

// ---------------------- LOGIN -----------------------
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                document.getElementById("msg").innerText = data.error;
                return;
            }

            // Salva usuário
            localStorage.setItem("usuario", data.user.username);

            window.location.href = "home.html";
        });
}

// ---------------------- LOGOUT -----------------------
function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "index.html";
}

// Mostrar nome do usuário logado
if (document.getElementById("usernameDisplay")) {
    document.getElementById("usernameDisplay").innerText =
        "Logado como: " + (localStorage.getItem("usuario") || "");
}

// ---------------------- PRODUTOS -----------------------
function carregarProdutos() {
    const termo = document.getElementById("search").value;

    const url =
        termo.trim() === ""
            ? `${API}/products`
            : `${API}/products/buscar?q=${termo}`;

    fetch(url)
        .then(res => res.json())
        .then(produtos => {
            const tabela = document.getElementById("tabela");
            tabela.innerHTML = `
                <tr>
                    <th>ID</th><th>Nome</th><th>Marca</th><th>Modelo</th>
                    <th>Material</th><th>Tamanho</th><th>Peso</th><th>Tensão</th>
                    <th>Est. Min</th><th>Est. Atual</th>
                    <th>Ações</th>
                </tr>
            `;

            produtos.forEach(p => {
                tabela.innerHTML += `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.nome}</td>
                        <td>${p.marca}</td>
                        <td>${p.modelo}</td>
                        <td>${p.material}</td>
                        <td>${p.tamanho}</td>
                        <td>${p.peso}</td>
                        <td>${p.tensao}</td>
                        <td>${p.estoque_min}</td>
                        <td>${p.estoque_atual}</td>
                        <td>
                            <button onclick="excluirProduto(${p.id})">Excluir</button>
                        </td>
                    </tr>
                `;
            });
        });
}

function cadastrarProduto() {
    const nome = document.getElementById("nome").value;
    const marca = document.getElementById("marca").value;
    const modelo = document.getElementById("modelo").value;
    const material = document.getElementById("material").value;
    const tamanho = document.getElementById("tamanho").value;
    const peso = document.getElementById("peso").value;
    const tensao = document.getElementById("tensao").value;
    const estoque_min = document.getElementById("estoque_min").value;
    const estoque_atual = document.getElementById("estoque_atual").value;

    fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nome, marca, modelo, material, tamanho, peso,
            tensao, estoque_min, estoque_atual
        })
    })
        .then(res => res.json())
        .then(() => carregarProdutos());
}

function excluirProduto(id) {
    fetch(`${API}/products/${id}`, { method: "DELETE" })
        .then(() => carregarProdutos());
}

// ---------------------- ESTOQUE -----------------------

function carregarSelectProdutos() {
    if (!document.getElementById("produtoSelect")) return;

    fetch(`${API}/products`)
        .then(res => res.json())
        .then(lista => {
            const select = document.getElementById("produtoSelect");
            select.innerHTML = "";

            lista.forEach(p => {
                select.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
            });
        });
}

carregarSelectProdutos();

function movimentarEstoque() {
    const produto_id = document.getElementById("produtoSelect").value;
    const tipo = document.getElementById("tipo").value;
    const quantidade = document.getElementById("quantidade").value;
    const data_mov = document.getElementById("data").value;

    fetch(`${API}/stock/movimentar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produto_id, tipo, quantidade, data_mov })
    })
        .then(res => res.json())
        .then(r => {
            document.getElementById("alerta").innerText =
                r.alerta ? r.message : "Movimentação registrada com sucesso!";
        });
}
