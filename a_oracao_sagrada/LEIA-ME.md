# A Oração Sagrada — site responsivo + aplicativo devocional

Projeto entregue em HTML, CSS e JavaScript. Não depende de frameworks, banco de dados, login ou serviços externos para a navegação e a leitura. Compatível com celular, tablet e computador. Pode ser instalado como aplicativo web (PWA) em navegadores compatíveis, quando hospedado em HTTPS.

## Qual arquivo abrir?

- `index.html` — **aplicativo / portal do produto**, com três pilares, 28 orações, biblioteca pesquisável, favoritos, progresso de leitura, acesso aos três bônus e modal de conteúdo.
- `oferta.html` — **página comercial com espaço para VSL**, botão verde, apresentação do conteúdo, dos bônus e perguntas frequentes.

Basta extrair o ZIP e abrir `index.html` ou `oferta.html` no navegador. Para publicar, envie **todos os arquivos e pastas juntos** a uma hospedagem de sites estáticos, preservando a estrutura.

## Onde editar (sem mexer no layout)?

### 1. Vídeo da VSL, checkout, preço e garantia

Abra `config.js` e preencha:

```js
checkoutUrl: 'https://seu-link-de-checkout.com/',
vslUrl: 'https://seu-provedor.com/embed/ID_DO_VIDEO',
preco: 'R$ 00,00',
garantia: '7 dias',
```

**Atenção:** são exemplos, não condições reais desta oferta. Use preço e garantia verdadeiros. Em `vslUrl`, informe uma URL de incorporação/iframe (não a URL comum de uma página de vídeo). Se seu serviço fornecer um código `<script>`, será preciso inserir o código de incorporação específico no bloco `video-stage` de `oferta.html`.

Enquanto `checkoutUrl` estiver vazio, o botão verde abre uma mensagem de **configuração pendente** e não cobra nem processa pagamentos.

### 2. Orações, títulos, manuscrito comentado e bônus

Todo conteúdo editável está centralizado em `conteudo.js`:

- `principal`: oração principal, reflexão e observação editorial;
- `chapters`: capítulos e comentários do estudo;
- `categories`: categorias das orações;
- `prayers`: as 28 orações individuais;
- `bonuses`: títulos, imagens, descrições e receitas do guia.

As orações atualmente são **composições devocionais autorais de demonstração**, não textos hebraicos traduzidos e certificados. Para afirmar que uma oração foi removida da Bíblia ou que um manuscrito é original, substitua pelo material documental apropriado e inclua a fonte e a revisão histórica. O nome comercial da seção pode ser alterado conforme sua oferta.

### 3. Áudios MP3

Coloque os arquivos de áudio dentro da pasta `audios/` com os nomes abaixo:

| Conteúdo | Arquivo esperado |
|---|---|
| Oração principal | `audios/oracao-salomao.mp3` |
| Bônus Cântico de Deus | `audios/cantico-de-deus.mp3` |
| 7 orações de cura | `audios/cura-1.mp3` a `cura-7.mp3` |
| 7 orações de prosperidade | `audios/pros-1.mp3` a `pros-7.mp3` |
| 7 orações familiares | `audios/fam-1.mp3` a `fam-7.mp3` |
| 7 orações de proteção | `audios/prot-1.mp3` a `prot-7.mp3` |

**Não foram fornecidos arquivos de áudio reais.** Por isso, o site usa leitura em voz alta do navegador como alternativa para os textos de oração, quando disponível. **O Cântico de Deus exige um MP3 próprio** e não é substituído por uma voz sintetizada. Para inserir áudios, simplesmente copie os MP3 para a pasta indicada e faça novamente o upload do site.

### 4. Artes, cores e responsividade

- `site.css`: todas as cores e estilos. A paleta é vinho papal `#3B0D11`, pergaminho `#FAF6EE`, ouro antigo `#C59B27`, texto `#1E1B18` e CTA verde `#16A34A`.
- `assets/`: artes em PNG prontas para exibição, com versões SVG editáveis.
- No computador, o aplicativo tem menu lateral. No celular, tem menu inferior fixo.

### 5. Instalar como aplicativo

O projeto tem `manifest.webmanifest`, ícones e `sw.js` para permitir instalação como PWA em dispositivos/navegadores compatíveis. Isso funciona quando a página é hospedada por **HTTPS** (ou localhost). Ao abrir diretamente pelo disco, a leitura e a navegação funcionam, mas não há instalação/offline via PWA.

### 6. Acesso dos compradores e entrega física

Este protótipo é um **site estático sem login** e o conteúdo não fica protegido contra acesso por URL. Se o produto for vendido, configure sua plataforma de membros ou um sistema de autenticação separado antes de divulgar o endereço do aplicativo.

O botão da edição física exibe uma prévia de dedicatória local. **Ele não registra pedidos, imprime capas, controla estoque nem envia objetos.** A informação de 20 cópias limitadas deverá ser usada somente quando houver estoque real, regras e logística confirmados.

## Observações importantes

- Não foram fabricados depoimentos, vendas, estoque, preço ou garantias.
- O guia Vitalidade Divina é material alimentar geral, não um tratamento. Nenhuma oração substitui atenção médica, psicológica, jurídica ou financeira.
- As preferências (orações marcadas e favoritas) são guardadas no `localStorage` do navegador usado. Elas não são sincronizadas entre dispositivos.
- Como há `service worker`, após publicar uma atualização relevante, aumente o número da variável `CACHE` em `sw.js` (por exemplo, de `v1` para `v2`) se usuários tiverem problemas de cache.

**Arquivos essenciais para upload:** `index.html`, `oferta.html`, `site.css`, `app.js`, `oferta.js`, `config.js`, `conteudo.js`, `manifest.webmanifest`, `sw.js`, `assets/` e `audios/`.
