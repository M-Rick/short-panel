import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Panel from 'resource:///org/gnome/shell/ui/panel.js';
import St from 'gi://St';
import GLib from 'gi://GLib';

export default class ShortPanelExtension extends Extension {
    enable() {
        log("ShortPanelExtension enabled!");

        // Vérification si c'est X.org
        if (this._isX11()) {
            this._adjustPanelWidth(); // Ajuster la taille du panneau
            this._setPanelHeight(30); // Ajuster la hauteur du panneau
        }
    }

    disable() {
        log("ShortPanelExtension disabled!");

        // Remettre le panneau à sa taille normale uniquement sous X.org
        if (this._isX11()) {
            this._resetPanelWidth();
        }
    }
        
        _adjustPanelWidth() {
        const screenWidth = Main.layoutManager.primaryMonitor.width;
        let panelWidth;

        // Ajuster la largeur en fonction de la taille de l'écran
        // Pour les écrans de plus de moins 1440px de large pour un scaling de 100 %
        if (screenWidth <= 1440) {
            //panelWidth = 420; // Largeur fixe de 420 pixels
            panelWidth = screenWidth * 0.26;  // 26% de la largeur de l'écran
        } else {
            // Pour les écrans de plus de 1440px de large
            //panelWidth = 480 * scalingFactor; // Largeur fixe de 462 px pour un scaling de 100 %
            panelWidth = 700; // Largeur de 700 px pour un scaling de 200 %
            //panelWidth = screenWidth * 0.23;  // 23% de la largeur de l'écran pour un scaling de 100 %
            //panelWidth = screenWidth * 0.25;  // 25% de la largeur de l'écran pour un scaling de 200 %
        }

        //const xPosition = screenWidth - fixedWidth; // Aligner à droite
        const xPosition = screenWidth - panelWidth; // Aligner à droite
        const yPosition = 0; // Pas de décalage vertical

        // Appliquer la nouvelle taille et position sans animation
        Main.layoutManager.panelBox.translation_x = xPosition;
        Main.layoutManager.panelBox.translation_y = yPosition; // Pas de décalage vertical
        Main.layoutManager.panelBox.width = panelWidth;
    }

    _resetPanelWidth() {
        const screenWidth = Main.layoutManager.primaryMonitor.width;

        // Remettre la taille et la position du panneau à son état par défaut sans animation
        Main.layoutManager.panelBox.translation_x = 0;
        Main.layoutManager.panelBox.translation_y = 0; // Pas de décalage vertical
        Main.layoutManager.panelBox.width = screenWidth;
    }
    
    _setPanelHeight(size) {
        // Ajuster la hauteur du panneau
        Main.layoutManager.panelBox.height = size;
    }
    

    _isX11() {
        // Vérifie si la session est sur X.org
        return GLib.getenv('XDG_SESSION_TYPE') === 'x11';
    }
}
