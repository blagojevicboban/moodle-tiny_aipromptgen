# Changelog

All notable changes to this project will be documented in this file.

## [1.8] - 2026-03-04
### Fixed
- **TinyMCE Plugin Initialization**: Resolved `TypeError: getPluginConfiguration is not a function` by updating the plugin to use the standard TinyMCE `editor.options.get` API for Moodle 4.x compatibility.
- **Improved Language Strings**: Added missing `form_topicbrowse` identifier and standardized "Browse" button labels in the pedagogical form for better consistency.
- **Production Minification Patch**: Directly patched the minified `plugin.min.js` to ensure stability in production environments where scripts are combined/minified by Moodle.
- **Documentation Hygiene**: Wrapped long lines in `README.html` and `README.md` to comply with coding standards and improve maintainability.

## [1.7] - 2026-03-04
### Added
- **Predefined Quick Templates**: Admin-configurable pedagogical templates for one-click prompt generation. Includes 4 built-in defaults (Bloom's Taxonomy, Lesson Plan, Socratic Tutor, Executive Summary).
- **Rate Limiting (Anti-abuse)**: Configurable maximum AI requests per user per hour (default: 50) using Moodle's session cache.
- **Dynamic Toolbar Tooltip**: Shows the active AI provider and model directly on the TinyMCE toolbar button.
- **Provider Persistence**: Remembers the teacher's preferred AI provider via `localStorage`.

## [1.6] - 2026-03-04

### Added
- Configurable AI Temperature setting (0.0–2.0, default 0.7) applied to all providers.
- Configurable Max Tokens setting (default 1024) applied to all providers.
  - Maps to `max_tokens` for OpenAI/DeepSeek/Claude/Custom, `maxOutputTokens` for Gemini, `num_predict` for Ollama.

## [1.5] - 2026-03-04

### Added
- Added support for DeepSeek API (deepseek-chat, deepseek-reasoner models).
- Added support for Custom OpenAI-compatible API endpoints (LM Studio, Groq, OpenRouter,
  Together AI, vLLM, and any other service following the OpenAI API format).
- Real-time SSE streaming for DeepSeek and Custom API providers.
- New admin settings for DeepSeek API key and model.
- New admin settings for Custom API endpoint URL, API key (optional), and model name.
- Automatic SSL bypass for local/private-network Custom API endpoints.

## [1.4] - 2026-03-04

### Added
- Added support for Google Gemini API (gemini-1.5-flash, gemini-1.5-pro etc.).
- Added support for Anthropic Claude API (claude-3-5-sonnet, claude-3-haiku etc.).
- New API configuration settings for Gemini and Claude in Moodle admin panel.
- Improved AI client with unified multi-provider request handling.

## [1.3] - 2026-02-04

### Fixed
- Fixed JavaScript string keys in ui.js to use underscores instead of colons, matching the language file updates from v1.2.
- Prompt generation now correctly displays localized strings instead of raw string identifiers.

## [1.2] - 2026-02-04

### Changed
- Refactored cURL implementation to use Moodle's `curl` class for better proxy support and security.
- Renamed global functions to follow Moodle's frankenstyle naming conventions.
- Updated language string identifiers to use underscores instead of colons (Moodle standard).
- Improved CSS compliance with Moodle coding standards (removed `!important`, fixed formatting).
- Split JavaScript variable declarations to comply with ESLint rules.

### Added
- Implemented Moodle Privacy API with null provider (plugin does not store personal data).
- Extended CI matrix to test against Moodle 4.0 through 5.0.
- Added compatibility table to README.

### Fixed
- Fixed class brace placement in PHP files to comply with Moodle coding standards.
- Corrected capability name validation in plugininfo.php.
- Resolved all CSS and JavaScript linting errors.

## [1.1] - 2026-02-01

### Changed
- Improved context awareness: Automatically detects context (Topic and Lesson title) from the Moodle page when opening the editor.
- Refined content insertion: Fixed issues with missing line breaks when inserting plain text or raw content into the editor.
- Enhanced UX: Added visual streaming status indicators (Connecting, Receiving, Finished) in the AI response modal.
- Improved "Send to AI" feedback: Button now shows "Generating..." state for non-streaming providers.

### Fixed
- Fixed breadcrumb-based topic detection to exclude common Moodle UI terms like "Settings" or "General".
- Resolved various linting and PHPDoc errors to comply with Moodle coding standards.
- Added example context to Mustache templates for better CI/CD integration.

### Added
- GitHub Actions CI workflow for automated testing and linting.


## [1.0] - 2026-01-31

### Added
- Initial release of the Tiny AI Prompt Generator plugin.
- Seamless integration with TinyMCE editor in Moodle.
- AI-assisted prompt builder interface.
- Rich text and HTML copying capabilities.
- Configurable settings for site administrators.
