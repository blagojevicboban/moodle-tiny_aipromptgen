
import {
    addMenubarItem,
    addToolbarButton,
} from 'editor_tiny/utils';

export const configure = (instanceConfig) => {
    // Update the instance configuration to add the AI Prompt Generator menu option to the menus and toolbars.
    // Button name must match what is registered in plugin.js
    const buttonName = 'tiny_aipromptgen'; 
    
    return {
        toolbar: addToolbarButton(instanceConfig.toolbar, 'content', buttonName),
        menu: addMenubarItem(instanceConfig.menu, 'insert', buttonName),
    };
};
