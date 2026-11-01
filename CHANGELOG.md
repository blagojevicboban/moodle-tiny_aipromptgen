# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-11-01
### Security
- **XSS in Markdown rendering**: Links and images in AI responses accept only `http(s)` (and `mailto:` for links) URLs,
  and quotes are escaped, so a response can no longer inject `javascript:` links or event handler attributes.
- **CSRF on the streaming endpoint**: `stream.php` accepts only POST requests with a valid sesskey, so a plain link
  can no longer trigger paid AI requests.
- **Gemini API key**: Sent in the `x-goog-api-key` header instead of the URL, so it cannot leak into error messages or logs.
- **Moodle curl security**: Applies to the cloud providers again; only the admin-configured Ollama and Custom endpoints
  bypass it. SSL verification is turned off only for localhost and private IP addresses.
- **Rate limit**: Counted per user in the Moodle application cache instead of the session, so a new login no longer resets it.

### Added
- **OpenAI streaming**: OpenAI responses now stream like the other providers.
- **Privacy metadata**: The external AI services that receive prompts are declared in the privacy provider.

### Changed
- **One AI client for all providers**: `ai_client` builds every request; streaming and non-streaming use the same model,
  system prompt and limits. `stream.php` only checks the request and streams the response.
- **Default models**: `gpt-5-mini`, `gemini-3.8-flash`, `claude-opus-5-5` (the old defaults were retired by the providers).
- **Claude and reasoning models**: `temperature` is not sent to Claude and to GPT-5/o-series models; models that reason
  before they answer get at least 16000 output tokens; Claude thinking blocks are not shown in the response.
- **Language strings**: Error messages, provider labels, purposes, audiences, class types, language names and the default
  prompt templates are now language strings.
- **Supported versions**: Requires Moodle 4.1 (TinyMCE plugins do not exist in 4.0); tested on Moodle 4.5 to 5.3.
  CI runs each Moodle branch with a PHP version it supports, including 5.2 and 5.3.

### Fixed
- **Ollama and Custom without streaming**: Requests to localhost or private network endpoints were blocked by Moodle's curl security.
- **Gemini streaming**: Responses that contained `{` or `}` (for example code) were split incorrectly.
- **Ollama streaming**: Now uses the system prompt, temperature and max tokens settings, and sends `[DONE]` only once.
- **API errors in streaming**: An HTTP error (for example an invalid API key) is shown as an error instead of an empty response.
- **Cancel button**: Returns to the course instead of printing a `window.close()` script.

## [1.9] - 2026-03-05
### Fixed
- **ESLint Warnings (Nested Promises)**: Refactored streaming loop in `amd/src/stream.js` from chained `.then()` / recursive `pump()` pattern to `async/await` with a `while (!result.done)` loop, eliminating `promise/no-nesting` and `no-constant-condition` ESLint warnings.
- **PHPCS MoodleInternalGlobalState**: Moved `define('NO_DEBUG_DISPLAY', true)` to after `require_once('config.php')` in `view.php` to satisfy the Moodle CodeSniffer global-state rule.
- **Blank Page Bug**: Removed incorrectly placed `defined('MOODLE_INTERNAL') || die()` guard from the web entry-point `view.php`; that check belongs only in class/library files.
- **AMD Build**: Rebuilt `amd/build/stream.min.js` using the Moodle-compatible Babel AMD transform (`babel-plugin-transform-es2015-modules-amd-lazy`) to match the exact output format expected by the CI stale-file check.

## [1.8.2] - 2026-03-05

### Fixed
- **Stream Crash / Cache Definition Error**: Fixed an issue where releasing the Moodle session early in `AJAX_SCRIPT` mode caused a fatal error (`The requested cache definition does not exist.core/session`) by properly injecting `$SESSION` globals and disabling `NO_DEBUG_DISPLAY`.
- **Unhandled Permission Exceptions**: Wrapped capability and login checks in `view.php` with a try-catch block to gracefully intercept internal Moodle security redirects (like `require_sesskey` and `require_capability`), displaying inline UI error messages instead of silently breaking the stream with HTTP 404 or 303 Redirects.
- **Capabilities Warning**: Supplied the missing translation string for `aipromptgen:use` to silence debug output that previously corrupted the SSE data payload.

## [1.8.1] - 2026-03-04
### Fixed
- **Streaming 404 Error (URL Length Limit)**: Refactored AI streaming from GET-based `EventSource` to POST-based `fetch` to bypass web server URL length limits and mod_security rules that threw 404 or 414 errors for long pedagogical prompts.
- **Provider Override Bug**: Addressed a bug in the JavaScript streaming module where the active AI provider was inadvertently hardcoded to `ollama`, ensuring that Gemini, Claude, DeepSeek, and Custom APIs now trigger their respective streaming logic correctly.

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
