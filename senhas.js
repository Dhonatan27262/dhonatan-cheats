// senhas.js
const senhasValidas = [
    'admin',
    'tainara',
    'ggg',
    'vitor',
    'pablo',
    'rafael',
    'adm'
];

function verificarSenha(senha) {
    return senhasValidas.includes(senha);
}