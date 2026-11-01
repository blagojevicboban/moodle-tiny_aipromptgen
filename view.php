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


require_once('../../../../../config.php');

if (
    (isset($_GET['action']) && $_GET['action'] === 'stream') ||
    (isset($_POST['action']) && $_POST['action'] === 'stream')
) {
    define('NO_DEBUG_DISPLAY', true);
}

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

$client = new ai_client();
if (!empty($provider) && !empty($rawprompt) && confirm_sesskey()) {
    $generatedprompt = $rawprompt;
    if (in_array($provider, ai_client::PROVIDERS)) {
        if (!helper::check_rate_limit()) {
            $airesponse = get_string('error_ratelimit', 'tiny_aipromptgen');
        } else {
            $airesponse = $client->send_request($provider, $generatedprompt);
        }
    }
} else if ($mform->is_cancelled()) {
    redirect(new moodle_url('/course/view.php', ['id' => $courseid]));
}

// Provider options for the "Send to AI" menu.
$providernames = [
    'openai' => 'OpenAI',
    'gemini' => 'Gemini',
    'claude' => 'Claude',
    'deepseek' => 'DeepSeek',
    'custom' => get_string('provider_custom', 'tiny_aipromptgen'),
    'ollama' => 'Ollama',
];
$provideroptions = [];
$providersavailable = false;
foreach (ai_client::PROVIDERS as $name) {
    $configured = $client->is_configured($name);
    $providersavailable = $providersavailable || $configured;
    $provideroptions[] = [
        'value' => $name,
        'label' => $configured ? $providernames[$name] :
            get_string('provider_notconfigured', 'tiny_aipromptgen', $providernames[$name]),
        'selected' => $name === 'openai',
    ];
}

// Language list: the English name goes into the prompt, the label is shown in the user's language.
$flags = [
    'en' => '🇺🇸', 'es' => '🇪🇸', 'fr' => '🇫🇷', 'de' => '🇩🇪', 'it' => '🇮🇹', 'pt' => '🇵🇹', 'nl' => '🇳🇱', 'pl' => '🇵🇱',
    'ru' => '🇷🇺', 'ja' => '🇯🇵', 'zh' => '🇨🇳', 'sr_lt' => '🇷🇸', 'sr_cr' => '🇷🇸', 'hr' => '🇭🇷', 'bs' => '🇧🇦', 'sk' => '🇸🇰',
];
$languages = [];
foreach ($flags as $code => $flag) {
    $languages[] = [
        'code' => $code,
        'name' => get_string_manager()->get_string('lang_' . $code, 'tiny_aipromptgen', null, 'en'),
        'label' => get_string('lang_' . $code, 'tiny_aipromptgen') . ' ' . $flag,
    ];
}

$liststrings = function (array $keys): array {
    return array_map(function ($key) {
        return get_string($key, 'tiny_aipromptgen');
    }, $keys);
};

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

    // Lists for the modals.
    'languages' => $languages,
    'purposes' => $liststrings(['purpose_lessonplan', 'purpose_syllabus', 'purpose_quiz', 'purpose_activity',
        'purpose_project', 'purpose_rubric', 'purpose_explanation', 'purpose_summary']),
    'audiences' => $liststrings(['audience_beginners', 'audience_intermediate', 'audience_advanced', 'audience_mixed',
        'audience_specialneeds', 'audience_professional']),
    'classtypes' => $liststrings(['classtype_lecture', 'classtype_workshop', 'classtype_seminar', 'classtype_lab',
        'classtype_online', 'classtype_blended', 'classtype_fieldtrip']),
    'templates' => helper::get_templates(),

    // AI provider options.
    'provideroptions' => $provideroptions,
    'providersavailable' => $providersavailable,

    'airesponse_initial' => $airesponse,
];

echo $OUTPUT->render_from_template('tiny_aipromptgen/prompt_page', $tmpldata);

echo $OUTPUT->footer();
