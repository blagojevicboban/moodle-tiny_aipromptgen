<?php
// This file is part of Moodle - http://moodle.org/.
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
 * Settings for the AI Prompt Generator TinyMCE plugin.
 *
 * @package    tiny_aipromptgen
 * @author     Boban Blagojevic
 * @copyright  2025 AI4Teachers
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

if ($ADMIN->fulltree) {
    // System prompt (applies to all providers).
    $settings->add(new admin_setting_configtextarea(
        'tiny_aipromptgen/system_prompt',
        get_string('setting_system_prompt', 'tiny_aipromptgen'),
        get_string('setting_system_prompt_desc', 'tiny_aipromptgen'),
        ''
    ));

    // Predefined templates (JSON).
    $settings->add(new admin_setting_configtextarea(
        'tiny_aipromptgen/templates',
        get_string('setting_templates', 'tiny_aipromptgen'),
        get_string('setting_templates_desc', 'tiny_aipromptgen'),
        ''
    ));

    // Temperature (0.0 - 2.0).
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/temperature',
        get_string('setting_temperature', 'tiny_aipromptgen'),
        get_string('setting_temperature_desc', 'tiny_aipromptgen'),
        '0.7',
        PARAM_FLOAT
    ));

    // Max tokens.
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/max_tokens',
        get_string('setting_max_tokens', 'tiny_aipromptgen'),
        get_string('setting_max_tokens_desc', 'tiny_aipromptgen'),
        '1024',
        PARAM_INT
    ));

    // Rate limit (requests per hour).
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/rate_limit',
        get_string('setting_rate_limit', 'tiny_aipromptgen'),
        get_string('setting_rate_limit_desc', 'tiny_aipromptgen'),
        '50',
        PARAM_INT
    ));

    // OpenAI API key (password-unmask field).
    $settings->add(new admin_setting_configpasswordunmask(
        'tiny_aipromptgen/openai_apikey',
        get_string('setting_apikey', 'tiny_aipromptgen'),
        get_string('setting_apikey_desc', 'tiny_aipromptgen'),
        ''
    ));

    // Default OpenAI model.
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/openai_model',
        get_string('setting_model', 'tiny_aipromptgen'),
        get_string('setting_model_desc', 'tiny_aipromptgen'),
        'gpt-4o-mini',
        PARAM_TEXT
    ));

    // Gemini API key.
    $settings->add(new admin_setting_configpasswordunmask(
        'tiny_aipromptgen/gemini_apikey',
        get_string('setting_gemini_apikey', 'tiny_aipromptgen'),
        get_string('setting_gemini_apikey_desc', 'tiny_aipromptgen'),
        ''
    ));

    // Default Gemini model.
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/gemini_model',
        get_string('setting_gemini_model', 'tiny_aipromptgen'),
        get_string('setting_gemini_model_desc', 'tiny_aipromptgen'),
        'gemini-1.5-flash',
        PARAM_TEXT
    ));

    // Claude API key.
    $settings->add(new admin_setting_configpasswordunmask(
        'tiny_aipromptgen/claude_apikey',
        get_string('setting_claude_apikey', 'tiny_aipromptgen'),
        get_string('setting_claude_apikey_desc', 'tiny_aipromptgen'),
        ''
    ));

    // Default Claude model.
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/claude_model',
        get_string('setting_claude_model', 'tiny_aipromptgen'),
        get_string('setting_claude_model_desc', 'tiny_aipromptgen'),
        'claude-3-5-sonnet-20240620',
        PARAM_TEXT
    ));

    // DeepSeek API key.
    $settings->add(new admin_setting_configpasswordunmask(
        'tiny_aipromptgen/deepseek_apikey',
        get_string('setting_deepseek_apikey', 'tiny_aipromptgen'),
        get_string('setting_deepseek_apikey_desc', 'tiny_aipromptgen'),
        ''
    ));

    // Default DeepSeek model.
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/deepseek_model',
        get_string('setting_deepseek_model', 'tiny_aipromptgen'),
        get_string('setting_deepseek_model_desc', 'tiny_aipromptgen'),
        'deepseek-chat',
        PARAM_TEXT
    ));

    // Custom API (OpenAI-compatible) endpoint.
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/custom_endpoint',
        get_string('setting_custom_endpoint', 'tiny_aipromptgen'),
        get_string('setting_custom_endpoint_desc', 'tiny_aipromptgen'),
        '',
        PARAM_URL
    ));

    // Custom API key (optional).
    $settings->add(new admin_setting_configpasswordunmask(
        'tiny_aipromptgen/custom_apikey',
        get_string('setting_custom_apikey', 'tiny_aipromptgen'),
        get_string('setting_custom_apikey_desc', 'tiny_aipromptgen'),
        ''
    ));

    // Custom API model name.
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/custom_model',
        get_string('setting_custom_model', 'tiny_aipromptgen'),
        get_string('setting_custom_model_desc', 'tiny_aipromptgen'),
        '',
        PARAM_TEXT
    ));

    // Ollama endpoint.
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/ollama_endpoint',
        get_string('setting_ollama_endpoint', 'tiny_aipromptgen'),
        get_string('setting_ollama_endpoint_desc', 'tiny_aipromptgen'),
        'http://localhost:11434',
        PARAM_URL
    ));

    // Ollama model (allow dots/colons via PARAM_TEXT).
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/ollama_model',
        get_string('setting_ollama_model', 'tiny_aipromptgen'),
        get_string('setting_ollama_model_desc', 'tiny_aipromptgen'),
        'llama3',
        PARAM_TEXT // Allow dots/colons.
    ));

    // Optional JSON Schema for structured output.
    $settings->add(new admin_setting_configtextarea(
        'tiny_aipromptgen/ollama_schema',
        get_string('setting_ollama_schema', 'tiny_aipromptgen'),
        get_string('setting_ollama_schema_desc', 'tiny_aipromptgen'),
        ''
    ));

    // Max tokens (num_predict).
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/ollama_num_predict',
        get_string('setting_ollama_num_predict', 'tiny_aipromptgen'),
        get_string('setting_ollama_num_predict_desc', 'tiny_aipromptgen'),
        512,
        PARAM_INT
    ));

    // Timeout seconds.
    $settings->add(new admin_setting_configtext(
        'tiny_aipromptgen/ollama_timeout',
        get_string('setting_ollama_timeout', 'tiny_aipromptgen'),
        get_string('setting_ollama_timeout_desc', 'tiny_aipromptgen'),
        90,
        PARAM_INT
    ));
}
