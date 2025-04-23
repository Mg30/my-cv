# 💼 Multilingual CV – Static HTML Resume

A clean, responsive, and printer-friendly static website to showcase your CV/resume. This version supports **English/French language switching**, and ensures that buttons like language toggle and print don’t appear in PDF exports.

---

## 🌍 Features

- ✅ Static HTML/CSS/JS – No framework or backend required
- ✅ Language switcher (English / French)
- ✅ Printer-friendly layout with custom print styles
- ✅ Responsive design for mobile and desktop
- ✅ Easy to customize JSON data

---

## 🗂️ Project Structure

```
.
├── data_en.json        # Your CV content in English
├── data_fr.json        # Your CV content in French
├── index.html          # Static HTML template
├── script.js           # JavaScript for dynamic rendering and switching
├── style.css           # Custom styling and print layout
└── README.md           # You're here!
```

---

## 🚀 Getting Started

### 1. Open in browser

Just open `index.html` in any modern browser (no server required).

### 2. Update your CV

You only need to edit the content in the following JSON files:

- `data_en.json` → English version of your CV
- `data_fr.json` → French version of your CV

Each file contains structured data:
```json
{
  "personalInfo": {
    "name": "Your Name",
    "title": "Your Title",
    "summary": "Short summary...",
    ...
  },
  "experience": [
    {
      "title": "Your job",
      "company": "Company name",
      "description": ["One bullet", "Another bullet"]
    }
  ]
}
```

### 3. Language Switcher

Click the top-left **FR/EN** button to toggle language. Your choice is saved in the browser (`localStorage`), so it's remembered on reload.

> 🖨️ The language button **won’t appear** when printing or saving as PDF.

---

## 🧠 How it works

- On load, JavaScript:
  - Detects the preferred language (`localStorage` or defaults to English)
  - Loads `data_en.json` or `data_fr.json`
  - Populates the HTML dynamically
- The Print button (`📄`) triggers the browser’s print dialog
- Print styles (`@media print`) hide UI elements like buttons and optimize layout for A4/PDF

---

## 📦 Hosting it

To publish your CV online:

1. Push this repo to GitHub
2. Go to your repository settings
3. Enable GitHub Pages (source: root or `main`)
4. Access it at `https://your-username.github.io/your-repo-name`

---

## 🛠 Customize

- **Styles:** Modify `style.css` to match your branding.
- **More languages?** Duplicate `data_en.json` as `data_es.json`, add a button, and extend `script.js`.

Feel free to fork and adapt!

---

## 📄 License

MIT – free to use, adapt, and share.
---