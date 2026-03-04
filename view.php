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
 * Main view page for the AI Prompt Generator TinyMCE plugin.
 *
 * @package    tiny_aipromptgen
 * @copyright  2025 AI4Teachers
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ((isset($_GET['action']) && $_GET['action'] === 'stream') || (isset($_POST['action']) && $_POST['action'] === 'stream')) {
    define('NO_DEBUG_DISPLAY', true);
}
require_once('../../../../../config.php');
require_once($CFG->libdir . '/adminlib.php');
require_once(__DIR__ . '/classes/form/prompt_form.php');

use tiny_aipromptgen\helper;
use tiny_aipromptgen\ai_client;

// Get the course ID from the URL or fallback to the site page.
$courseid = optional_param('courseid', SITEID, PARAM_INT);
if (empty($courseid)) {
    $courseid = SITEID;
}

if (optional_param('action', '', PARAM_ALPHA) === 'stream') {
    try {
        require_login($courseid);
        require_sesskey();
        require_once(__DIR__ . '/stream.php');
    } catch (\Throwable $e) {
        // Fallback if SSE headers aren't sent yet.
        // Ensure Content-Type is set for SSE.
        if (!headers_sent()) {
            header('Content-Type: text/event-stream');
        }
        // Send the error event.
        tiny_aipromptgen_send_event('Moodle error: ' . $e->getMessage(), 'error');
        tiny_aipromptgen_send_event('[DONE]', 'done');
    }
    exit;
}

// Login and capability checks for the HTML view.
require_login($courseid);
$context = context_course::instance($courseid);
require_capability('tiny/aipromptgen:use', $context);

// Page setup.
$PAGE->set_url(new moodle_url('/lib/editor/tiny/plugins/aipromptgen/view.php', ['courseid' => $courseid]));
$PAGE->set_context($context);
$PAGE->set_title(get_string('pluginname', 'tiny_aipromptgen'));
$PAGE->set_heading(get_string('pluginname', 'tiny_aipromptgen'));
$PAGE->set_pagelayout('popup'); // Use popup layout for cleaner interface.

// Initialize JS.
$PAGE->requires->js_call_amd('tiny_aipromptgen/ui', 'init');

// Fetch Data.
$course = get_course($courseid);
[$topics, $lessonoptions] = helper::get_course_content($course);
$competencies = helper::get_course_competencies_and_outcomes($courseid);

// Prepare form data.
$customdata = [
    'topics' => $topics,
    'coursename' => $course->fullname,
    // Add other defaults as needed by the form class.
];
$mform = new \tiny_aipromptgen\form\prompt_form(null, $customdata);

// Pre-fill form with context from editor.
$initialdata = ['courseid' => $courseid];
$topic = optional_param('topic', '', PARAM_TEXT);
$lesson = optional_param('lesson', '', PARAM_TEXT);

if (!empty($topic)) {
    $initialdata['topic'] = $topic;
}
if (!empty($lesson)) {
    $initialdata['lesson'] = $lesson;
}

$mform->set_data($initialdata);

// Handle Form Submission.
$generatedprompt = '';
$hasgenerated = true; // Always show the result section for live updates.
$airesponse = '';

// Check if this is a "Send to AI" request (manual form submission).
$rawprompt = optional_param('ai4t_generated', '', PARAM_RAW);
$provider = optional_param('sendto', '', PARAM_TEXT);

if (!empty($provider) && !empty($rawprompt) && confirm_sesskey()) {
    $generatedprompt = $rawprompt;
    if (in_array($provider, ['openai', 'ollama', 'gemini', 'claude', 'deepseek', 'custom'])) {
        if (!helper::check_rate_limit()) {
            $airesponse = get_string('error_ratelimit', 'tiny_aipromptgen');
        } else {
            $client = new ai_client();
            $airesponse = $client->send_request($provider, $generatedprompt);
        }
    }
} else if ($mform->is_cancelled()) {
    // Just close the popup or redirect?
    echo "<script>window.close();</script>";
    exit;
}

// Render Page.
echo $OUTPUT->header();

// 1. Render Form.
$mform->display();

