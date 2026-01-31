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

defined('MOODLE_INTERNAL') || die();

/**
 * Tiny AI Prompt Generator plugin.
 */
class plugininfo extends plugin implements plugin_with_buttons, plugin_with_menuitems, plugin_with_configuration {

    /**
     * Get the list of buttons provided by this plugin.
     *
     * @return array
     */
    public static function get_available_buttons(): array {
        return [
            'tiny_aipromptgen/aipromptgen',
        ];
    }

    /**
     * Get the list of menu items provided by this plugin.
     *
     * @return array
     */
    public static function get_available_menuitems(): array {
        return [
            'tiny_aipromptgen/aipromptgen',
        ];
    }

    /**
     * Get the configuration for this plugin.
     *
     * @param \context $context The context that the editor is being used in.
     * @param array $options The options passed to the editor.
     * @param array $fpoptions The file picker options.
     * @param \editor_tiny\editor $editor The editor instance.
     * @return array
     */
    public static function get_plugin_configuration_for_context(\context $context, array $options, array $fpoptions, ?\editor_tiny\editor $editor = null): array {
        global $PAGE;

        // Configuration logic here
        $systemcontext = \context_system::instance();

        return [
            'canView' => has_capability('block/aipromptgen:manage', $systemcontext) || is_siteadmin(),
            'blockUrl' => $PAGE->url->out(false),
            'sesskey' => sesskey(),
        ];
    }
}
