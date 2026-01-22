# 📦 Jak nahrát AnalyzoBot na GitHub

## Krok 1: Vytvořte repozitář na GitHubu

1. Jděte na: https://github.com/new
2. **Repository name:** `analyzobot` (nebo jakýkoliv název)
3. **Description:** "AI-powered sales opportunity analyzer for Etnetera Group"
4. **Visibility:**
   - ✅ **Private** (doporučeno - obsahuje business logiku)
   - nebo Public (pokud chcete open-source)
5. ❌ **NEŠKRTEJTE** "Add a README file" (už máme)
6. ❌ **NEŠKRTEJTE** "Add .gitignore" (už máme)
7. Klikněte **"Create repository"**

## Krok 2: Nahrajte kód

GitHub vám ukáže stránku s instrukcemi. Použijte tuto sekci:

**"…or push an existing repository from the command line"**

Zkopírujte příkazy a spusťte je v terminálu:

```bash
# V terminálu v adresáři analyzobot:

# 1. Přidejte remote (nahraďte YOUR_USERNAME vaším GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/analyzobot.git

# 2. Nahrajte kód
git branch -M main
git push -u origin main
```

### Příklad:
Pokud je váš GitHub username `janmaier123`, příkazy budou:
```bash
git remote add origin https://github.com/janmaier123/analyzobot.git
git branch -M main
git push -u origin main
```

## Krok 3: Ověřte nahrání

1. Obnovte stránku repozitáře na GitHubu
2. Měli byste vidět všechny soubory
3. ✅ Zkontrolujte, že `.env` tam **NENÍ** (je v .gitignore)

## 🔒 Bezpečnost

### ✅ Co je bezpečně ignorováno:
- `.env` - Váš API klíč
- `node_modules/` - Dependencies
- `.vercel/` - Deploy konfigurace

### ⚠️ DŮLEŽITÉ:
Pokud omylem nahrajete `.env` s API klíčem:
1. **IHNED deaktivujte API klíč** na OpenAI
2. Vygenerujte nový API klíč
3. Nikdy necommitujte `.env` do gitu!

## 📝 Další commity

Když provedete změny v kódu:

```bash
# 1. Stage změny
git add .

# 2. Commit
git commit -m "Popis změny"

# 3. Push na GitHub
git push
```

## 🚀 Nasazení na Vercel (volitelné)

1. Jděte na: https://vercel.com
2. Klikněte "New Project"
3. Importujte váš GitHub repozitář
4. Vercel automaticky rozpozná Node.js projekt
5. **Environment Variables:**
   - Přidejte: `OPENAI_API_KEY` s hodnotou vašeho API klíče
   - Přidejte: `AI_PROVIDER` s hodnotou `openai`
6. Klikněte "Deploy"

Po deployi dostanete URL typu: `analyzobot.vercel.app`

---

## 📞 Pomoc

Pokud máte problémy:
- GitHub dokumentace: https://docs.github.com/en/get-started
- Vercel dokumentace: https://vercel.com/docs

---

**Repozitář je připravený k nahrání! Máte vytvořený první commit a vše je správně nakonfigurováno.**
