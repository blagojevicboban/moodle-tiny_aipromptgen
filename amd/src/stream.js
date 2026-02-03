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

    const updateElText = function(el, stringId) {
        if (!el) {
            return;
        }
        Str.get_string(stringId, 'tiny_aipromptgen').then(function(s) {
            el.textContent = s;
            return s;
        }).catch(function() {
            // Silent fail.
        });
    };

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
            updateElText(modalStatus, 'status:connecting');
            modalStatus.style.color = '#007bff';
        }

        if (statusEl) {
            updateElText(statusEl, 'status:streaming');
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

    const attachStreamListeners = function(es, resp, statusEl, scrollToResponse) {
        let first = true;
        const modalStatus = document.getElementById('ai4t-modal-status');

        es.addEventListener('start', function() {
            updateElText(statusEl, 'status:started');
            updateElText(modalStatus, 'status:receiving');
            scrollToResponse();
        });
        es.addEventListener('chunk', function(ev) {
            if (resp) {
                resp.textContent += ev.data;
                if (first) {
                    scrollToResponse();
                    first = false;
                }
            }
            updateElText(modalStatus, 'status:receiving');
        });
        es.addEventListener('error', function(ev) {
            if (resp) {
                Str.get_string('status:error', 'tiny_aipromptgen').then(function(s) {
                    resp.textContent += '\n[' + s + '] ' + (ev.data || '');
                    return s;
                }).catch(function() {
                    resp.textContent += '\n[Error] ' + (ev.data || '');
                });
            }
            updateElText(statusEl, 'status:error');
            if (modalStatus) {
                updateElText(modalStatus, 'status:error_occurred');
                modalStatus.style.color = '#dc3545';
            }
            scrollToResponse();
        });
        es.addEventListener('done', function() {
            updateElText(statusEl, 'status:done');
            if (modalStatus) {
                updateElText(modalStatus, 'status:finished');
                modalStatus.style.color = '#28a745';
            }
            if (resp) {
                resp.removeAttribute('aria-busy');
                resp.textContent = Markdown.autofixMarkdown(resp.textContent);
            }
            scrollToResponse();
            es.close();
        });
    };

    const startStream = function(findForm, gen, hidden, resp, scrollToResponse) {
        if (!window.EventSource) {
            const form = findForm();
            if (form) {
                form.submit();
            }
            return;
        }

        const cidEl = document.querySelector('input[name=courseid]');
        const courseid = (cidEl && cidEl.value) || '';
        hidden.value = 'ollama';

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

        const es = new EventSource(base + '?courseid=' + encodeURIComponent(courseid) +
            '&provider=ollama&prompt=' + encodeURIComponent(prompt));

        // Timeout logic
        let lastActivity = Date.now();
        const timeoutMs = 30000; // 30s timeout
        const checkTimeout = setInterval(function() {
            if (Date.now() - lastActivity > timeoutMs) {
                updateElText(statusEl, 'status:timeout');
                if (resp) {
                    resp.removeAttribute('aria-busy');
                }
                es.close();
                clearInterval(checkTimeout);
                scrollToResponse();
            }
        }, 2000);

        // Hook into listeners to update lastActivity
        es.addEventListener('chunk', function() {
            lastActivity = Date.now();
        });
        es.addEventListener('done', function() {
            clearInterval(checkTimeout);
        });
        es.addEventListener('error', function() {
            clearInterval(checkTimeout);
        });

        attachStreamListeners(es, resp, statusEl, scrollToResponse);
    };

    return {
        startStream: startStream
    };
});
