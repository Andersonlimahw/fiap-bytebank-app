# Envio de imagens e PDFs para o Firebase Storage usando react‑native‑firebase e o novo Document Picker

As versões mais recentes da biblioteca react‑native‑firebase (v26/v27) e do Document Picker foram atualizadas em 2025. O antigo react-native-document-picker foi reescrito e renomeado para @react-native-documents/picker ￼, com API mais segura, suporte a iOS 14+ e novos recursos como acesso de longo prazo ￼. Este guia explica como configurar essas bibliotecas, selecionar imagens ou PDFs a partir do dispositivo e enviar os arquivos para o Firebase Storage.

## 1. Instalação e configuração

1.  Dependências do Firebase – Instale o módulo de aplicativo @react-native-firebase/app e o módulo de armazenamento @react-native-firebase/storage usando Yarn ou npm. O documento oficial esclarece que o módulo de armazenamento requer que o módulo de aplicativo esteja instalado ￼:

```bash
yarn add @react-native-firebase/app
yarn add @react-native-firebase/storage
# iOS – após adicionar os pacotes, execute o pod install
cd ios && pod install && cd ..
```

2. Document Picker (novo pacote) – Para permitir que o usuário selecione arquivos, use o pacote reescrito @react-native-documents/picker. A documentação recomenda instalá‑lo com Yarn ￼ e informa que é compatível com React Native ≥ 0.76 e iOS 14+ ￼:

```bash
yarn add @react-native-documents/picker
# iOS – após instalar, execute pod install e reconstrua o projeto
cd ios && pod install && cd ..
```

Atenção: O novo Document Picker não funciona no aplicativo Expo Go, pois contém código nativo. Caso utilize Expo, é necessário criar um development build com expo prebuild e expo run:android/ios ￼.

3. Regras do Firebase Storage – Por padrão, o bucket do Firebase permite apenas acesso autenticado. Para testes, você pode alterar temporariamente as regras para acesso público (mas restrinja novamente em produção). As regras públicas se parecem com:

```json
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth == null;
    }
  }
}
```

## 2. Criando uma referência de armazenamento

O Firebase organiza o Storage de forma hierárquica. Para interagir com um arquivo é necessário criar uma referência. A documentação da react‑native‑firebase mostra que você pode criar referências simples ou em diretórios profundos ￼:

```javascript
import storage from "@react-native-firebase/storage";

// referência simples
const refImagem = storage().ref("imagens/camisa-preta.png");

// referência em um diretório
const refPdf = storage().ref("documentos/contrato.pdf");
```

As referências não precisam apontar para arquivos que já existam; se você enviar um arquivo novo, o Firebase criará o caminho automaticamente.

## 3. Selecionando imagens ou PDFs com o novo Document Picker

O novo pacote @react-native-documents/picker trabalha com dois modos de seleção: import (padrão) e open. No import mode, o arquivo é copiado temporariamente para o sandbox do aplicativo, enquanto no open mode o app recebe uma URI com acesso direto ao arquivo ￼. Para upload de arquivos ao Firebase, o modo import é mais seguro porque dá acesso a uma cópia local do arquivo, evitando que a URI seja invalidada.

Filtrando por tipo de arquivo

Você pode limitar os tipos de arquivos exibidos no picker usando o objeto types. A documentação demonstra um exemplo para permitir apenas PDFs ou DOCX ￼, mas também existem tipos para imagens e vídeos. Exemplo de seleção de PDFs:

```js
import { pick, types } from "@react-native-documents/picker";

async function selecionarPdf() {
  try {
    const [file] = await pick({ type: [types.pdf] });
    // file contém: uri, name, size, type, etc.
    return file;
  } catch (err) {
    // trate erros (por exemplo: cancelamento)
    return null;
  }
}
```

Para selecionar imagens, use type: [types.images]. O picker sempre retorna um array com pelo menos um elemento (mesmo com allowMultiSelection: false) ￼.

Convertendo content:// URIs em caminhos locais

No Android, as URIs retornadas podem ser do tipo content://, que não são diretamente aceitas pelo método putFile. O Document Picker fornece a função keepLocalCopy para copiar o conteúdo para o diretório de cache ou documentos do aplicativo ￼. Essa função abre um InputStream com a URI, copia os bytes para um arquivo no armazenamento do aplicativo e retorna o novo caminho local ￼. Exemplo:

