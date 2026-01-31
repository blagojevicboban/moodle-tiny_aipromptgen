
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

            // 1. Activity Name (standard Moodle form field 'name')
            var nameInput = document.querySelector('input[name="name"]') || document.getElementById('id_name');
            if (nameInput) {
                lesson = nameInput.value;
            }

            // 2. Section/Topic Name (standard Moodle section edit field)
            // 2. Section/Topic Name
            var sectionInput = document.getElementById('id_name_value');
            if (sectionInput) {
                topic = sectionInput.value;
            } else {
                // Fallback: Try to find section name from breadcrumbs or page structure
                // Common in Moodle: Breadcrumbs can hold the section name
                var breadcrumbs = document.querySelectorAll('.breadcrumb-item');
                if (breadcrumbs.length > 1) {
                    // Usually: Home > Course > Section > Activity
                    // If editing activity, Section is usually 2nd to last.
                    // If editing section, it might be the last one (but text might be 'Edit...').
                    
                    // Let's try to get the text of the link in the breadcrumb before the last one?
                    // Or just grab the course shortname if nothing else?
                    // Better: look for a section header on the page if visible.

                    // Simple logic: If we are in modedit, topic might not be editable.
                    // Let's try to grab it from the page header if valid? No.

                    // Let's just leave it empty if input not found, BUT check one more ID:
                    var sectionName = document.querySelector('.sectionname');
                    if (sectionName) {
                        topic = sectionName.innerText.trim();
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
