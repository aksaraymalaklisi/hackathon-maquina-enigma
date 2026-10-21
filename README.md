# [INSERIR NOME DO PROJETO] - Hackathon Vassouras (2026)

![Status do Projeto](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![Plataforma](https://img.shields.io/badge/Plataformas-Desktop_&_Mobile-blue)

🔗 **Acesso à Aplicação:** [INSERIR LINK DE PRODUÇÃO AQUI]

## 1. Descrição do Problema e Solução

O Desafio 2 (Comunicação Segura: Enigma x Criptografia Moderna) propõe a necessidade de entender a segurança da informação sob a ótica histórica e moderna, evidenciando que falhas de projeto arquitetural e procedimental são muitas vezes mais perigosas do que o algoritmo em si.

**Nossa Solução:**
Desenvolvemos uma aplicação web multiplataforma (compatível com PC e celular) que recria visualmente e logicamente de 2 a 4 máquinas Enigma. O sistema criptografa mensagens com uma implementação fiel da lógica dos rotores, plugboard e refletor, e realiza o transporte das mensagens de forma offline (Air-gapped) gerando e lendo QR Codes pela câmera. Adicionalmente, nossa aplicação cifra a mesma mensagem com um algoritmo atual (AES), exibindo um painel comparativo de vulnerabilidades e tempo de quebra por força bruta.

[INSERIR UMA OU DUAS FOTOS DA APLICAÇÃO AQUI - Ex: Máquina rodando, leitura do QR code, Painel Comparativo]

## 2. Arquitetura e Protocolo

Nossa arquitetura segue um princípio rigoroso de desacoplamento:

* **Camada de Cifra:** Processamento assíncrono puro da lógica matemática da Enigma (avanço de rotores, conexões) e da criptografia AES-GCM moderna.
* **Protocolo de Rede:** O transporte de dados não ocorre por internet convencional, mas otimizado para o mundo físico. O QR Code contém o texto cifrado e o seguinte cabeçalho de protocolo:
  * `[Remetente]`
  * `[Destinatário]`
  * `[Indicador de Chave]`
* **Camada de Interface Gráfica:** Responsável unicamente pela imersão visual 2.5D/3D, cliques, sons mecânicos, e renderização dinâmica baseada no estado da cifra.

[INSERIR DIAGRAMA DE ARQUITETURA AQUI]

## 3. Tecnologias e Inteligências Artificiais Utilizadas

O projeto faz uso de ferramentas modernas declaradas abaixo, mantendo a conformidade com as regras do edital (LGPD e direitos de terceiros):

**Stack Tecnológica:**

* **[INSERIR LINGUAGEM/FRAMEWORK - Ex: Vite, React, TypeScript]**
* **[INSERIR ESTILIZAÇÃO/3D - Ex: TailwindCSS, Three.js, React Three Fiber]**
* **[INSERIR BIBLIOTECAS ESPECÍFICAS - Ex: Web Crypto API (AES-GCM), qrcode.react, html5-qrcode]**
* **[INSERIR SERVIÇO DE HOSPEDAGEM - Ex: Vercel]**

**Uso de IA e Código de Terceiros:**

* **Ferramentas de IA:** [INSERIR EXPLICITAMENTE SE USOU COPILOT, CHATGPT, GEMINI PARA GERAR ALGORITMOS OU ASSETS].
* **Código de Terceiros/Preexistente:** [INSERIR SE HOUVE REAPROVEITAMENTO DE CÓDIGO DA EQUIPE OU TEMPLATES].

## 4. Instruções de Execução

**Acesso Remoto (Recomendado para Celulares):**

1. Acesse o link oficial de produção: `[INSERIR LINK AQUI]` (Hospedado na Vercel/Netlify com HTTPS para garantir as permissões de acesso à câmera).
2. Em um dispositivo, defina-o como "Remetente", gere a configuração e aponte a câmera do dispositivo "Destinatário" para o QR Code gerado.

**Execução Local (Para desenvolvimento / PC):**

1. Clone o repositório: `git clone [INSERIR LINK DO REPO]`
2. Instale as dependências: `[INSERIR COMANDO EX: npm install]`
3. Inicie o servidor local: `[INSERIR COMANDO EX: npm run dev]`
4. O aplicativo ficará disponível em `http://localhost:[PORTA]`

## 5. Divisão de Tarefas da Equipe

Alinhado ao nosso quadro Kanban (Trello), o trabalho foi distribuído da seguinte forma para maximizar a eficiência multidisciplinar durante o evento:

* **[NOME DO INTEGRANTE 1]:** [INSERIR TAREFAS - Ex: Lógica Criptográfica e Motor da Enigma]
* **[NOME DO INTEGRANTE 2]:** [INSERIR TAREFAS - Ex: Interface Imersiva, UX/UI e Integração de Sons]
* **[NOME DO INTEGRANTE 3]:** [INSERIR TAREFAS - Ex: Geração e Leitura do Protocolo de QR Code]
* **[NOME DO INTEGRANTE 4]:** [INSERIR TAREFAS - Ex: Painel Comparativo AES, Gráficos de Análise e Arquitetura]
* **[NOME DO INTEGRANTE 5]:** [INSERIR TAREFAS - Ex: Qualidade de Engenharia, Testes e Documentação Técnica]
