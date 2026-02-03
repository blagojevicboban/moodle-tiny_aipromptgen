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
 * @package    tiny_aipromptgen
 * @copyright  2025 AI4Teachers
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['tiny_aipromptgen/markdown'], function(Markdown) {

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
            modalStatus.textContent = 'Connecting...';
            modalStatus.style.color = '#007bff';
        }

        if (statusEl) {
            statusEl.textContent = 'Streaming...';
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
            if (statusEl) {
                statusEl.textContent = 'Started';
            }
            if (modalStatus) {
                modalStatus.textContent = 'Receiving...';
            }
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
            if (modalStatus) {
                modalStatus.textContent = 'Receiving...';
            }
        });
        es.addEventListener('error', function(ev) {
            if (resp) {
                resp.textContent += '\n[Error] ' + (ev.data || '');
            }
            if (statusEl) {
                statusEl.textContent = 'Error';
            }
            if (modalStatus) {
                modalStatus.textContent = 'Error occurred';
                modalStatus.style.color = '#dc3545';
            }
            scrollToResponse();
        });
        es.addEventListener('done', function() {
            if (statusEl) {
                statusEl.textContent = 'Done';
            }
            if (modalStatus) {
                modalStatus.textContent = 'Finished';
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
                if (statusEl) {
                    statusEl.textContent = 'Timeout (incomplete)';
                }
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
