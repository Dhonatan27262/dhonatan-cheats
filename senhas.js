// senhas.js
const senhasValidas = [
    'admin',
    'tainara',
    'ggg',
    'vitor',
    'pablo',
    'aii',
    'rafael',
    'adm'
];

function verificarSenha(senha) {
    return senhasValidas.includes(senha);
}