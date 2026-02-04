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
 * Main UI controller for the AI Prompt Generator.
 *
 * @package
 * @copyright  2025 AI4Teachers
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['core/str'], function(Str) {
    return {
        init: function() {
            require([
                'tiny_aipromptgen/age',
                'tiny_aipromptgen/pickers',
                'tiny_aipromptgen/actions',
                'tiny_aipromptgen/stream',
                'tiny_aipromptgen/markdown'
            ], function(Age, Pickers, Actions, Stream, Markdown) {

                var updatePrompt = function() {
                    var getValue = function(id) {
                        var el = document.getElementById(id);
                        return el ? el.value : '';
                    };

                    var subject = getValue('id_subject');
                    if (!subject) {
                        var subjectEl = document.getElementById('id_subject');
                        if (subjectEl && subjectEl.placeholder) {
                            subject = subjectEl.placeholder;
                        }
                    }

                    var age = getValue('id_agerange');
                    var topic = getValue('id_topic');
                    var lesson = getValue('id_lesson');
                    var count = getValue('id_lessoncount') || '1';
                    var duration = getValue('id_lessonduration') || '45';
                    var classtype = getValue('id_classtype');
                    var purpose = getValue('id_purpose');
                    var audience = getValue('id_audience');
                    var outcomes = getValue('id_outcomes');
                    var language = getValue('id_language');

                    Str.get_strings([
                        {key: 'prompt:expert', component: 'tiny_aipromptgen'},
                        {key: 'prompt:subject', component: 'tiny_aipromptgen', param: subject},
                        {key: 'prompt:age', component: 'tiny_aipromptgen', param: age},
                        {key: 'prompt:topic', component: 'tiny_aipromptgen', param: topic},
                        {key: 'prompt:lesson_title', component: 'tiny_aipromptgen', param: lesson},
                        {key: 'prompt:num_lessons', component: 'tiny_aipromptgen', param: count},
                        {key: 'prompt:duration', component: 'tiny_aipromptgen', param: duration},
                        {key: 'prompt:class_type', component: 'tiny_aipromptgen', param: classtype},
                        {key: 'prompt:purpose', component: 'tiny_aipromptgen', param: purpose},
                        {key: 'prompt:audience', component: 'tiny_aipromptgen', param: audience},
                        {key: 'prompt:outcomes', component: 'tiny_aipromptgen'},
                        {key: 'prompt:language', component: 'tiny_aipromptgen', param: language || ''},
                        {key: 'prompt:footer', component: 'tiny_aipromptgen'},
                        {key: 'default:language', component: 'tiny_aipromptgen'}
                    ]).then(function(strings) {
                        var sExpert = strings[0];
                        var sSubject = strings[1];
                        var sAge = strings[2];
                        var sTopic = strings[3];
                        var sLessonTitle = strings[4];
                        var sNumLessons = strings[5];
                        var sDuration = strings[6];
                        var sClassType = strings[7];
                        var sPurpose = strings[8];
                        var sAudience = strings[9];
                        var sOutcomes = strings[10];
                        var sLanguage = strings[11];
                        var sFooter = strings[12];
                        var sDefLang = strings[13];

                        var usedLang = language || sDefLang;
                        if (!language) {
                            // Re-fetch localized language string if we had to fall back.
                            sLanguage = sLanguage.replace('{$a}', usedLang);
                        }

                        var p = sExpert + "\n";
                        if (subject) {
                            p += sSubject + "\n";
                        }
                        if (age) {
                            p += sAge + "\n";
                        }
                        if (topic) {
                            p += sTopic + "\n";
                        }
                        if (lesson) {
                            p += sLessonTitle + "\n";
                        }
                        p += sNumLessons + "\n";
                        p += sDuration + "\n";
                        if (classtype) {
                            p += sClassType + "\n";
                        }
                        if (purpose) {
                            p += sPurpose + "\n";
                        }
                        if (audience) {
                            p += sAudience + "\n";
                        }
                        if (outcomes) {
                            p += sOutcomes + "\n" + outcomes + "\n";
                        }
                        p += sLanguage + "\n";
                        p += "\n" + sFooter;

                        var gen = document.getElementById('ai4t-generated');
                        if (gen) {
                            gen.value = p;
                            gen.dispatchEvent(new Event('input', {bubbles: true}));
                        }
                        return p;
                    }).catch(function() {
                        // Fallback.
                    });
                };

                var initAutoUpdate = function() {
                    var ids = [
                        'id_subject', 'id_agerange', 'id_topic', 'id_lesson',
                        'id_lessoncount', 'id_lessonduration', 'id_classtype',
                        'id_purpose', 'id_audience', 'id_outcomes', 'id_language'
                    ];

                    ids.forEach(function(id) {
                        var el = document.getElementById(id);
                        if (el) {
                            el.addEventListener('input', updatePrompt);
                            el.addEventListener('change', updatePrompt);
                        }
                    });

                    setTimeout(updatePrompt, 500);
                };

                var initProviderSend = function() {
                    var sendBtn = document.getElementById('ai4t-sendtoai');
                    var select = document.getElementById('ai4t-provider');
                    var gen = document.getElementById('ai4t-generated');
                    var hidden = document.getElementById('ai4t-sendto');

                    if (!hidden && sendBtn) {
                        var form = document.getElementById('mform1') ||
                                   document.getElementById('promptform') ||
                                   sendBtn.closest('form');
                        if (form) {
                            hidden = document.createElement('input');
                            hidden.type = 'hidden';
                            hidden.name = 'sendto';
                            hidden.id = 'ai4t-sendto';
                            form.appendChild(hidden);
                        }
                    }

                    if (!sendBtn || !select || !gen) {
                        return;
                    }

                    var refreshState = function() {
                        var opt = select.options[select.selectedIndex];
                        var unconfigured = opt && /✕\s*$/.test(opt.textContent || '');
                        sendBtn.disabled = (!gen.value.trim() || unconfigured);
                    };

                    select.addEventListener('change', refreshState);
                    gen.addEventListener('input', refreshState);

                    sendBtn.addEventListener('click', function(e) {
                        if (sendBtn.disabled) {
                            return;
                        }
                        var provider = select.value;
                        var form = document.getElementById('ai4t-send-form');

                        if (provider === 'ollama') {
                            e.preventDefault();
                            var resp = document.getElementById('ai4t-airesponse-body') ||
                                       document.getElementById('ai4t-airesponse');

                            Stream.startStream(function() {
                                return form;
                            }, gen, hidden, resp, function() {
                                // No-op scroll.
                            });
                            return;
                        }

                        sendBtn.disabled = true;
                        Str.get_string('status_generating', 'tiny_aipromptgen').then(function(s) {
                            sendBtn.textContent = s;
                            return s;
                        }).catch(function() {
                            sendBtn.textContent = 'Generating...';
                        });

                        hidden.value = provider;
                        if (form) {
                            form.submit();
                        }
                    });
                    refreshState();
                };

                var initResponseModal = function() {
                    var modal = document.getElementById('ai4t-airesponse-modal');
                    if (!modal) {
                        return;
                    }

                    var bodyRaw = document.getElementById('ai4t-airesponse-body');
                    var bodyText = document.getElementById('ai4t-airesponse-text');
                    var bodyHtml = document.getElementById('ai4t-airesponse-html');
                    var bodyCode = document.getElementById('ai4t-airesponse-code');
                    var backdrop = document.getElementById('ai4t-modal-backdrop');

                    var setView = function(view) {
                        var btns = ['raw', 'text', 'html', 'rich'].map(function(v) {
                            return document.getElementById('ai4t-btn-' + v);
                        });
                        var bodies = [bodyRaw, bodyText, bodyHtml, bodyCode];

                        btns.forEach(function(btn) {
                            if (btn) {
                                btn.classList.remove('btn-secondary');
                                btn.classList.add('btn-outline-secondary');
                            }
                        });
                        bodies.forEach(function(b) {
                            if (b) {
                                b.style.display = 'none';
                            }
                        });

                        applyView(view, btns, bodies, bodyRaw, bodyText, bodyCode, bodyHtml, Markdown);
                    };

                    document.addEventListener('click', function(e) {
                        handleModalClick(e, modal, backdrop, {
                            bodyRaw: bodyRaw, bodyText: bodyText, bodyHtml: bodyHtml, bodyCode: bodyCode,
                            setView: setView, showStatus: showStatus, copyRichText: copyRichText
                        });
                    });

                    if (bodyRaw && bodyRaw.textContent.trim().length > 0) {
                        modal.style.display = 'block';
                        if (backdrop) {
                            backdrop.style.display = 'block';
                        }
                        setView('rich');
                    }
                };

                var applyView = function(view, btns, bodies, bodyRaw, bodyText, bodyCode, bodyHtml, Markdown) {
                    var map = {raw: 0, text: 1, html: 2, rich: 3};
                    var idx = map[view];
                    if (btns[idx]) {
                        btns[idx].classList.remove('btn-outline-secondary');
                        btns[idx].classList.add('btn-secondary');
                    }

                    if (view === 'raw' && bodyRaw) {
                        bodyRaw.style.display = 'block';
                    } else if (view === 'text' && bodyText) {
                        bodyText.style.display = 'block';
                        bodyText.textContent = Markdown.renderText(bodyRaw.textContent);
                    } else if (view === 'html' && bodyCode) {
                        bodyCode.style.display = 'block';
                        bodyCode.textContent = Markdown.renderMarkdown(bodyRaw.textContent);
                    } else if (view === 'rich' && bodyHtml) {
                        bodyHtml.style.display = 'block';
                        try {
                            bodyHtml.innerHTML = Markdown.renderMarkdown(bodyRaw.textContent);
                        } catch (e) {
                            Str.get_string('status_error_rendering_markdown', 'tiny_aipromptgen').then(function(s) {
                                bodyHtml.innerHTML = '<p>' + s + '</p>';
                                return s;
                            }).catch(function() {
                                bodyHtml.innerHTML = '<p>Error rendering Markdown.</p>';
                            });
                        }
                    }
                };

                var handleModalClick = function(e, modal, backdrop, refs) {
                    var btn = e.target.closest('button');
                    var t = e.target;
                    if (btn) {
                        if (btn.id === 'ai4t-btn-raw') {
                            refs.setView('raw');
                        } else if (btn.id === 'ai4t-btn-text') {
                            refs.setView('text');
                        } else if (btn.id === 'ai4t-btn-html') {
                            refs.setView('html');
                        } else if (btn.id === 'ai4t-btn-rich') {
                            refs.setView('rich');
                        } else if (btn.id === 'ai4t-airesponse-modal-close-btn') {
                            modal.style.display = 'none';
                            if (backdrop) {
                                backdrop.style.display = 'none';
                            }
                        } else if (btn.id === 'ai4t-airesponse-modal-copy-btn') {
                            handleCopy(refs);
                        } else if (btn.id === 'ai4t-airesponse-modal-insert-btn') {
                            handleInsert(refs);
                        }
                    }
                    if (t && t.id === 'ai4t-airesponse-modal-close') {
                        modal.style.display = 'none';
                        if (backdrop) {
                            backdrop.style.display = 'none';
                        }
                    }
                };

                var handleCopy = function(refs) {
                    if (refs.bodyHtml && refs.bodyHtml.style.display !== 'none') {
                        if (refs.copyRichText(refs.bodyHtml)) {
                            showStatusById('status_copiedrichtext');
                        } else {
                            showStatusById('status_copyfailed');
                        }
                    } else {
                        var text = '';
                        if (refs.bodyRaw && refs.bodyRaw.style.display !== 'none') {
                            text = refs.bodyRaw.textContent;
                        } else if (refs.bodyText && refs.bodyText.style.display !== 'none') {
                            text = refs.bodyText.textContent;
                        } else if (refs.bodyCode && refs.bodyCode.style.display !== 'none') {
                            text = refs.bodyCode.textContent;
                        }

                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(text).then(function() {
                                showStatusById('status_copiedclipboard');
                                return;
                            }).catch(function() {
                                // Silent fail.
                            });
                        } else {
                            var ta = document.createElement('textarea');
                            ta.value = text;
                            document.body.appendChild(ta);
                            ta.select();
                            document.execCommand('copy');
                            document.body.removeChild(ta);
                            showStatusById('form_copied');
                        }
                    }
                };

                var showStatusById = function(id) {
                    Str.get_string(id, 'tiny_aipromptgen').then(function(s) {
                        showStatus(s);
                        return s;
                    }).catch(function() {
                        // Silent fail.
                    });
                };

                var showStatus = function(msg) {
                    var status = document.getElementById('ai4t-modal-copy-status');
                    if (status) {
                        status.textContent = msg;
                        status.style.display = 'inline';
                        setTimeout(function() {
                            status.style.display = 'none';
                        }, 2000);
                    } else {
                        window.console.log(msg);
                    }
                };

                var handleInsert = function(refs) {
                    var content = '';
                    if (refs.bodyHtml && refs.bodyHtml.style.display !== 'none') {
                        content = refs.bodyHtml.innerHTML;
                    } else if (refs.bodyCode && refs.bodyCode.style.display !== 'none') {
                        content = refs.bodyCode.textContent;
                    } else if (refs.bodyText && refs.bodyText.style.display !== 'none') {
                        content = refs.bodyText.textContent.trim().split(/\n+/).map(function(p) {
                            return '<p>' + p.trim() + '</p>';
                        }).join('');
                    } else if (refs.bodyRaw && refs.bodyRaw.style.display !== 'none') {
                        content = refs.bodyRaw.textContent.replace(/\n/g, '<br>');
                    }

                    if (window.opener && window.opener.tinyMCE && window.opener.tinyMCE.activeEditor) {
                        try {
                            window.opener.tinyMCE.activeEditor.insertContent(content);
                            window.close();
                        } catch (e) {
                            window.console.error('Failed to insert content. The editor window might be closed.');
                        }
                    } else {
                        window.console.error('Could not find the parent editor window.');
                    }
                };

                var copyRichText = function(el) {
                    try {
                        var range = document.createRange();
                        range.selectNode(el);
                        var selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(range);
                        var successful = document.execCommand('copy');
                        selection.removeAllRanges();
                        return successful;
                    } catch (e) {
                        return false;
                    }
                };

                // Initialize all modules
                var inits = [
                    function() {
                        Age.initAgeModal();
                    },
                    function() {
                        Pickers.attachPicker({
                            openId: 'ai4t-lesson-browse', modalId: 'ai4t-modal',
                            closeId: 'ai4t-modal-close', cancelId: 'ai4t-modal-cancel',
                            itemSelector: '.ai4t-lesson-item', targetId: 'id_lesson'
                        });
                        Pickers.attachPicker({
                            openId: 'ai4t-topic-browse', modalId: 'ai4t-topic-modal',
                            closeId: 'ai4t-topic-modal-close', cancelId: 'ai4t-topic-modal-cancel',
                            itemSelector: '.ai4t-topic-item', targetId: 'id_topic'
                        });
                        Pickers.attachOutcomesModal();
                        Pickers.initLanguageModal();
                        ['purpose', 'audience', 'classtype'].forEach(function(k) {
                            Pickers.attachPicker({
                                openId: 'ai4t-' + k + '-browse', modalId: 'ai4t-' + k + '-modal',
                                closeId: 'ai4t-' + k + '-modal-close', cancelId: 'ai4t-' + k + '-modal-cancel',
                                itemSelector: '.ai4t-' + k + '-item', targetId: 'id_' + k
                            });
                        });
                    },
                    function() {
                        Actions.attachCopyDownload();
                    },
                    function() {
                        initProviderSend();
                    },
                    function() {
                        initAutoUpdate();
                    },
                    function() {
                        initResponseModal();
                    }
                ];

                inits.forEach(function(fn) {
                    try {
                        fn();
                    } catch (e) {
                        /* Silent fail */
                    }
                });
            });
        }
    };
});
