/**
 * This file is part of Moodle - http://moodle.org/
 *
 * Moodle is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Moodle is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Moodle.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * EventSource streaming support for the AI Prompt Generator.
 *
 * @package
 * @copyright  2025 AI4Teachers
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['core/str', 'tiny_aipromptgen/markdown'], function(Str, Markdown) {

    /**
     * Synchronously update element text if strings are pre-cached.
     *
     * @param {HTMLElement} el
     * @param {string} stringId
     */
    const updateElTextSync = function(el, stringId) {
        if (!el) {
            return;
        }
        el.textContent = M.util.get_string(stringId, 'tiny_aipromptgen');
    };

    /**
     * Prepare the UI for streaming responsiveness.
     *
     * @param {HTMLElement} resp
     * @returns {HTMLElement}
     */
    const setupStreamingUI = function(resp) {
        const statusId = 'ai-response-status';
        let statusEl = document.getElementById(statusId);
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.id = statusId;
            statusEl.className = 'small text-muted';
            if (resp && resp.parentNode) {
                resp.parentNode.insertBefore(statusEl, resp);
            }
        }

        const modalStatus = document.getElementById('ai4t-modal-status');
        if (modalStatus) {
            updateElTextSync(modalStatus, 'status_connecting');
            modalStatus.style.color = '#007bff';
        }

        if (statusEl) {
            updateElTextSync(statusEl, 'status_streaming');
        }
        const modal = document.getElementById('ai4t-airesponse-modal');
        const backdrop = document.getElementById('ai4t-modal-backdrop');
        if (backdrop) {
            backdrop.style.display = 'block';
        }
        if (modal) {
            modal.style.display = 'block';
        }
        if (resp) {
            resp.textContent = '';
            resp.setAttribute('aria-busy', 'true');
        }
        return statusEl;
    };

    /**
     * Main entry point for starting the AI response stream.
     *
     * @param {function} findForm
     * @param {HTMLElement} gen
     * @param {HTMLElement} hidden
     * @param {HTMLElement} resp
     * @param {function} scrollToResponse
     */
    const startStream = function(findForm, gen, hidden, resp, scrollToResponse) {
        if (!window.fetch) {
            const form = findForm();
            if (form) {
                form.submit();
            }
            return;
        }

        // Pre-cache all strings to avoid nesting promises in the loop.
        Str.get_strings([
            {key: 'status_connecting', component: 'tiny_aipromptgen'},
            {key: 'status_streaming', component: 'tiny_aipromptgen'},
            {key: 'status_started', component: 'tiny_aipromptgen'},
            {key: 'status_receiving', component: 'tiny_aipromptgen'},
            {key: 'status_error', component: 'tiny_aipromptgen'},
            {key: 'status_error_occurred', component: 'tiny_aipromptgen'},
            {key: 'status_finished', component: 'tiny_aipromptgen'},
            {key: 'status_done', component: 'tiny_aipromptgen'},
            {key: 'status_timeout', component: 'tiny_aipromptgen'}
        ]).then(function() {
            const cidEl = document.querySelector('input[name=courseid]');
            const courseid = (cidEl && cidEl.value) || '';

            const providerEl = document.getElementById('ai4t-provider');
            const provider = providerEl ? providerEl.value : 'ollama';
            hidden.value = provider;

            const statusEl = setupStreamingUI(resp);
            const root = (window.M && window.M.cfg && window.M.cfg.wwwroot) ? window.M.cfg.wwwroot : '';
            const base = root + '/lib/editor/tiny/plugins/aipromptgen/stream.php';

            let prompt = gen.value || gen.textContent || '';
            if (!prompt) {
                const form = findForm();
                const fd = new FormData(form || undefined);
                prompt = 'Topic: ' + (fd.get('topic') || '') + '\n' +
                    'Lesson: ' + (fd.get('lesson') || '') + '\n' +
                    'Outcomes: ' + (fd.get('outcomes') || '');
            }

            const formData = new FormData();
            formData.append('courseid', courseid);
            formData.append('provider', provider);
            formData.append('prompt', prompt);

            const modalStatus = document.getElementById('ai4t-modal-status');
            let first = true;
            let lastActivity = Date.now();
            const timeoutMs = 30000;
            let reader = null;
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let currentEvent = 'message';
            let currentData = '';

            const processLines = function() {
                const lines = buffer.split(/\r?\n/);
                buffer = lines.pop(); // Keep partial line.
                lines.forEach(function(line) {
                    if (line === '') {
                        if (currentEvent === 'error') {
                            updateElTextSync(statusEl, 'status_error');
                            if (modalStatus) {
                                updateElTextSync(modalStatus, 'status_error_occurred');
                                modalStatus.style.color = '#dc3545';
                            }
                            if (resp) {
                                const errStr = M.util.get_string('status_error', 'tiny_aipromptgen');
                                resp.textContent += '\n[' + errStr + '] ' + currentData;
                            }
                            lastActivity = Date.now();
                        } else if (currentEvent === 'start') {
                            updateElTextSync(statusEl, 'status_started');
                            if (modalStatus) {
                                updateElTextSync(modalStatus, 'status_receiving');
                            }
                            lastActivity = Date.now();
                        } else if (currentEvent === 'done') {
                            // Completion handled when stream ends.
                            lastActivity = Date.now();
                        } else {
                            if (resp && currentData) {
                                resp.textContent += currentData;
                            }
                            if (modalStatus) {
                                updateElTextSync(modalStatus, 'status_receiving');
                            }
                            if (first) {
                                scrollToResponse();
                                first = false;
                            }
                            lastActivity = Date.now();
                        }
                        currentEvent = 'message';
                        currentData = '';
                    } else if (line.startsWith('event: ')) {
                        currentEvent = line.substring(7);
                    } else if (line.startsWith('data: ')) {
                        const val = line.substring(6);
                        if (currentData === '') {
                            currentData = val;
                        } else {
                            currentData += '\n' + val;
                        }
                    }
                });
            };

            const pump = function() {
                // eslint-disable-next-line promise/no-nesting
                return reader.read().then(function(result) {
                    if (result.done) {
                        if (buffer.length > 0) {
                            buffer += '\n\n'; // Force flush.
                            processLines();
                        }
                        return null;
                    }
                    buffer += decoder.decode(result.value, {stream: true});
                    processLines();
                    return pump();
                });
            };

            const checkTimeout = setInterval(function() {
                if (Date.now() - lastActivity > timeoutMs) {
                    updateElTextSync(statusEl, 'status_timeout');
                    if (resp) {
                        resp.removeAttribute('aria-busy');
                    }
                    if (reader) {
                        reader.cancel();
                    }
                    clearInterval(checkTimeout);
                    scrollToResponse();
                }
            }, 2000);

            // eslint-disable-next-line promise/no-nesting
            return fetch(base, {
                method: 'POST',
                body: formData
            }).then(function(response) {
                if (!response.body) {
                    throw new Error('ReadableStream not supported');
                }
                reader = response.body.getReader();

                updateElTextSync(statusEl, 'status_started');
                if (modalStatus) {
                    updateElTextSync(modalStatus, 'status_receiving');
                }
                scrollToResponse();

                return pump();
            }).then(function() {
                clearInterval(checkTimeout);
                updateElTextSync(statusEl, 'status_done');
                if (modalStatus) {
                    updateElTextSync(modalStatus, 'status_finished');
                    modalStatus.style.color = '#28a745';
                }
                if (resp) {
                    resp.removeAttribute('aria-busy');
                    resp.textContent = Markdown.autofixMarkdown(resp.textContent);
                }
                scrollToResponse();
                return null;
            }).catch(function(err) {
                clearInterval(checkTimeout);
                if (resp) {
                    const errStr = M.util.get_string('status_error', 'tiny_aipromptgen');
                    resp.textContent += '\n[' + errStr + '] ' + err.message;
                }
                updateElTextSync(statusEl, 'status_error');
                if (modalStatus) {
                    updateElTextSync(modalStatus, 'status_error_occurred');
                    modalStatus.style.color = '#dc3545';
                }
                scrollToResponse();
                return null;
            });
        }).catch(function() {
            // Handle pre-cache failure.
            return null;
        });
    };

    return {
        startStream: startStream
    };
});
