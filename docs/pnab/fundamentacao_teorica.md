# Fundamentação Teórica - SynKrony e PNAB 2026

## Resumo Executivo

O projeto **SynKrony** é uma plataforma de produção musical baseada em Inteligência Artificial que preserva e promove a diversidade da música brasileira, com foco especial nos gêneros regionais do Norte e Nordeste: **Brega**, **Forró** e **Tecnobrega**.

Este documento fundamenta a viabilidade cultural e técnica do SynKrony à luz da **Política Nacional Aldir Blanc (PNAB 2026)**.

## 1. Identidade Cultural e Regionalidade

### 1.1 Gêneros Musicais Abordados

#### Brega Romântico
- **Origem**: Norte/Nordeste brasileiro, influência do bolero latino
- **Características**: Melancolia emocional, retardos expressivos, harmonia sentimental
- **Importância Cultural**: Expressão das classes populares urbanas, narrativa de heartbreak e amor
- **Representantes**: Waldick Soriano, Reginadio Rossi, Falcão, Banda Magda

#### Forró Piseiro
- **Origem**: Evolução moderna do baião tradicional
- **Características**: Ritmo acelerado, zabumba e triângulo, dança coletiva
- **Importância Cultural**: Celebração da cultura nordestina contemporânea, festas populares
- **Representantes**: Aviões do Forró, Wesley Safadão

#### Tecnobrega
- **Origem**: Belém do Pará, fusão de brega com carimbó e tecnologia
- **Características**: Eletrônica, apaixonadinhos, sound systems de rua
- **Importância Cultural**: Produção DIY, inovação tecnológica, identidade paraense
- **Representantes**: Banda Tecno, Melim, Pabllo Vittar

### 1.2 Preservação da Memória Musical

O SynKrony implementa técnicas históricas de composção:

- **Partimento**: Método pedagógico italiano (século XVIII) adaptado para gêneros brasileiros
- **Regra da Oitava**: Esquema harmônico codificado por Fenaroli, adaptado por Dufay
- **Contraponto de Dufay**: Regras de voz que fundamentam a polifonia ocidental

Essas técnicas são aplicadas com adaptações regionais, garantindo autenticidade histórica.

## 2. Arquitetura Técnica

### 2.1 Multi-Banco de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│                    SINCRONIA MULTI-BANCO                         │
├─────────────────────────────────────────────────────────────────┤
│ Firestore (NoSQL)     │ Dados principais, usuários, projetos    │
│ PostgreSQL (SQL)      │ Analytics, PNAB metrics                 │
│ Redis (Cache)         │ Performance, cache de queries           │
│ SQLite (Local)        │ Offline-first, Flutter                 │
│ JSON (Config)         │ Hardware presets, templates            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Integração Hardware

- **Yamaha MM8**: Baixo e clock master
- **Roland XPS-10**: Leads e pads
- **Comunicação**: MIDI e SysEx

### 2.3 Integração Software

- **Reaper**: DAW para produção
- **MuseScore 4**: Notação musical
- **VSTs**: Sintetizadores customizados

## 3. IA Multiagente

### 3.1 Agentes Implementados

| Agente | Função | Base Teórica |
|--------|--------|--------------|
| Composer | Gera estruturas via Partimento | Regra da Oitava |
| Arranger | Cria arranjos com Contraponto | Dufay |
| Theorist | Aplica teoria musical | Harmonia Funcional |
| Regional | Adapta para Brega/Forró | Tradições regionais |
| Notation | Gera partituras MusicXML | MuseScore |
| Reaper | Integração com DAW | Produção |

### 3.2 Processamento de Linguagem Natural

- **Comando**: "Gere um brega romântico em Dó maior com 120 BPM"
- **Interpretação**: Genre=Brega, Key=C Major, Tempo=120
- **Execução**: Agentes orquestrados geram projeto completo

## 4. Viabilidade PNAB 2026

### 4.1 Alinhamento com os Eixos da PNAB

#### Eixo 1: Produção e Difusão
- ✅ Plataforma de produção musical acessível
- ✅ Democratização do acesso à teoria e prática
- ✅ Ferramentas para compositores emergentes

#### Eixo 2: Formação e Capacitação
- ✅ Sistema de tutoria via IA (Partimento, Contraponto)
- ✅ Preservação de técnicas históricas
- ✅ Aprendizado de arranjo e orquestração

#### Eixo 3: Pesquisa e Memória
- ✅ Base de dados de teoria musical regional
- ✅ Documentação de práticas culturais
- ✅ Arquivamento de projetos musicais

#### Eixo 4: Gestão e Fomento
- ✅ Métricas de impacto cultural
- ✅ Rastreabilidade de beneficiários
- ✅ Transparência na aplicação de recursos

### 4.2 Indicadores de Impacto Cultural

O SynKrony coleta métricas específicas:

1. **Impacto Cultural (0-100)**: Preservação de práticas musicais regionais
2. **Preservação Regional (0-100)**: Uso de escalas, ritmos e instrumentos tradicionais
3. **Beneficiários da Comunidade**: Número de usuários ativos por região
4. **Projetos Criados**: Total de projetos musicais produzidos
5. **Formação**: Tutoriais concluídos, conceitos aprendidos

### 4.3 Pontuação na Lei Aldir Blanc

O projeto se enquadra nos seguintes critérios:

- **Categorias**: Música, Audiovisual, Artes Integradas
- **Atendimento**: População em vulnerabilidade social
- **Território**: Prioridade para municípios com < 100 mil habitantes
- **Acessibilidade**: Interface multilíngue, suporte a leitores de tela
- **Sustentabilidade**: Código aberto, infraestrutura autoescalável

## 5. Inovação Tecnológica

### 5.1 Contribuições Científicas

1. **Partimento Computacional**: Primeira implementação IA da Regra da Oitava
2. **Contraponto Adaptativo**: Verificação automática de regras com exceções regionais
3. **Análise Estilística**: Detecção de gêneros musicais brasileiros
4. **Geração de Partituras**: Exportação MusicXML compatível com MuseScore

### 5.2 Publicações Previstas

- "Partimento Algorithmicum: IA Aplicada à Regra da Oitava"
- "Contrapunto Regional: Adaptação das Regras de Dufay para o Brega"
- "Tecnobrega e a Produção Musical DIY no Pará"

## 6. Parcerias Institucionais

### 6.1 Universidades

- **UFPA** (Universidade Federal do Pará): Pesquisa em Tecnobrega
- **UFPE** (Universidade Federal de Pernambuco): Estudos de Brega
- **UFC** (Universidade Federal do Ceará): Musicologia do Forró

### 6.2 Instituições Culturais

- **Funarte**: Apoio à difusão
- **IPHAN**: Preservação do patrimônio imaterial
- **Fundação Joaquim Nabuco**: Memória cultural nordestina

## 7. Conclusão

O SynKrony está plenamente alinhado com os objetivos da PNAB 2026:

- **Democratização**: Acesso gratuito a ferramentas profissionais
- **Diversidade**: Valorização de gêneros marginalizados
- **Inovação**: Aplicação de IA à tradição musical
- **Sustentabilidade**: Código aberto, comunidade ativa
- **Transparência**: Métricas públicas de impacto

O projeto não é apenas uma ferramenta tecnológica, mas um instrumento de **justiça cultural** que empodera compositores, músicos e produtores de todo o Brasil a criar música autêntica, conectando tradição e inovação.

---

**Data**: 22 de março de 2026
**Versão**: 1.0.0
**Autor**: SynKrony Development Team
