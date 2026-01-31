
import {getTinyMCE} from 'editor_tiny/loader';
import {getPluginMetadata} from 'editor_tiny/utils';

export default new Promise(async(resolve) => {
    const [
        tinyMCE,
        pluginMetadata,
    ] = await Promise.all([
        getTinyMCE(),
        getPluginMetadata('tiny_aipromptgen', 'tiny_aipromptgen/plugin'),
    ]);

    tinyMCE.PluginManager.add('tiny_aipromptgen/plugin', (editor) => {
        // Register an SVG icon
        editor.ui.registry.addIcon('tiny_aipromptgen', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>');

        editor.ui.registry.addButton('tiny_aipromptgen/aipromptgen', {
            icon: 'tiny_aipromptgen',
            tooltip: 'AI Prompt Generator',
            onAction: function() {
                var event = new CustomEvent('aipromptgen:open', { bubbles: true });
                document.dispatchEvent(event);
            }
        });

        editor.ui.registry.addMenuItem('tiny_aipromptgen/aipromptgen', {
            text: 'AI Prompt Generator',
            icon: 'tiny_aipromptgen',
            onAction: function() {
                var event = new CustomEvent('aipromptgen:open', { bubbles: true });
                document.dispatchEvent(event);
            }
        });

        return pluginMetadata;
    });

    resolve(['tiny_aipromptgen/plugin']);
});
