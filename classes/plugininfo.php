<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Tiny AI Prompt Generator plugin implementation.
 *
 * @package    tiny_aipromptgen
 * @copyright  2025 AI4Teachers
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace tiny_aipromptgen;

use editor_tiny\plugin;
use editor_tiny\plugin_with_buttons;
use editor_tiny\plugin_with_configuration;
use editor_tiny\plugin_with_menuitems;

/**
 * Tiny AI Prompt Generator plugin.
 */
class plugininfo extends plugin implements plugin_with_buttons, plugin_with_configuration, plugin_with_menuitems {
    /**
     * Get the list of buttons provided by this plugin.
     *
     * @return array
     */
    public static function get_available_buttons(): array {
        return [
            'tiny_aipromptgen/tiny_aipromptgen',
        ];
    }

    /**
     * Get the list of menu items provided by this plugin.
     *
     * @return array
     */
    public static function get_available_menuitems(): array {
        return [
            'tiny_aipromptgen/tiny_aipromptgen',
        ];
    }

    /**
     * Get the configuration for this plugin.
     *
     * @param \context $context The context that the editor is being used in.
     * @param array $options The options passed to the editor.
     * @param array $fpoptions The file picker options.
     * @param \editor_tiny\editor|null $editor The editor instance.
     *
     * @return array
     */
    public static function get_plugin_configuration_for_context(
        \context $context,
        array $options,
        array $fpoptions,
        ?\editor_tiny\editor $editor = null
    ): array {
        global $PAGE;

        // Determine the active provider and its display label.
        $provider = get_config('tiny_aipromptgen', 'provider') ?: 'openai';

        $providerlabels = [
            'openai'   => 'OpenAI',
            'gemini'   => 'Gemini',
            'claude'   => 'Claude',
            'deepseek' => 'DeepSeek',
            'ollama'   => 'Ollama',
            'custom'   => 'Custom API',
        ];

        $modelmap = [
            'openai'   => get_config('tiny_aipromptgen', 'openai_model') ?: 'gpt-3.5-turbo',
            'gemini'   => get_config('tiny_aipromptgen', 'gemini_model') ?: 'gemini-1.5-flash',
            'claude'   => get_config('tiny_aipromptgen', 'claude_model') ?: 'claude-3-5-sonnet-20240620',
            'deepseek' => get_config('tiny_aipromptgen', 'deepseek_model') ?: 'deepseek-chat',
            'ollama'   => get_config('tiny_aipromptgen', 'ollama_model') ?: 'llama3',
            'custom'   => get_config('tiny_aipromptgen', 'custom_model') ?: 'custom',
        ];

        $activemodel = $modelmap[$provider] ?? '';
        $activelabel = ($providerlabels[$provider] ?? ucfirst($provider))
            . ($activemodel ? ' · ' . $activemodel : '');

        return [
            'canView'             => has_capability('tiny/aipromptgen:use', $context),
            'blockUrl'            => (new \moodle_url('/lib/editor/tiny/plugins/aipromptgen/view.php'))->out(false),
            'sesskey'             => sesskey(),
            'activeProvider'      => $provider,
            'activeModel'         => $activemodel,
            'activeProviderLabel' => $activelabel,
        ];
    }
}
