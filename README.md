# Tiny AI Prompt Generator (TinyMCE Plugin)

[![Moodle Plugin CI](https://github.com/blagojevicboban/moodle-tiny_aipromptgen/actions/workflows/ci.yml/badge.svg)](https://github.com/blagojevicboban/moodle-tiny_aipromptgen/actions/workflows/ci.yml)

### The plugin is a product of Erasmus project: KA220-VET - Cooperation partnerships in vocational education and training. Project Title: AI tools for VET schools

**Tiny AI Prompt Generator** is a self-contained TinyMCE plugin for Moodle. It allows teachers to build pedagogical prompts through a guided interface and generate AI responses using **OpenAI**, **Google Gemini**, **Anthropic Claude**, **DeepSeek**, a local **Ollama** server, or any **Custom OpenAI-compatible API**, directly within the editor.

## Features

- **Standalone Guided Builder**: Easily construct prompts by selecting subjects, topics, learning outcomes, and more.
- **AI Response Integration**:
    - **OpenAI**: Connect to GPT-3.5/4/4o models via API key.
    - **Google Gemini**: Support for Gemini 1.5 Pro and Flash models.
    - **Anthropic Claude**: Support for Claude 3.5 Sonnet and Haiku models.
    - **DeepSeek**: Support for DeepSeek Chat and Reasoner models.
    - **Ollama**: Connect to local LLMs (like Llama 3, Phi-3, Mistral) for private, zero-cost generation.
    - **Custom API**: Connect any OpenAI-compatible endpoint (LM Studio, Groq, OpenRouter, vLLM, etc.).
- **Real-time Streaming**: Watch AI responses appear in real-time as they are generated.
- **Rate Limiting**: Prevent abuse by limiting requests per user per hour.
- **Quick Templates**: One-click pedagogical prompt structures for common teaching tasks.
- **Dynamic Tooltips**: Instant visibility of active AI provider/model on the toolbar.
- **Selection Persistence**: Remembers your preferred AI provider across sessions.

## 🛠️ Admin Tuning Controls
- **System Prompt**: Set a global instruction context for all AI responses.
- **Temperature & Max Tokens**: Fine-tune the creativity and length of AI responses.
- **Custom Patterns**: Define your own pedagogical JSON templates for teachers.
- **Admin Tuning Controls** (applies to all providers):
    - **System Prompt**: Define the AI's role and persona site-wide.
    - **Temperature**: Control response creativity (0.0 = precise, 2.0 = very creative). Default: 0.7.
    - **Max Tokens**: Limit response length. Default: 1024.
- **Response Modes**: View and copy AI responses in multiple formats:
    - **RAW**: Exact AI output.
    - **TEXT**: Cleaned up plain text.
    - **HTML**: Rendered formatting.
    - **HTML CODE**: The underlying HTML source.
- **Privacy Compliant**: Implements Moodle Privacy API (null provider - no personal data stored).

## Related Plugins
 
If you prefer a side-block interface instead of an editor-integrated tool, check out:
- **[AI tools for teachers - prompt generator](https://moodle.org/plugins/block_aipromptgen)**: A Moodle block version of this utility.
 
## Compatibility

| Moodle Version | Supported |
|----------------|-----------|
| Moodle 4.1     | ✅        |
| Moodle 4.2     | ✅        |
| Moodle 4.3     | ✅        |
| Moodle 4.4     | ✅        |
| Moodle 4.5     | ✅        |
| Moodle 5.0     | ✅        |
| Moodle 5.1     | ✅        |

**Minimum PHP Version**: 8.1

## Installation

1. Download the plugin and place it in: `lib/editor/tiny/plugins/aipromptgen`
2. Login to Moodle as an administrator.
3. Navigate to **Site administration → Notifications** to complete the installation.
4. Go to **Site administration → Plugins → Text editors → TinyMCE editor → AI Prompt Generator** to configure your API keys (OpenAI) or Ollama endpoints.

## Configuration

### OpenAI Setup
1. Obtain an API key from [OpenAI](https://platform.openai.com/api-keys).
2. Enter your API key in the plugin settings.
3. Choose your preferred model (default: `gpt-4o-mini`).

### Google Gemini Setup
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Enter your API key in the plugin settings.
3. Choose your preferred model (default: `gemini-1.5-flash`).

### Anthropic Claude Setup
1. Obtain an API key from [Anthropic Console](https://console.anthropic.com/).
2. Enter your API key in the plugin settings.
3. Choose your preferred model (default: `claude-3-5-sonnet-20240620`).

### Ollama Setup (Local AI)
1. Install [Ollama](https://ollama.ai/) on your server.
2. Pull a model: `ollama pull llama3`
3. Configure the endpoint in plugin settings (default: `http://localhost:11434`).
4. Set the model name (e.g., `llama3`, `mistral`, `phi3:mini`).

### DeepSeek Setup
1. Obtain an API key from [DeepSeek Platform](https://platform.deepseek.com/).
2. Enter your API key in the plugin settings.
3. Choose your preferred model (default: `deepseek-chat`).
   Available models: `deepseek-chat`, `deepseek-reasoner`.

### Custom API Setup (OpenAI-compatible)
1. Enter the base URL of your custom endpoint in the plugin settings
   (e.g., `http://localhost:1234/v1/chat/completions` for LM Studio,
   or `https://api.groq.com/openai/v1/chat/completions` for Groq).
2. Enter your API key (leave empty if the service does not require one).
3. Enter the model name supported by your endpoint.
   Compatible services include: LM Studio, Groq, Together AI, OpenRouter, vLLM, Jan, and others.

### Custom Templates (JSON)

You can define your own prompt templates that appear in the dropdown menu. Use placeholders like `{subject}`, `{topic}`, `{lesson}`, `{audience}`, `{outcomes}`.

#### Example 1: Simple JSON
```json
[
  {
    "title": "Glossary",
    "prompt": "Create a list of 10 key terms for {subject}, topic: {topic}. Audience: {audience}."
  },
  {
    "title": "Quick Quiz",
    "prompt": "Create a multiple choice quiz (5 questions) for these outcomes: {outcomes}."
  }
]
```

#### Example 2: Complex JSON (Pedagogical Plan)
Use `\n` for new lines.
```json
[
  {
    "title": "Detailed Lesson Plan",
    "prompt": "Write a 5E lesson plan for {subject}.\n\nTopic: {topic}\nOutcomes: {outcomes}"
  }
]
```

---

### Prilagođeni šabloni (JSON) - Srpski

Možete definisati sopstvene šablone koji se pojavljuju u padajućem meniju. Koristite placeholder-e kao što su `{subject}`, `{topic}`, `{lesson}`, `{audience}`, `{outcomes}`.

#### Primer 1: Jednostavan JSON (Kopiraj ovo za testiranje)
Ovo uvodi tri nova šablona u padajući meni: Listu pojmova, Brzi kviz i Osnovu za debatu.

```json
[
  {
    "title": "Glosar pojmova",
    "prompt": "Kreiraj listu od 10 ključnih pojmova i njihovih definicija za predmet {subject}, a konkretno za temu: {topic}. Objašnjenja moraju biti prilagođena uzrastu: {audience}."
  },
  {
    "title": "Brzi test (Multiple Choice)",
    "prompt": "Napravi kratak test višestrukog izbora (5 pitanja, svako sa 4 ponuđena odgovora i označenim tačnim rešenjem) koji pokriva sledeće ishode učenja: {outcomes}."
  },
  {
    "title": "Tema za debatu",
    "prompt": "Na osnovu lekcije '{lesson}', osmisli jednu provokativnu tvrdnju za debatu u učionici. Napiši po tri jake teze 'ZA' i tri teze 'PROTIV'."
  }
]
```

#### 💡 Primer 2: Napredni, kompleksni JSON (Kompletan pedagoški plan)
U ovom primeru prikazujemo kako se koristi `\n` za pravljenje novih redova unutar prompta kako bi instruisali AI da napravi kompleksniji dokument.

```json
[
  {
    "title": "Detaljan plan časa (5ES model)",
    "prompt": "Kao stručnjak za metodiku nastave, napiši detaljan plan časa za predmet {subject} koristeći 5E model (Engage, Explore, Explain, Elaborate, Evaluate).\n\nTema: {topic}\nLekcija: {lesson}\nUzrast: {audience}\nCiljevi: {outcomes}\nTip časa: {style}\nJezik za generisanje: {language}\n\nPlan treba da sadrži vremensku raspodelu za čas od 45 minuta i konkretne instrukcije za svaku od 5E faza."
  },
  {
    "title": "Diferencirani zadaci (3 nivoa težine)",
    "prompt": "Kreiraj set vežbanja za temu '{topic}' (Lekcija: {lesson}), dizajniran za uzrast '{audience}'.\nZahtevam 3 zadatka:\n1. Osnovni nivo (reprodukcija znanja)\n2. Srednji nivo (primena na novom primeru)\n3. Napredni nivo (kritičko razmišljanje ili kreiranje nečeg novog)\n\nFokusiraj se pre svega na ostvarivanje ovog ishoda: {outcomes}"
  }
]
```

**Šta se dešava u praksi?**
Ako administrator kopira ovaj drugi primer u polje **Predefined templates (JSON)** i sačuva postavke, nastavnik će videti "Detaljan plan časa (5ES model)" u dropdown-u. 

Ako nastavnik prethodno unese "Biologija" u polje **Predmet** i klikne na ovaj šablon, `textarea` za prompt će se trenutno osvežiti i `{subject}` će zameniti rečju "Biologija". Nastavnik onda samo pritisne **"Send to AI"** – štedeći sebi kucanje složenih struktura!

## Usage

1. Open the TinyMCE editor (e.g., in a Course Page, Page resource, or Assignment).
2. Look for the **AI Prompt Generator** icon (🤖) in the toolbar.
3. Fill in the prompt details (Subject, Audience, Outcomes, etc.).
4. Select your preferred AI Provider and click **Send to AI**.
5. View the streaming response and copy or use the generated content.

## Permissions

The plugin uses the following capability:
- `tiny/aipromptgen:use`: Controls who can use the AI Prompt Generator.

**Default roles with access**: Manager, Course creator, Editing Teacher, Teacher.

## Building from Source

If you modify the JavaScript source files, rebuild the AMD modules:

```bash
cd lib/editor/tiny/plugins/aipromptgen
grunt amd --force
```

## Technical Requirements

- Moodle 4.1 or higher
- PHP 8.1 or higher
- TinyMCE editor enabled (standard in Moodle 4.x)
- Node.js 20+ (for building AMD modules if modifying the source)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

See [LICENSE](LICENSE) for details.

---

© 2026 AI4Teachers | [Boban Blagojević](https://github.com/blagojevicboban)
