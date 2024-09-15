import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Panel from 'resource:///org/gnome/shell/ui/panel.js';
import GLib from 'gi://GLib';

export default class DynamicPanelExtension extends Extension {
    enable() {
        log("DynamicPanelExtension enabled!");

        // Vérification si c'est X.org
        if (this._isX11()) {
            this._adjustPanelSize(); // Ajuster la taille du panneau

            // Positionner l'horloge avec l'offset uniquement
            this._setClockMenuPosition(2, 2); // position = 2 (droite), offset = 2
            this._setPanelSize(32); // Ajuster la hauteur du panneau
            this._setPanelIconSize(14); // Ajuster la taille des icônes à 14px
            this._setPanelButtonPadding(6); // Ajuster le padding des boutons du panneau
        }
    }

    disable() {
        log("DynamicPanelExtension disabled!");

        // Remettre le panneau à sa taille normale uniquement sous X.org
        if (this._isX11()) {
            this._resetPanelSize();
        }
    }

    _adjustPanelSize() {
        const screenWidth = Main.layoutManager.primaryMonitor.width;
        //let fixedWidth;
        let floatingWidth;

        // Ajuster la largeur en fonction de la taille de l'écran
        if (screenWidth <= 1440) {
            //fixedWidth = 420; // Largeur fixe de 420 pixels pour les écrans <= 1440px
            floatingWidth = screenWidth * 0.25;  // 25% de la largeur de l'écran
        } else {
            //fixedWidth = 480; // Largeur fixe de 480 pixels pour les écrans > 1440px
            floatingWidth = screenWidth * 0.3;  // 30% de la largeur de l'écran
        }

        //const xPosition = screenWidth - fixedWidth; // Aligner à droite
        const xPosition = screenWidth - floatingWidth; // Aligner à droite
        const yPosition = 0; // Pas de décalage vertical



        // Appliquer la nouvelle taille et position sans animation
        Main.layoutManager.panelBox.translation_x = xPosition;
        Main.layoutManager.panelBox.translation_y = yPosition; // Pas de décalage vertical
        //Main.layoutManager.panelBox.width = fixedWidth;
        Main.layoutManager.panelBox.width = floatingWidth;
    }

    _resetPanelSize() {
        const screenWidth = Main.layoutManager.primaryMonitor.width;

        // Remettre la taille et la position du panneau à son état par défaut sans animation
        Main.layoutManager.panelBox.translation_x = 0;
        Main.layoutManager.panelBox.translation_y = 0; // Pas de décalage vertical
        Main.layoutManager.panelBox.width = screenWidth;
    }

    _setClockMenuPosition(position, offset) {
        const clockMenu = Main.panel.statusArea.dateMenu;

        // Déplacement de l'horloge selon la position
        if (position === 2) {
            Main.panel._rightBox.insert_child_at_index(clockMenu.container, 0);
        } else if (position === 1) {
            Main.panel._centerBox.insert_child_at_index(clockMenu.container, 0);
        } else {
            Main.panel._leftBox.insert_child_at_index(clockMenu.container, 0);
        }

        // Appliquer l'offset de positionnement
        clockMenu.container.translation_x = offset;
    }

    _setPanelSize(size) {
        // Ajuster la taille du panneau
        Main.layoutManager.panelBox.height = size;
    }

    _setPanelIconSize(iconSize) {
        // Vérifie et ajuste la taille des icônes dans les éléments du panneau
        for (let area in Main.panel.statusArea) {
            const item = Main.panel.statusArea[area];
            if (item.container) {
                item.container.get_children().forEach(child => {
                    if (child.icon_size) {
                        child.icon_size = iconSize; // Ajuste la taille des icônes
                    }
                });
            }
        }
    }

    _setPanelButtonPadding(paddingSize) {
        const aggregateMenu = Main.panel.statusArea.aggregateMenu;

        // Vérification que aggregateMenu existe avant d'ajuster le padding des boutons
        if (aggregateMenu) {
            aggregateMenu.actor.get_style_class_name = () => {
                return `panel-button padding-${paddingSize}`;
            };
        } else {
            log('aggregateMenu is undefined, skipping button padding adjustment.');
        }
    }
    

    _isX11() {
        // Vérifie si la session est sur X.org
        return GLib.getenv('XDG_SESSION_TYPE') === 'x11';
    }
}
