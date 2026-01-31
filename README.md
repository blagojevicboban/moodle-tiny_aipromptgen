# Tiny AI Prompt Generator

**Tiny AI Prompt Generator** is a Moodle TinyMCE editor plugin designed to help teachers create effective AI prompts directly within the editor. It provides a user-friendly interface to generate structured prompts based on pedagogical best practices.

## Features

- **Prompt Builder**: A guided interface to construct detailed prompts.
- **TinyMCE Integration**: Seamlessly integrated into the Moodle editor toolbar and menu.
- **Customizable**: Administrators can manage access permissions.

## Installation

1. Download the plugin and extract it to your Moodle `lib/editor/tiny/plugins/` directory.
2. Rename the folder to `aipromptgen`.
3. Log in to your Moodle site as an administrator.
4. Go to **Site administration** > **Notifications** to install the plugin.

## Usage

1. Open the TinyMCE editor in any Moodle activity or resource.
2. Click the **AI Prompt Generator** icon (rectangle with a plus sign) in the toolbar.
3. Alternatively, use the **Insert** menu to find **AI Prompt Generator**.
4. Follow the steps in the modal to create your prompt.
5. Click **Insert** to add the generated prompt to your content.

## Configuration

Admins can control who sees the button via the `block/aipromptgen:manage` capability or site admin status.

## License

This project is licensed under the [GNU General Public License v3 or later](http://www.gnu.org/copyleft/gpl.html).

## Copyright

&copy; 2025 AI4Teachers
