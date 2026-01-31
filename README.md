# Tiny AI Prompt Generator (TinyMCE Plugin)

**Tiny AI Prompt Generator** is a self-contained TinyMCE plugin for Moodle. It allows teachers to build pedagogical prompts through a guided interface and generate AI responses using **OpenAI** or a local **Ollama** server, directly within the editor.

## Features

- **Standalone Guided Builder**: Easily construct prompts by selecting subjects, topics, learning outcomes, and more.
- **AI Response Integration**:
    - **OpenAI**: Connect to GPT-3.5/4 models via API key.
    - **Ollama**: Connect to local LLMs (like Llama 3, Phi-3, Mistral) for private, zero-cost generation.
- **Response Modes**: View and copy AI responses in multiple formats:
    - **RAW**: Exact AI output.
    - **TEXT**: Cleaned up plain text.
    - **HTML**: Rendered formatting.
    - **HTML CODE**: The underlying HTML source.
- **Direct Insertion**: Insert the generated content (Formatted Rich Text) with a single click into your Moodle editor.

## Installation

1. Place the plugin code in your Moodle directory: `lib/editor/tiny/plugins/aipromptgen`.
2. Login to Moodle as an administrator.
3. Navigate to **Site administration > Notifications** to complete the installation.
4. Go to **Site administration > Plugins > Text editors > TinyMCE editor > AI Prompt Generator** to configure your API keys (OpenAI) or Ollama endpoints.

## Usage

1. Open the TinyMCE editor (e.g., in a Course Page, Page resource, or Assignment).
2. Look for the **AI Prompt Generator** icon (Robot-like icon) in the toolbar.
3. Fill in the prompt details (Subject, Audience, Outcomes, etc.).
4. Select your preferred AI Provider and click **Send to AI**.
5. Once the AI responds, click **Insert** to inject the content into the editor.

## Permissions

The plugin uses the following capability:
- `tiny/aipromptgen:use`: Controls who can use the AI Prompt Generator. By default, allowed for Managers, Editing Teachers, and Teachers.

## Technical Requirements

- Moodle 4.0 or higher.
- TinyMCE editor enabled (standard in Moodle 4.x).
- Node.js (for building AMD modules if modifying the source).

## License

GNU General Public License v3 or later.

---
© 2025 AI4Teachers
