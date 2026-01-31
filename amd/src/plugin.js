
import {getTinyMCE} from 'editor_tiny/loader';
import {getPluginMetadata} from 'editor_tiny/utils';
import * as Configuration from './configuration';

export default new Promise(async(resolve) => {
    const [
        tinyMCE,
        pluginMetadata,
    ] = await Promise.all([
        getTinyMCE(),
        getPluginMetadata('tiny_aipromptgen', 'tiny_aipromptgen/plugin'),
    ]);

    tinyMCE.PluginManager.add('tiny_aipromptgen/plugin', (editor) => {
        // Register the icon with a unique name
        editor.ui.registry.addIcon('aipromptgen-icon', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>');

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
                         if (m) courseId = m[1];
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
            var url = (window.M && window.M.cfg && window.M.cfg.wwwroot ? window.M.cfg.wwwroot : '') + '/blocks/aipromptgen/view.php?courseid=' + courseId + '&popup=1';
            
            window.open(url, 'aipromptgen_popup', 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left + ',scrollbars=yes,resizable=yes');
        };

        // Register the button
        editor.ui.registry.addButton('tiny_aipromptgen', {
            icon: 'aipromptgen-icon',
            tooltip: 'AI Prompt Generator',
            onAction: openPromptGenerator
        });

        // Register the menu item
        editor.ui.registry.addMenuItem('tiny_aipromptgen', {
            text: 'AI Prompt Generator',
            icon: 'aipromptgen-icon',
            onAction: openPromptGenerator
        });

        return pluginMetadata;
    });

    resolve(['tiny_aipromptgen/plugin', Configuration]);
});
