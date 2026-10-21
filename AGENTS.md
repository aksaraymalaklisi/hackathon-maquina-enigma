# AGENTS.md — Diretrizes de Desenvolvimento e Governança de IA

Este documento define as regras, restrições arquiteturais e limites de escopo para agentes de inteligência artificial que colaboram no desenvolvimento deste projeto durante o **Hackathon Softwares e IoT em Ação (Desafio 2: Comunicação Segura — Enigma x Criptografia Moderna)**.

Qualquer agente gerando código para este repositório **deve** ler, compreender e aderir a estas instruções antes de propor alterações.

---

## 1. Princípios Gerais e Regras de Ouro

1. **Prioridade Funcional vs. Visual:** Conforme o edital, a cifra correta, o transporte por QR Code e o comparativo moderno valem muito mais do que o acabamento visual (uma máquina funcional em 2.5D ou 3D otimizado supera visual complexo sem a lógica operante). **Nunca comprometa a estabilidade do motor de cifra para adicionar firulas visuais.**
2. **Explicabilidade Técnica Obrigatória:** Toda a equipe passará por uma arguição técnica perante a banca avaliadora. O agente **não deve** introduzir abstrações excessivas, padrões opacos ou código desnecessariamente complexo. Escreva código idiomático, limpo, bem tipado em TypeScript e fácil de defender verbalmente.
3. **Privacidade e LGPD:** Não inclua nomes de terceiros, logotipos registrados ou dados pessoais reais em mocks ou fixtures. Use apenas dados sintéticos/anonimizados.
4. **Respeito aos Prazos do Evento:** O congelamento dos repositórios ocorre pontualmente às **19h00 de quarta-feira (21/10/2026)**. Sugestões e refatorações devem focar em entregas rápidas, seguras e incrementais.

---

## 2. Stack Tecnológica Autorizada

O agente **não deve** adicionar novas dependências sem necessidade extrema. Mantenha-se estritamente na stack do projeto:

* **Linguagem & Plataforma:** TypeScript, React (Vite), Tailwind CSS.
* **Camada 3D/Gráfica:** Three.js, `@react-three/fiber`, `@react-three/drei`.
* **Criptografia Moderna:** Web Crypto API nativa do navegador (`window.crypto.subtle` com AES-GCM e SHA-256). **Não instale `crypto-js` ou pacotes externos redundantes.**
* **QR Code:** `qrcode.react` (geração) e `html5-qrcode` (leitura por câmera).
* **Gráficos e Estatística:** `recharts` (para análise de frequência e comparativos).
* **Efeitos Sonoros:** Web Audio API nativa ou `howler`.

---

## 3. Arquitetura em Três Camadas (Isolamento Estrito)

O projeto exige separação mandatória de responsabilidades. O agente **nunca** deve acoplar a lógica criptográfica a componentes visuais:

src/
├── core/                  # Camada de Cifra (Zero dependências visuais/React)
│   ├── enigma/            # Rotores, Refletor, Plugboard, Step Logic
│   └── modern/            # AES-GCM, Hash SHA-256 via Web Crypto
├── protocol/              # Protocolo de Transporte & Validação (QR Code)
│   ├── types.ts           # Definição do cabeçalho da mensagem
│   ├── serializer.ts      # Empacotamento / Desempacotamento de payload
│   └── validator.ts       # Detecção de integridade / adulteração
└── ui/                    # Interface Gráfica, Componentes e Visualização
├── scene/             # Three.js / Canvas R3F
├── components/        # Teclado, Lampboard, Folha de Chaves, Comparativo
└── hooks/             # Adaptação e hooks de som e câmera

### Regras das Camadas

* `src/core/`: Funções e classes puras. **Proibido** importar React, Three.js, DOM, Canvas ou CSS aqui. Deve ser testável isoladamente via testes unitários.
* `src/protocol/`: Manipula apenas serialização e desserialização de payloads. Não depende da renderização visual.
* `src/ui/`: Apenas consome as saídas de `core/` e `protocol/`.

---

## 4. Requisitos de Domínio Criptográfico (Não Quebrar a Lógica)

