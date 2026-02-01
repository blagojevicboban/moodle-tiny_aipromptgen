
import {getTinyMCE} from 'editor_tiny/loader';
import {getPluginMetadata} from 'editor_tiny/utils';
import * as Configuration from './configuration';

export default Promise.all([
    getTinyMCE(),
    getPluginMetadata('tiny_aipromptgen', 'tiny_aipromptgen/plugin'),
]).then(([tinyMCE, pluginMetadata]) => {
    tinyMCE.PluginManager.add('tiny_aipromptgen/plugin', (editor) => {
        // Register the icon with a unique name
        // eslint-disable-next-line max-len
        editor.ui.registry.addIcon('tiny-aipromptgen-icon', '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><circle cx="8" cy="16" r="1.5" fill="white" stroke="none"></circle><circle cx="16" cy="16" r="1.5" fill="white" stroke="none"></circle></svg>');

        var openPromptGenerator = function() {
            var courseId = '1';

            var urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('courseid')) {
                courseId = urlParams.get('courseid');
            } else if (urlParams.has('id')) {
                if (window.location.href.indexOf('/course/view.php') !== -1) {
                    courseId = urlParams.get('id');
                } else {
                    var link = document.querySelector('a[href*="/course/view.php?id="]');
                    if (link) {
                        var m = link.href.match(/id=(\d+)/);
                        if (m) {
                            courseId = m[1];
                        }
                    }
                }
            }

            if (window.M && window.M.cfg && window.M.cfg.courseId && window.M.cfg.courseId != 1) {
                courseId = window.M.cfg.courseId;
            }

            if (courseId === '1') {
                var cInput = document.querySelector('input[name="course"]');
                if (cInput) {
                    courseId = cInput.value;
                }
            }

            var width = 900;
            var height = 800;
            var left = (screen.width - width) / 2;
            var top = (screen.height - height) / 2;

            // Context Extraction
            var topic = '';
            var lesson = '';

            if (window.location.href.indexOf('editsection.php') !== -1 || window.location.href.indexOf('section.php') !== -1) {
                // Editing a section: 'id_name' is the topic name.
                var topicInput = document.getElementById('id_name') || document.querySelector('input[name="name"]');
                if (topicInput) {
                    topic = topicInput.value;
                }
            } else {
                // Editing an activity or other content: 'id_name' is the lesson title.
                var nameInput = document.querySelector('input[name="name"]') || document.getElementById('id_name');
                if (nameInput) {
                    lesson = nameInput.value;
                }

                // Try to find section (Topic) name.
                var sectionInput = document.getElementById('id_name_value') || document.getElementById('id_sectionname');
                if (sectionInput && sectionInput.value) {
                    topic = sectionInput.value;
                } else {
                    // Fallback to breadcrumbs.
                    var breadcrumbs = document.querySelectorAll('.breadcrumb-item');
                    if (breadcrumbs.length > 2) {
                        // We want to find the first breadcrumb from the end that isn't
                        // the current "lesson" (activity) name or "Edit" or common UI words.
                        var skipList = ['settings', 'general', 'more', 'administration', 'courses', 'home', 'edit'];
                        for (var i = breadcrumbs.length - 1; i >= 0; i--) {
                            var text = breadcrumbs[i].textContent.trim();
                            var lowerText = text.toLowerCase();
                            var skip = false;
                            for (var j = 0; j < skipList.length; j++) {
                                if (lowerText.indexOf(skipList[j]) !== -1) {
                                    skip = true;
                                    break;
                                }
                            }
                            if (text && text !== lesson && !skip) {
                                topic = text;
                                break;
                            }
                        }
                    }
                    if (!topic) {
                        // Try finding element with class sectionname or similar.
                        var sectionNameEl = document.querySelector('.sectionname') ||
                                          document.querySelector('.page-header-headings h1') ||
                                          document.querySelector('.course-section .section-name');
                        if (sectionNameEl) {
                            var stext = sectionNameEl.textContent.trim();
                            if (stext !== lesson) {
                                topic = stext;
                            }
                        }
                    }
                }
            }

            // eslint-disable-next-line max-len
            var url = (window.M && window.M.cfg && window.M.cfg.wwwroot ? window.M.cfg.wwwroot : '') + '/lib/editor/tiny/plugins/aipromptgen/view.php?courseid=' + courseId + '&topic=' + encodeURIComponent(topic) + '&lesson=' + encodeURIComponent(lesson) + '&popup=1';

            // eslint-disable-next-line max-len
            window.open(url, 'aipromptgen_popup', 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left + ',scrollbars=yes,resizable=yes');
        };

        // Register the button
        editor.ui.registry.addButton('tiny_aipromptgen', {
            icon: 'tiny-aipromptgen-icon',
            tooltip: 'AI Prompt Generator',
            onAction: openPromptGenerator
        });

        // Register the menu item
        editor.ui.registry.addMenuItem('tiny_aipromptgen', {
            text: 'AI Prompt Generator',
            icon: 'tiny-aipromptgen-icon',
            onAction: openPromptGenerator
        });

        return pluginMetadata;
    });

    return ['tiny_aipromptgen/plugin', Configuration];
});