```js
import { pick, keepLocalCopy, types } from "@react-native-documents/picker";

async function obterCaminhoLocal() {
  const [{ uri, name }] = await pick({ type: [types.pdf, types.images] });
  // Cria cópia local no diretório de cache
  const [copyResult] = await keepLocalCopy({
    files: [{ uri, fileName: name ?? "arquivo" }],
    destination: "cachesDirectory", // ou 'documentDirectory' para tornar permanente
  });
  if (copyResult.status === "success") {
    return { localUri: copyResult.localUri, fileName: name };
  }
  throw new Error(copyResult.copyError ?? "Falha ao copiar o arquivo");
}
```

Embora seja possível passar URIs content:// diretamente para putFile em alguns casos, a documentação recomenda usar keepLocalCopy para garantir que o arquivo não seja removido pela plataforma ￼ e para converter URIs virtuais em arquivos reais ￼.

## 4. Enviando o arquivo para o Firebase Storage

O método putFile do Firebase aceita um caminho de arquivo local (file://) e retorna um objeto Task que permite acompanhar o progresso. A documentação oficial mostra como usar putFile e monitorar o progresso ￼ ￼:

```js
import storage from "@react-native-firebase/storage";
import { utils } from "@react-native-firebase/app";

async function enviarParaFirebase(localUri, destinoRemoto) {
  // Crie uma referência; destinoRemoto deve incluir subpastas, por ex. 'imagens/meuArquivo.png'
  const ref = storage().ref(destinoRemoto);

  // Inicia o upload e retorna uma task
  const task = ref.putFile(localUri);

  // Acompanhar progresso (bytes enviados x bytes totais)
  task.on("state_changed", (taskSnapshot) => {
    console.log(
      `${taskSnapshot.bytesTransferred} enviados de ${taskSnapshot.totalBytes}`
    );
  });

  // Aguarde o término do upload
  await task;

  // Obtenha a URL de download
  const downloadUrl = await ref.getDownloadURL();
  return downloadUrl;
}
```

A Task permite pausar e retomar o envio, se necessário ￼. O getDownloadURL gera uma URL pública para acessar o arquivo ￼.

## 5. Exemplo completo: selecionando e enviando imagem ou PDF

O exemplo abaixo demonstra um componente React Native simplificado que permite ao usuário escolher uma foto ou PDF e fazer upload para o Firebase Storage. O nome do arquivo é usado para construir o caminho remoto; você pode personalizar conforme sua necessidade (por exemplo, adicionar um timestamp ou ID do usuário).

```js
import React from "react";
import { View, Button, Alert } from "react-native";
import storage from "@react-native-firebase/storage";
import { pick, types, keepLocalCopy } from "@react-native-documents/picker";

async function uploadFile() {
  try {
    // 1. Seleciona imagem ou PDF
    const [{ uri, name, type }] = await pick({
      type: [types.images, types.pdf],
    });

    // 2. Garante uma cópia local (útil no Android para URI content://)
    const [copyResult] = await keepLocalCopy({
      files: [{ uri, fileName: name ?? "arquivo" }],
      destination: "cachesDirectory",
    });
    if (copyResult.status !== "success") {
      throw new Error(copyResult.copyError ?? "Falha ao copiar arquivo");
    }
    const localUri = copyResult.localUri;

    // 3. Define caminho remoto no Storage
    const pasta = type?.startsWith("image") ? "imagens" : "pdfs";
    const remotePath = `${pasta}/${name}`;

    // 4. Envia o arquivo
    const ref = storage().ref(remotePath);
    const task = ref.putFile(localUri);

    task.on("state_changed", (snapshot) => {
      const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Progresso: ${pct.toFixed(0)}%`);
    });

    await task; // espera conclusão

    const downloadUrl = await ref.getDownloadURL();
    Alert.alert("Upload concluído", `URL: ${downloadUrl}`);
  } catch (err) {
    console.error(err);
    Alert.alert("Erro", String(err));
  }
}

export default function MeuComponente() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Selecionar e enviar arquivo" onPress={uploadFile} />
    </View>
  );
}
```

## Considerações finais

• Compatibilidade: Certifique‑se de que o projeto está rodando em uma versão de React Native e de iOS/Android compatível com o novo Document Picker ￼. Caso utilize Expo, é necessário usar development build ￼.
• Tipos de arquivos: Para restringir tipos, use o array type com valores do enum types ￼ (ex.: types.pdf, types.images, types.docx).
• Conversão de URIs: O método keepLocalCopy é útil para transformar URIs content:// em arquivos locais ￼ e evitar que o sistema apague o arquivo ￼.
• Tamanho de arquivos e rede: O Firebase Storage lida bem com redes instáveis e permite acompanhar o progresso via Task ￼. Para uploads grandes, considere exibir uma barra de progresso e tratar pausas/resumos ￼.
