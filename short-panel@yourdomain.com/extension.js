import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class DynamicPanelExtension extends Extension {
    enable() {
        log("DynamicPanelExtension enabled!");

        this._adjustPanelSize();
    }

    disable() {
        log("DynamicPanelExtension disabled!");

        // Remettre le panneau à sa taille normale lors de la désactivation
        this._resetPanelSize();
    }

    _adjustPanelSize() {
        const fixedWidth = 420;  // Largeur fixe de 380 pixels
        const screenWidth = Main.layoutManager.primaryMonitor.width;
        const xPosition = screenWidth - fixedWidth;  // Aligner à droite
        const yPosition = 0;  // Pas de décalage vertical

        // Appliquer la nouvelle taille et position sans animation
        Main.layoutManager.panelBox.translation_x = xPosition;
        Main.layoutManager.panelBox.translation_y = yPosition;  // Pas de décalage vertical
        Main.layoutManager.panelBox.width = fixedWidth;
    }

    _resetPanelSize() {
        const screenWidth = Main.layoutManager.primaryMonitor.width;

        // Remettre la taille et la position du panneau à son état par défaut sans animation
        Main.layoutManager.panelBox.translation_x = 0;
        Main.layoutManager.panelBox.translation_y = 0;  // Pas de décalage vertical
        Main.layoutManager.panelBox.width = screenWidth;
    }
}

