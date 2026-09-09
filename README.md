# 🌱 Rastreador de Hábitos

Um aplicativo web simples e elegante para rastrear seus hábitos diários. Acompanhe seu progresso ao longo das semanas e mantenha-se motivado!

## ✨ Recursos

- 📅 **Visualização por semana** - Navegue entre semanas facilmente
- ✅ **Rastreamento de hábitos** - Marque cada dia que completou o hábito
- 📊 **Resumo de progresso** - Veja quantos hábitos completou nesta semana
- 💾 **Exportar/Importar dados** - Salve e restaure seus dados em JSON
- 🔔 **Lembrete por WhatsApp** - Configure lembretes automáticos (em desenvolvimento)
- 📱 **Responsivo** - Funciona em desktop, tablet e celular

## 🚀 Como Usar

1. Abra `index.html` no seu navegador
2. Digite o nome do hábito (ex: "beber água", "exercitar")
3. Clique em "Adicionar" para criar o hábito
4. Clique nos dias da semana para marcar/desmarcar o hábito como completo
5. Use os botões de navegação (‹ e ›) para ver outras semanas

## 💾 Exportar e Importar

- **Exportar**: Clique "⬇ Exportar dados" para baixar um arquivo JSON com todos seus hábitos
- **Importar**: Clique "⬆ Importar dados" e selecione um arquivo JSON previamente exportado

## 🔔 Lembrete por WhatsApp (Beta)

1. Clique em "🔔 Lembrete WhatsApp"
2. Preencha seu número WhatsApp e informações de autenticação
3. Clique "Baixar configuração"
4. Mova o arquivo `whatsapp-config.json` para a pasta do projeto

## 📋 Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- JSON para persistência de dados

## 📝 Estrutura de Arquivos

```
rastreador-habitos/
├── index.html              # Página principal
├── style.css               # Estilos
├── script.js               # Lógica da aplicação
├── whatsapp-config.json    # Configuração do WhatsApp (criado pelo usuário)
└── habitos-YYYY-MM-DD.json # Dados exportados (criado pelo usuário)
```

## 🤝 Como Contribuir

Encontrou um bug ou tem uma ideia? Sinta-se à vontade para abrir uma issue ou enviar um pull request!

## 📄 Licença

Este projeto é de código aberto e está disponível livremente para uso pessoal e educacional.

---

**Desenvolvido com ❤️ para ajudar você a manter seus hábitos no caminho certo!**