Ao trabalhar na máquina Enigma (`src/core/enigma`):

* **Passo do Rotor (Stepping):** O rotor rápido avança a cada tecla; ao atingir o entalhe (notch), engata e avança o rotor vizinho (mecanismo clássico de odômetro com double-stepping se aplicável).
* **Simetria:** Cifrar o texto cifrado com as mesmas configurações de chave deve reproduzir exatamente o texto original.
* **Propriedade Fundamental da Enigma:** Uma letra **nunca** pode ser cifrada como ela mesma ($E(x) \neq x$). O motor deve respeitar essa restrição mecânica real.
* **Plugboard (Steckerbrett):** Trocas de pares de letras devem ocorrer tanto na entrada quanto no retorno do sinal.

Ao trabalhar na Criptografia Moderna (`src/core/modern`):

* Use **AES-GCM** (autenticado) com IV único de 12 bytes gerado criptograficamente (`crypto.getRandomValues`).
* Garanta a verificação de integridade: caso qualquer bit do texto cifrado seja adulterado, a descriptografia deve falhar com exceção perceptível e ser destacada na UI.

---

## 5. Especificação do Protocolo QR Code

O payload transferido via QR Code deve respeitar o seguinte contrato de formato para garantir interoperabilidade entre máquinas da rede:

```json
{
  "protocol": "ENIGMA-NET-v1",
  "sender": "MACHINE_01",
  "recipient": "MACHINE_02",
  "keyIndicator": "A-I-IV-V:01-12-24:B",
  "mode": "ENIGMA" | "AES",
  "timestamp": 1729500000000,
  "payload": "TEXTO_CIFRADO_OU_BASE64",
  "mac": "HASH_SHA256_OU_TAG_SE_MODERNO",
  "part": 1,
  "totalParts": 1
}
```

* Os campos `part` e `totalParts` são opcionais (default 1) para viabilizar o diferencial de fragmentação de mensagens longas em múltiplos QR Codes.
* O `keyIndicator` codifica: `[Refletor]-[Rotores E-M-D]:[Ringstellung]:[Grundstellung]`. Exemplo: `B-I-IV-V:01-12-24:A-B-C`.

---

## 6. Desempenho, Mobile e Modo Leve (Obrigatório)

O edital exige execução funcional em celulares e PCs. Como motores 3D (WebGL) podem sofrer estrangulamento ou falhas de memória em smartphones:

1. **Modo Leve (2.5D / SVG / Canvas):** Deve existir uma chave de alternância (`Toggle 3D / Modo Leve`) ou detecção automática de dispositivo de baixa performance. O modo leve deve renderizar teclado, lâmpadas e rotores em 2D/2.5D skeuomórfico sem WebGL.
2. **Otimização do Modelo 3D:** Qualquer asset GLB/glTF deve ter contagem máxima de polígonos controlada (ideal < 60k faces no total), texturas comprimidas e materiais PBR simples.
3. **Câmera Mobile:** A leitura do QR Code requer conexão segura HTTPS (hospedagem Vercel/Netlify) e liberação de permissão de mídia via API padrão do navegador.

---

## 7. Qualidade de Engenharia e Testes Automatizados

Para garantir os 15% de Qualidade de Engenharia e segurança na Arguição Técnica:

1. **Testes Unitários Mandatórios (`vitest`):**
   * **Simetria Enigma:** Cifrar e decifrar com a mesma chave restaura o texto idêntico.
   * **Propriedade Anti-Reflexiva:** $E(x) \neq x$ para todas as letras em todas as posições.
   * **Mecanismo de Avanço:** Double-stepping do rotor do meio testado rigorosamente.
   * **Chave Incorreta:** Prova automatizada de que chave divergente gera texto ilegível.
   * **Integridade AES-GCM:** Adulteração de 1 único caractere/bit do payload deve disparar rejeição de autenticação (MAC inválido).
2. **Isolamento de Código:** A suíte de testes deve rodar diretamente sobre `src/core/` e `src/protocol/` sem inicializar o DOM ou renderizadores gráficos.

