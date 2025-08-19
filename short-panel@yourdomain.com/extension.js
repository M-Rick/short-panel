"use strict";

import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as Panel from "resource:///org/gnome/shell/ui/panel.js";
import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import St from 'gi://St';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';

export default class ShortPanelExtension extends Extension {
    enable() {
        this._sleepSignalId = null;
        this._monitorsChangedId = null;
        this._qsChangedId = null;
        this._indicatorSignals = [];
        this._childAddedId = null;
        this._childRemovedId = null;
        this._startupTimeoutId = 0;
        
        this._sleepSignalId = Gio.DBus.system.signal_subscribe(
            null,
            'org.freedesktop.login1',
            'org.freedesktop.DBus.Properties',
            'PropertiesChanged',
            '/org/freedesktop/login1',
            'org.freedesktop.login1.Manager',
            (connection, sender, object, interfaceName, signalName, parameters) => {
                const [interfaceChanged, changedProps] = parameters.deep_unpack();
                if (interfaceChanged === 'org.freedesktop.login1.Manager' && changedProps['PrepareForSleep']) {
                    const goingToSleep = changedProps['PrepareForSleep'].deep_unpack();
                    if (goingToSleep) {
                        this._resetPanelWidth();
                    } else {
                        this._adjustPanelWidth();
                    }
                }
            }
        );

        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => {
            this._adjustPanelWidth();
        });

        const quickSettings = Main.panel.statusArea.quickSettings;
        if (quickSettings) {

            if (quickSettings._indicators) {

                this._connectIndicators();
                
                this._childAddedId = quickSettings._indicators.connect('child-added', () => {
                    this._disconnectIndicators();
                    this._connectIndicators();
                    this._adjustQuickSettingsContainer();
                });
                
                this._childRemovedId = quickSettings._indicators.connect('child-removed', () => {
                    this._disconnectIndicators();
                    this._connectIndicators();
                    this._adjustQuickSettingsContainer();
                });
            }
            
            this._qsChangedId = quickSettings.actor.connect('notify::allocation', () => {
                this._adjustQuickSettingsContainer();
            });
        }

        this._adjustPanelWidth();
        
        this._adjustQuickSettingsContainer();

        this._hideOverviewAtStartup();

        this._moveAllToLeftBox();
        
        this._adjustDateMenuPosition();

