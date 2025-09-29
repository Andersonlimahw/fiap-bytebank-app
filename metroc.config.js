// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// 🔧 Firebase: garanta suporte a .cjs (evita resolver build errado)
if (!config.resolver.sourceExts.includes("cjs")) {
  config.resolver.sourceExts.push("cjs");
}

// 🔧 Em alguns ambientes, desabilitar package exports evita resolver o bundle web.
// Se já tiver true por padrão e der erro, mude para false. Aqui usamos false.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
