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

namespace tiny_aipromptgen;

use curl;

/**
 * AI Client class to handle OpenAI and Ollama requests.
 *
 * @package    tiny_aipromptgen
 * @copyright  2025 AI4Teachers
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class ai_client {
    /** @var string OpenAI API Key */
    private $openaikey;

    /** @var string OpenAI Model */
    private $openaimodel;

    /** @var string Gemini API Key */
    private $geminikey;

    /** @var string Gemini Model */
    private $geminimodel;

    /** @var string Claude API Key */
    private $claudekey;

    /** @var string Claude Model */
    private $claudemodel;

    /** @var string Ollama Endpoint */
    private $ollamaendpoint;

    /** @var string Ollama Model */
    private $ollamamodel;

    /**
     * Constructor. Retrieves configuration settings.
     */
    public function __construct() {
        $this->openaikey = get_config('tiny_aipromptgen', 'openai_apikey');
        $this->openaimodel = get_config('tiny_aipromptgen', 'openai_model') ?: 'gpt-3.5-turbo';

        $this->geminikey = get_config('tiny_aipromptgen', 'gemini_apikey');
        $this->geminimodel = get_config('tiny_aipromptgen', 'gemini_model') ?: 'gemini-1.5-flash';

        $this->claudekey = get_config('tiny_aipromptgen', 'claude_apikey');
        $this->claudemodel = get_config('tiny_aipromptgen', 'claude_model') ?: 'claude-3-5-sonnet-20240620';

        $this->ollamaendpoint = get_config('tiny_aipromptgen', 'ollama_endpoint');
        $this->ollamamodel = get_config('tiny_aipromptgen', 'ollama_model') ?: 'llama3';
    }

    /**
     * Send a prompt to the specified provider.
     *
     * @param string $provider 'openai', 'gemini', 'claude' or 'ollama'
     * @param string $prompt The prompt text
     * @return string The AI response text
     */
    public function send_request(string $provider, string $prompt): string {
        switch ($provider) {
            case 'openai':
                return $this->send_to_openai($prompt);
            case 'gemini':
                return $this->send_to_gemini($prompt);
            case 'claude':
                return $this->send_to_claude($prompt);
            case 'ollama':
                return $this->send_to_ollama($prompt);
            default:
                return 'Unknown provider specified.';
        }
    }

    /**
     * Send request to OpenAI.
     *
     * @param string $prompt The prompt to send.
     * @return string The API response.
     */
    private function send_to_openai(string $prompt): string {
        if (empty($this->openaikey)) {
            return get_string('error_noapikey', 'tiny_aipromptgen');
        }

        $endpoint = 'https://api.openai.com/v1/chat/completions';
        $headers = [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->openaikey,
        ];

        $payload = json_encode([
            'model' => $this->openaimodel,
            'messages' => [
                ['role' => 'system', 'content' => get_string('system_role', 'tiny_aipromptgen')],
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.7,
        ]);

        return $this->perform_curl_request($endpoint, $payload, $headers, 60, false, 'openai');
    }

    /**
     * Send request to Gemini.
     *
     * @param string $prompt
     * @return string
     */
    private function send_to_gemini(string $prompt): string {
        if (empty($this->geminikey)) {
            return get_string('error_nogeminiapikey', 'tiny_aipromptgen');
        }

        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" .
            "{$this->geminimodel}:generateContent?key={$this->geminikey}";
        $headers = ['Content-Type: application/json'];

        $payload = json_encode([
            'contents' => [
                ['parts' => [['text' => $prompt]]],
            ],
            'system_instruction' => [
                'parts' => [['text' => get_string('system_role', 'tiny_aipromptgen')]],
            ],
            'generationConfig' => [
                'temperature' => 0.7,
            ],
        ]);

        return $this->perform_curl_request($endpoint, $payload, $headers, 60, false, 'gemini');
    }

    /**
     * Send request to Claude.
     *
     * @param string $prompt
     * @return string
     */
    private function send_to_claude(string $prompt): string {
        if (empty($this->claudekey)) {
            return get_string('error_noclaudeapikey', 'tiny_aipromptgen');
        }

        $endpoint = 'https://api.anthropic.com/v1/messages';
        $headers = [
            'X-API-Key: ' . $this->claudekey,
            'Anthropic-Version: 2023-06-01',
            'Content-Type: application/json',
        ];

        $payload = json_encode([
            'model' => $this->claudemodel,
            'max_tokens' => 4096,
            'system' => get_string('system_role', 'tiny_aipromptgen'),
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
            'temperature' => 0.7,
        ]);

        return $this->perform_curl_request($endpoint, $payload, $headers, 60, false, 'claude');
    }

    /**
     * Send request to Ollama (Synchronous Fallback).
     *
     * @param string $prompt The prompt to send.
     * @return string The API response.
     */
    private function send_to_ollama(string $prompt): string {
        if (empty($this->ollamaendpoint)) {
            return get_string('error_noendpoint', 'tiny_aipromptgen');
        }

        $endpoint = rtrim($this->ollamaendpoint, '/') . '/api/generate';
        $payload = json_encode([
            'model' => $this->ollamamodel,
            'prompt' => $prompt,
            'stream' => false,
            'options' => ['num_predict' => 512, 'temperature' => 0.7],
        ]);

        // Ollama usually runs on local network/localhost, SSL might be self-signed or HTTP.
        return $this->perform_curl_request($endpoint, $payload, [], 60, true, 'ollama');
    }

    /**
     * Execute cURL request.
     *
     * @param string $endpoint
     * @param string $payload
     * @param array $headers
     * @param int $timeout
     * @param bool $ignoresecurity
     * @param string $provider
     * @return string
     */
    private function perform_curl_request(
        string $endpoint,
        string $payload,
        array $headers = [],
        int $timeout = 60,
        bool $ignoresecurity = false,
        string $provider = 'openai'
    ): string {
        $curl = new curl();

        $options = [
            'CURLOPT_TIMEOUT' => $timeout,
            'CURLOPT_CONNECTTIMEOUT' => 20,
            'CURLOPT_RETURNTRANSFER' => true,
        ];

        if ($ignoresecurity) {
            $options['CURLOPT_SSL_VERIFYHOST'] = 0;
            $options['CURLOPT_SSL_VERIFYPEER'] = false;
        }

        foreach ($headers as $h) {
            $curl->setHeader($h);
        }

        $response = $curl->post($endpoint, $payload, $options);

        if ($curl->errno > 0) {
            return 'cURL Error (' . $curl->errno . '): ' . $curl->error;
        }

        if ($provider === 'ollama') {
            return $this->process_ollama_response($response, false);
        }

        $json = json_decode($response, true);
        if ($provider === 'openai') {
            if (isset($json['choices'][0]['message']['content'])) {
                return $json['choices'][0]['message']['content'];
            }
        } else if ($provider === 'gemini') {
            if (isset($json['candidates'][0]['content']['parts'][0]['text'])) {
                return $json['candidates'][0]['content']['parts'][0]['text'];
            }
        } else if ($provider === 'claude') {
            if (isset($json['content'][0]['text'])) {
                return $json['content'][0]['text'];
            }
        }

        // Generic error handling.
        if (isset($json['error']['message'])) {
            return 'API Error: ' . $json['error']['message'];
        } else if (isset($json['error'])) {
            return 'API Error: ' . (is_array($json['error']) ? json_encode($json['error']) : $json['error']);
        }

        return 'Unknown response format: ' . substr($response, 0, 200) . '...';
    }

    /**
     * Process Ollama response.
     *
     * @param string $rawresponse
     * @param bool $hasschema
     * @return string
     */
    private function process_ollama_response(string $rawresponse, bool $hasschema): string {
        $trim = trim($rawresponse);
        // Check for simple JSON first (stream=false).
        $firstchar = substr($trim, 0, 1);
        if ($firstchar === '{') {
            $json = json_decode($trim, true);
            if (isset($json['response'])) {
                $text = $json['response'];
                if ($hasschema) {
                    // Try to pretty print JSON if it is a schema response.
                    $decoded = json_decode($text);
                    if ($decoded) {
                        return json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                    }
                }
                return $text;
            }
        }

        // Handle NDJSON stream accumulation (if it happened to return that way).
        $fulltext = '';
        foreach (preg_split("/(?:\r\n|\n|\r)/", $rawresponse) as $line) {
            if ($line === '') {
                continue;
            }
            $obj = json_decode($line, true);
            if (!is_array($obj)) {
                continue;
            }
            if (isset($obj['response'])) {
                $fulltext .= $obj['response'];
            }
            if (isset($obj['error'])) {
                return 'Ollama Error: ' . $obj['error'];
            }
        }

        if ($hasschema) {
            // Try to find JSON blob in fulltext.
            $start = strpos($fulltext, '{');
            $end = strrpos($fulltext, '}');
            if ($start !== false && $end !== false) {
                $cand = substr($fulltext, $start, $end - $start + 1);
                $decoded = json_decode($cand);
                if ($decoded) {
                    return json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
                }
            }
        }

        return $fulltext ?: $rawresponse;
    }
}