// 2. Render Template for Results and Modals.
$tmpldata = [
    'courseid' => $courseid,
    'coursename' => $course->fullname,
    'sesskey' => sesskey(),
    'hasgenerated' => $hasgenerated,
    'generatedprompt' => $generatedprompt,
    'backurl' => (new moodle_url('/course/view.php', ['id' => $courseid]))->out(false),

    // Modal Data.
    'topics' => $topics,
    'lessonoptions' => $lessonoptions,
    'competencies' => $competencies,

    // Static lists for modals.
    'languages' => [
        ['code' => 'en', 'name' => 'English', 'label' => 'English 🇺🇸'],
        ['code' => 'es', 'name' => 'Spanish', 'label' => 'Spanish 🇪🇸'],
        ['code' => 'fr', 'name' => 'French', 'label' => 'French 🇫🇷'],
        ['code' => 'de', 'name' => 'German', 'label' => 'German 🇩🇪'],
        ['code' => 'it', 'name' => 'Italian', 'label' => 'Italian 🇮🇹'],
        ['code' => 'pt', 'name' => 'Portuguese', 'label' => 'Portuguese 🇵🇹'],
        ['code' => 'nl', 'name' => 'Dutch', 'label' => 'Dutch 🇳🇱'],
        ['code' => 'pl', 'name' => 'Polish', 'label' => 'Polish 🇵🇱'],
        ['code' => 'ru', 'name' => 'Russian', 'label' => 'Russian 🇷🇺'],
        ['code' => 'ja', 'name' => 'Japanese', 'label' => 'Japanese 🇯🇵'],
        ['code' => 'zh', 'name' => 'Chinese', 'label' => 'Chinese 🇨🇳'],
        ['code' => 'sr_lt', 'name' => 'Serbian (Latin)', 'label' => 'Serbian (Latin) 🇷🇸'],
        ['code' => 'sr_cr', 'name' => 'Serbian (Cyrillic)', 'label' => 'Serbian (Cyrillic) 🇷🇸'],
        ['code' => 'hr', 'name' => 'Croatian', 'label' => 'Croatian 🇭🇷'],
        ['code' => 'bs', 'name' => 'Bosnian', 'label' => 'Bosnian 🇧🇦'],
    ],
    'purposes' => [
        'Lesson Plan',
        'Syllabus',
        'Quiz/Assessment',
        'Activity Design',
        'Project Outline',
        'Rubric',
        'Explanation',
        'Summary',
    ],
    'audiences' => [
        'Beginners',
        'Intermediate',
        'Advanced',
        'Mixed Ability',
        'Special Needs',
        'Professional',
    ],
    'classtypes' => [
        'Lecture',
        'Workshop',
        'Seminar',
        'Lab',
        'Online/Virtual',
        'Blended',
        'Field Trip',
    ],
    'templates' => helper::get_templates(),

    // AI Provider Options.
    'provideroptions' => [
        [
            'value' => 'openai',
            'label' => 'OpenAI' . (get_config('tiny_aipromptgen', 'openai_apikey') ? '' : ' (✕ Not configured)'),
            'selected' => true,
        ],
        [
            'value' => 'gemini',
            'label' => 'Gemini' . (get_config('tiny_aipromptgen', 'gemini_apikey') ? '' : ' (✕ Not configured)'),
            'selected' => false,
        ],
        [
            'value' => 'claude',
            'label' => 'Claude' . (get_config('tiny_aipromptgen', 'claude_apikey') ? '' : ' (✕ Not configured)'),
            'selected' => false,
        ],
        [
            'value' => 'deepseek',
            'label' => 'DeepSeek' . (get_config('tiny_aipromptgen', 'deepseek_apikey') ? '' : ' (✕ Not configured)'),
            'selected' => false,
        ],
        [
            'value' => 'custom',
            'label' => 'Custom API' . (get_config('tiny_aipromptgen', 'custom_endpoint') ? '' : ' (✕ Not configured)'),
            'selected' => false,
        ],
        [
            'value' => 'ollama',
            'label' => 'Ollama' . (get_config('tiny_aipromptgen', 'ollama_endpoint') ? '' : ' (✕ Not configured)'),
            'selected' => false,
        ],
    ],
    'providersavailable' => (get_config('tiny_aipromptgen', 'openai_apikey') ||
        get_config('tiny_aipromptgen', 'gemini_apikey') ||
        get_config('tiny_aipromptgen', 'claude_apikey') ||
        get_config('tiny_aipromptgen', 'deepseek_apikey') ||
        get_config('tiny_aipromptgen', 'custom_endpoint') ||
        get_config('tiny_aipromptgen', 'ollama_endpoint')),

    'airesponse_initial' => $airesponse,
];

echo $OUTPUT->render_from_template('tiny_aipromptgen/prompt_page', $tmpldata);

echo $OUTPUT->footer();
