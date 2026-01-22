# 🚀 Jak nastavit OpenAI API (ZDARMA)

## Krok 1: Získejte API klíč

1. **Jděte na:** https://platform.openai.com/signup
2. **Zaregistrujte se** pomocí:
   - Email
   - Google účet
   - Microsoft účet
3. Po registraci dostanete **$5 kredit ZDARMA** (platí 3 měsíce)

## Krok 2: Vytvořte API klíč

1. Po přihlášení jděte na: https://platform.openai.com/api-keys
2. Klikněte na **"Create new secret key"**
3. Pojmenujte ho např. "AnalyzoBot"
4. **ZKOPÍRUJTE klíč** (začína `sk-proj-...` nebo `sk-...`)
   - ⚠️ Ukáže se jen jednou! Uložte si ho hned!

## Krok 3: Nastavte API klíč v aplikaci

1. Otevřete soubor `.env` v kořenové složce projektu
2. Najděte řádek:
   ```
   OPENAI_API_KEY=your-key-here
   ```
3. **Nahraďte** `your-key-here` vaším skutečným API klíčem:
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
   ```
4. **Uložte soubor**

## Krok 4: Restartujte server

V terminálu kde běží server:
1. Zastavte server: **Ctrl+C** (nebo Cmd+C na Macu)
2. Spusťte znovu:
   ```bash
   npm run dev
   ```
3. Server běží na: http://localhost:3000

## Krok 5: Otestujte aplikaci

1. Otevřete v prohlížeči: **http://localhost:3000**
2. Zadejte testovací IČO: **27082440** (Alza.cz)
3. Klikněte **"Analyzovat"**
4. Aplikace by měla zobrazit:
   - Údaje o firmě
   - PESTLE analýzu
   - Porter analýzu
   - Seznam doporučených IT dodavatelů

---

## 💰 Kolik to stojí?

- **$5 kredit zdarma** při registraci
- Model: GPT-4o-mini
- Cena: **$0.15 za 1 milion tokenů**
- **Jedna analýza = ~$0.001-0.002** (cca 2-5 haléřů)
- **Můžete udělat ~2500-5000 analýz ZDARMA!**

---

## ❓ Troubleshooting

### Chyba: "Neplatný API klíč"
- Zkontrolujte, že jste správně zkopírovali celý klíč
- Ujistěte se, že klíč začíná `sk-` nebo `sk-proj-`
- Restartujte server po změně `.env`

### Chyba: "Rate limit exceeded"
- Máte vyčerpán denní limit (nepravděpodobné s free tierem)
- Počkejte chvíli nebo vytvořte nový účet

### Server nefunguje
```bash
# Zastavte všechny běžící procesy
# Spusťte znovu:
npm run dev
```

---

## 📞 Potřebujete pomoc?

- OpenAI dokumentace: https://platform.openai.com/docs
- Kontrola usage: https://platform.openai.com/usage
- Billing: https://platform.openai.com/settings/organization/billing
