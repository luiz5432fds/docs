# Mintlify Starter Kit

Click on `Use this template` to copy the Mintlify starter kit. The starter kit contains examples including

- Guide pages
- Navigation
- Customizations
- API Reference pages
- Use of popular components

### Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview the documentation changes locally. To install, use the following command

```
npm i -g mintlify
```

Run the following command at the root of your documentation (where docs.json is)

```
mintlify dev
```

### Publishing Changes

Install our Github App to auto propagate changes from your repo to your deployment. Changes will be deployed to production automatically after pushing to the default branch. Find the link to install on your dashboard. 

#### Troubleshooting

- Mintlify dev isn't running - Run `mintlify install` it'll re-install dependencies.
- Page loads as a 404 - Make sure you are running in a folder with `docs.json`

## Piano Teacher Web App

Um exemplo simples de aplicação web para interagir com a IA descrita em `piano-teacher.mdx`. Para executar:

```bash
cd piano_webapp
pip install -r requirements.txt
python app.py
```

Acesse `http://localhost:5000` no navegador. Configure a variável de ambiente `OPENAI_API_KEY` para obter respostas reais do modelo da OpenAI.

### Requisitos de Python

Certifique-se de ter o **Python 3.8 ou superior** instalado. Verifique com `python3 --version`.

### Configurando a chave da OpenAI

Defina a variável de ambiente `OPENAI_API_KEY` antes de iniciar a aplicação. Em sistemas Unix use:

```bash
export OPENAI_API_KEY=sk-sua-chave
```

No Windows utilize `set OPENAI_API_KEY=<sua-chave>` ou $env:OPENAI_API_KEY="<sua-chave>" no PowerShell.

A chave precisa estar disponível no ambiente onde `python app.py` será executado.
