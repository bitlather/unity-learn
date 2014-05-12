using UnityEngine;
using System.Collections;

public class ControllerListener : MonoBehaviour {

	// Use this for initialization
	void Start () {
		Debug.Log("NOTICE: Edit > Project Settings > Input \nneeds to be set.");
	}
	
	// Update is called once per frame
	void Update () {
	}

	void OnGUI(){
		// Joystick 1 button 0-19
		int
			x = 10,
			y = 10,
			width = 120,
			height = 23;

		for(int i = 0; i < 19; i++){
			// GetKey seems to return things without Input Manager setup
			// GetButton requires Input Manager setup
			if(Input.GetButton("joystick 1 button "+i)){
				GUI.TextArea(new Rect(x, y, width, height), "joystick 1 button " + i);
			}
			y += height + 2;
			if((i+1) % 5 == 0){
				y = 10;
				x += width + 2;
			}
		}

		string[] axes = {
			"joystick 1 X axis",
			"joystick 1 Y axis",
			"joystick 1 3rd axis",
			"joystick 1 4th axis",
			"joystick 1 5th axis",
			"joystick 1 6th axis",
			"joystick 1 7th axis",
			"joystick 1 8th axis"};

		x = 10 + (width * 4) + 30;
		y = 10;
		width=220;

		for(int i = 0; i < axes.Length; i++){
			GUI.TextArea(new Rect(x, y, width, height), axes[i] + " = " + Input.GetAxisRaw(axes[i]));	
			y += height + 2;
			if((i+1) % 5 == 0){
				y = 10;
				x += width + 2;
			}
		}

	}
}
