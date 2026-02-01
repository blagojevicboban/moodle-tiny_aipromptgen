
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

        /**
         * Get the course ID from various sources.
         * @returns {string}
         */
        const getCourseId = () => {
            let courseId = '1';
            const urlParams = new URLSearchParams(window.location.search);

            if (urlParams.has('courseid')) {
                courseId = urlParams.get('courseid');
            } else if (urlParams.has('id')) {
                if (window.location.href.indexOf('/course/view.php') !== -1) {
                    courseId = urlParams.get('id');
                } else {
                    const link = document.querySelector('a[href*="/course/view.php?id="]');
                    if (link) {
                        const m = link.href.match(/id=(\d+)/);
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
                const cInput = document.querySelector('input[name="course"]');
                if (cInput) {
                    courseId = cInput.value;
                }
            }
            return courseId;
        };

        /**
         * Get context (topic and lesson) from the page.
         * @returns {Object}
         */
        const getContext = () => {
            let topic = '';
            let lesson = '';
            const skipList = ['settings', 'general', 'more', 'administration', 'courses', 'home', 'edit'];

            if (window.location.href.indexOf('editsection.php') !== -1 || window.location.href.indexOf('section.php') !== -1) {
                const topicInput = document.getElementById('id_name') || document.querySelector('input[name="name"]');
                if (topicInput) {
                    topic = topicInput.value;
                }
            } else {
                const nameInput = document.querySelector('input[name="name"]') || document.getElementById('id_name');
                if (nameInput) {
                    lesson = nameInput.value;
                }

                const sectionInput = document.getElementById('id_name_value') || document.getElementById('id_sectionname');
                if (sectionInput && sectionInput.value) {
                    topic = sectionInput.value;
                } else {
                    const breadcrumbs = document.querySelectorAll('.breadcrumb-item');
                    for (let i = breadcrumbs.length - 1; i >= 0 && !topic; i--) {
                        const text = breadcrumbs[i].textContent.trim();
                        const lowerText = text.toLowerCase();
                        const isSkip = skipList.some(s => lowerText.indexOf(s) !== -1);
                        if (text && text !== lesson && !isSkip) {
                            topic = text;
                        }
                    }

                    if (!topic) {
                        const sectionNameEl = document.querySelector('.sectionname') ||
                                          document.querySelector('.page-header-headings h1') ||
                                          document.querySelector('.course-section .section-name');
                        if (sectionNameEl) {
                            const stext = sectionNameEl.textContent.trim();
                            if (stext !== lesson) {
                                topic = stext;
                            }
                        }
                    }
                }
            }
            return {topic, lesson};
        };

        const openPromptGenerator = function() {
            const courseId = getCourseId();
            const {topic, lesson} = getContext();

            const width = 900;
            const height = 800;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;

            // eslint-disable-next-line max-len
            const url = (window.M && window.M.cfg && window.M.cfg.wwwroot ? window.M.cfg.wwwroot : '') + '/lib/editor/tiny/plugins/aipromptgen/view.php?courseid=' + courseId + '&topic=' + encodeURIComponent(topic) + '&lesson=' + encodeURIComponent(lesson) + '&popup=1';

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