        if (Main.panel._leftBox) {
            Main.panel._leftBox.spacing = 2;
        }
    }

    disable() {
        if (this._sleepSignalId) {
            Gio.DBus.system.signal_unsubscribe(this._sleepSignalId);
            this._sleepSignalId = null;
        }

        if (this._monitorsChangedId) {
            Main.layoutManager.disconnect(this._monitorsChangedId);
            this._monitorsChangedId = null;
        }

        const quickSettings = Main.panel.statusArea.quickSettings;
        
        if (this._qsChangedId && quickSettings) {
            quickSettings.actor.disconnect(this._qsChangedId);
            this._qsChangedId = null; 
        }

        if (this._childAddedId && quickSettings && quickSettings._indicators) {
            quickSettings._indicators.disconnect(this._childAddedId);
            this._childAddedId = null;
        }

        if (this._childRemovedId && quickSettings && quickSettings._indicators) {
            quickSettings._indicators.disconnect(this._childRemovedId);
            this._childRemovedId = null;
        }
        
        this._disconnectIndicators();

        if (this._startupTimeoutId) {
            GLib.source_remove(this._startupTimeoutId);
            this._startupTimeoutId = 0;
        }

        this._resetPanelWidth();
        this._resetPanelItemsPosition();

        if (quickSettings && quickSettings.actor) {
            quickSettings.actor.style = null;
            quickSettings.actor.set_position(0, quickSettings.actor.y);
            if (quickSettings._indicators) {
                quickSettings._indicators.style = null;
                quickSettings._indicators.set_width(-1);
            }
        }
        
        this._resetDateMenuPosition();
        
        if (Main.panel._leftBox) {
            Main.panel._leftBox.spacing = 0;
        }
    }

    _connectIndicators() {
        const quickSettings = Main.panel.statusArea.quickSettings;
        if (!quickSettings || !quickSettings._indicators) return;
        
        const indicators = quickSettings._indicators.get_children();
        for (const indicator of indicators) {
            const id = indicator.connect('notify::visible', () => {
                this._adjustQuickSettingsContainer();
            });
            this._indicatorSignals.push({ actor: indicator, id });
        }
    }

    _disconnectIndicators() {
        for (const { actor, id } of this._indicatorSignals) {
            if (actor && actor.disconnect) {
                actor.disconnect(id);
            }
        }
        this._indicatorSignals = [];
    }

    _adjustPanelWidth() {
        const screenWidth = Main.layoutManager.primaryMonitor.width;
        const scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;
        let panelWidth;

        if (screenWidth <= 1441) {
            panelWidth = scaleFactor === 2 ? 535 : 410;
        } else {
            panelWidth = scaleFactor === 2 ? 685 : 430;
        }

        const rightScreenMargin = 1; 

        const xPosition = screenWidth - panelWidth - rightScreenMargin; 
        const yPosition = -1;

        Main.layoutManager.panelBox.width = panelWidth;
        Main.layoutManager.panelBox.translation_x = xPosition;
        Main.layoutManager.panelBox.translation_y = yPosition;

        this._adjustQuickSettingsContainer();
    }

    _resetPanelWidth() {
        const screenWidth = Main.layoutManager.primaryMonitor.width;

        Main.layoutManager.panelBox.translation_x = 0;
        Main.layoutManager.panelBox.translation_y = 0;
        Main.layoutManager.panelBox.width = screenWidth;
    }

    _adjustQuickSettingsContainer() {
        const quickSettings = Main.panel.statusArea.quickSettings;
        if (!quickSettings || !quickSettings._indicators || !quickSettings.actor) return;
        
        quickSettings.actor.style = `
            x-align: end; 
            width: 146px;
        `;

        quickSettings._indicators.style = `
            x-align: end;
            -st-box-flow: end;
            spacing: 0px;
        `;
        
        quickSettings.actor.queue_relayout();
    }
    
    _adjustDateMenuPosition() {
        if (Main.panel.dateMenu && Main.panel.dateMenu.container) {
            Main.panel.dateMenu.container.style = `
                margin-right: 4px;
            `;
            Main.panel.dateMenu.container.queue_relayout();
        }
    }

    _resetDateMenuPosition() {
        if (Main.panel.dateMenu && Main.panel.dateMenu.container) {
            Main.panel.dateMenu.container.style = null;
            Main.panel.dateMenu.container.set_position(0, Main.panel.dateMenu.container.y);
        }
    }

    _hideOverviewAtStartup() {
        if (Main.sessionMode.isLocked) return;

        this._startupTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
            if (Main.overview && Main.overview.visible) {
                Main.overview.hide();
            }
            this._startupTimeoutId = 0;
            return GLib.SOURCE_REMOVE;
        });
    }

    _moveAllToLeftBox() {
        const leftBox = Main.panel._leftBox;
        const rightBox = Main.panel._rightBox; 
        const centerBox = Main.panel._centerBox;

        const itemsToMove = [
            'a11y',       // Accessibility
            'appMenu',    // App Indicators (nom plus ancien)
            'appIndicators', // App Indicators (nom plus récent)
            'keyboard',   // Input Source Chooser (Bouton clavier)
            'pop-shell', // Pop Shell Tiling Windows (ID exact trouvé via Looking Glass et confirmé)
        ];

        const activitiesButton = Main.panel.statusArea['activities']; 

        if (activitiesButton && leftBox && activitiesButton.container.get_parent() !== leftBox) {
             const parent = activitiesButton.container.get_parent();
             if (parent) {
                 parent.remove_child(activitiesButton.container);
                 leftBox.insert_child_at_index(activitiesButton.container, 0);
                 log('Moved Activities button to left box.');
             }
        }

        for (const itemKey of itemsToMove) {
            const item = Main.panel.statusArea[itemKey];
            if (item && item.container) {
                const parent = item.container.get_parent();
                if (parent && parent !== leftBox) { 
                    parent.remove_child(item.container);
                    
                    if (itemKey === 'pop-shell') { 
                        if (item.container.get_parent() === leftBox) {
                            leftBox.remove_child(item.container);
                        }
                        leftBox.insert_child_at_index(item.container, leftBox.get_children().length);
                        log(`Moved PopOs Tiling Windows (pop-shell) to the end of left box.`);
                    } else {
                        leftBox.add_child(item.container);
                    }

                    log(`Moved ${itemKey} to left box.`);
                }
            }
        }
        
        if (centerBox) {
            const centerChildren = centerBox.get_children();
            for (const child of centerChildren) {
                if (Main.panel.dateMenu && child === Main.panel.dateMenu.container) {
                    continue;
                }
                if (child.get_parent() === centerBox) { 
                    centerBox.remove_child(child);
                    leftBox.add_child(child);
                    log(`Moved extra item from center box to left box.`);
                }
            }
        }
    }

    _resetPanelItemsPosition() {
        log('Resetting panel item positions (may require extension re-enable).');
    }
}
