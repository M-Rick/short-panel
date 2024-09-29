A simple Gnome Shell Extension to resize the Top Panel and give it transparency.

This extension has absolutely no settings at all to make it as simple as possible in order to maintain compatibility with further Gnome updates. You can tweak the transparency and the size of the Gnome Panel manually by editing the code and the CSS.

The extension will customize the panel height and length sizes, the icons size and the button padding. The code will change the panel only under X11. In Wayland mode, only the custom CSS will be used.

It is completely stable, I use it daily and had no crash. It can be done using Budgie Panel instead, but it is unstable and can crash sometimes.

# How to use

First, you need to install Just Perfection Gnome Shell extension. I'll try to remove it in a next update.

https://extensions.gnome.org/extension/3843/just-perfection/


Download ShortPanel and place it in `~/.local/share/gnome-shell/extensions`.

Enable the extension with `gnome-extensions enable short-panel@yourdomain.com`.

You can adjust the size of the panel by editing the `extension.js` file in the extension.
Just change the size at this line `panelWidth = 480 * scalingFactor;`. You can change 480 to something bigger or smaller. For example, if you use a 200% upscale, you should set the size to 700 `panelWidth = 700 * scalingFactor;`.

#### XFCE4

We get the global menu by using XFCE4.

`sudo apt install -y xfce4-panel xfce4-appmenu-plugin`.

Autostart XFCE4 Panel at login.

```
echo "[Desktop Entry]
Type=Application
Exec=/bin/xfce4-panel
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=XFCE4
Comment=" > ~/.config/autostart/xfce4-panel.desktop
```

Eventually, you can configure the appmenu plugin.

```
wget https://upload.wikimedia.org/wikipedia/commons/7/7b/Ubuntu-logo-no-wordmark-solid-o-2022.svg
mv Ubuntu-logo-no-wordmark-solid-o-2022.svg ~/.config/xfce4
echo "<?xml version="1.0" encoding="UTF-8"?>

<channel name="xfce4-panel" version="1.0">
  <property name="configver" type="int" value="2"/>
  <property name="panels" type="array">
    <value type="int" value="1"/>
    <property name="dark-mode" type="bool" value="true"/>
    <property name="panel-1" type="empty">
      <property name="position" type="string" value="p=6;x=840;y=15"/>
      <property name="length" type="double" value="100"/>
      <property name="position-locked" type="bool" value="true"/>
      <property name="icon-size" type="uint" value="0"/>
      <property name="size" type="uint" value="30"/>
      <property name="plugin-ids" type="array">
        <value type="int" value="1"/>
        <value type="int" value="2"/>
        <value type="int" value="3"/>
        <value type="int" value="4"/>
      </property>
      <property name="mode" type="uint" value="0"/>
      <property name="background-style" type="uint" value="1"/>
      <property name="background-rgba" type="array">
        <value type="double" value="0"/>
        <value type="double" value="0"/>
        <value type="double" value="0"/>
        <value type="double" value="0.65000000000000002"/>
      </property>
    </property>
  </property>
  <property name="plugins" type="empty">
    <property name="plugin-1" type="string" value="separator">
      <property name="expand" type="bool" value="false"/>
      <property name="style" type="uint" value="0"/>
    </property>
    <property name="plugin-2" type="string" value="applicationsmenu">
      <property name="show-button-title" type="bool" value="false"/>
      <property name="custom-menu" type="bool" value="false"/>
      <property name="button-icon" type="string" value="~/.config/xfce4/Ubuntu-logo-no-wordmark-solid-o-2022.svg"/>
      <property name="show-tooltips" type="bool" value="false"/>
      <property name="small" type="bool" value="false"/>
    </property>
    <property name="plugin-3" type="string" value="appmenu">
      <property name="plugins" type="empty">
        <property name="plugin-3" type="empty">
          <property name="compact-mode" type="bool" value="false"/>
          <property name="bold-application-name" type="bool" value="true"/>
          <property name="expand" type="bool" value="true"/>
        </property>
      </property>
    </property>
    <property name="plugin-4" type="string" value="separator">
      <property name="style" type="uint" value="0"/>
    </property>
  </property>
</channel>
" > ~/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-panel. 
```

#### Setting up Gconf.

We need some additionnal tweeking in order to get everything working.

#### Gnome extensions configuration

Ubuntu installs the Gnome Extension App Indicator and place it on the right by defaut. We need to toggle the position of the applciation indicators.

`gsettings set org.gnome.shell.extensions.appindicator tray-pos ['left'] #Toggle Workspace`

Now we need to configure Just Perfection.

```
echo "[/]
clock-menu-position=2
clock-menu-position-offset=4
panel-button-padding-size=5
panel-indicator-padding-size=4" > just-perfection
dconf load /org/gnome/shell/extensions/just-perfection/ < just-perfection
rm -f just-perfection
```

In order to get everything working, you need to restart your session.

I will make later a shell script in order to automatize all of this.


# Screenshots


![Capture d’écran du 2024-09-15 14-20-25](https://github.com/user-attachments/assets/c8e26820-1e28-4f6a-b345-523530e22efb)

![Capture d’écran du 2024-09-15 14-20-32](https://github.com/user-attachments/assets/2d74acbc-1731-429f-8ad9-6982f5cb706b)

![Capture d’écran du 2024-09-15 14-20-37](https://github.com/user-attachments/assets/5cd74a59-c4f0-4adf-85e0-e8c67dc867f9)

![Capture d’écran du 2024-09-15 14-20-47](https://github.com/user-attachments/assets/ed2e68b2-072a-41bb-a2ff-185cc4973b0c)

![Capture d’écran du 2024-09-15 14-21-02](https://github.com/user-attachments/assets/2b774e04-0994-4b25-b0f8-2b82dbcb36db)

![Capture d’écran du 2024-09-15 14-29-57](https://github.com/user-attachments/assets/b8e76416-9e09-4275-acb4-a85bb69af122)

