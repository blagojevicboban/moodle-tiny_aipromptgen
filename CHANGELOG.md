# Changelog

All notable changes to this project will be documented in this file.

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
