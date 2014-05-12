PS3 Controller on Windows 8 with Unity
========

http://www.hardcoreware.net/how-to-use-a-ps3-controller-in-windows-8/

Tutorial and both attachments are in this directory.

How to Use a PS3 Controller in Windows 8 (and Win7) in Local Mode.htm

MotioninJoy_060003_amd64_signed.zip

motionjoy.local.0.6.0003a.Full.zip

To make changes, use application `DS3 Tool`


**IMPORTANT**

http://www.hardcoreware.net/how-to-use-a-ps3-controller-in-windows-8/

In DS3 Tool, in Local tab, set controller to PS 3 controller. To ensure things are working, click `Game Controller Panel` then `Properties`. In the screen that pops up, hit a bunch of things on the controller. Make sure all analog sticks are registered. If they aren't, restart the computer with the controller plugged in and try again.

See `MotionInJoy Settings.png` for how to set it up and `MotionInJoy game controller properties.png` for how to ensure the joysticks are working.

You will have to update Unity's input manager with more inputs to make this work. Check out the download here: http://wiki.etc.cmu.edu/unity3d/index.php/Joystick/Controller  --- note that 7th and 8th axis are the gyroscopes in the controller, and they overwrite the analog joysticks. Disable the 7th and 8th axis to see the others work. Also, as a test, create your own unity project for PS3 controllers that lists EVERY button and axis pressed - not just one of them.

**/IMPORTANT**

USING CONTROLLER: http://angryant.com/2013/08/04/Unity-Hacks-Dual-sticks/

A lot of the issues seem to come from the DS3 driver utility. Playstation 1 setting is dpad without joysticks.