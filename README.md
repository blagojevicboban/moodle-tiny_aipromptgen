# Tiny AI Prompt Generator (TinyMCE Plugin)

[![Moodle Plugin CI](https://github.com/blagojevicboban/moodle-tiny_aipromptgen/actions/workflows/ci.yml/badge.svg)](https://github.com/blagojevicboban/moodle-tiny_aipromptgen/actions/workflows/ci.yml)

**Tiny AI Prompt Generator** is a self-contained TinyMCE plugin for Moodle. It allows teachers to build pedagogical prompts through a guided interface and generate AI responses using **OpenAI** or a local **Ollama** server, directly within the editor.

## Features

- **Standalone Guided Builder**: Easily construct prompts by selecting subjects, topics, learning outcomes, and more.
- **AI Response Integration**:
    - **OpenAI**: Connect to GPT-3.5/4/4o models via API key.
    - **Ollama**: Connect to local LLMs (like Llama 3, Phi-3, Mistral) for private, zero-cost generation.
- **Real-time Streaming**: Watch AI responses appear in real-time as they are generated.
- **Response Modes**: View and copy AI responses in multiple formats:
    - **RAW**: Exact AI output.
    - **TEXT**: Cleaned up plain text.
    - **HTML**: Rendered formatting.
    - **HTML CODE**: The underlying HTML source.
- **Privacy Compliant**: Implements Moodle Privacy API (null provider - no personal data stored).

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

### Ollama Setup (Local AI)
1. Install [Ollama](https://ollama.ai/) on your server.
2. Pull a model: `ollama pull llama3`
3. Configure the endpoint in plugin settings (default: `http://localhost:11434`).
4. Set the model name (e.g., `llama3`, `mistral`, `phi3:mini`).

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

© 2025 AI4Teachers | [Boban Blagojević](https://github.com/blagojevicboban)
