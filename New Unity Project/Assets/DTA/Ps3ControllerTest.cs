using UnityEngine;
using System.Collections;

public class Ps3ControllerTest : MonoBehaviour {

	// Use this for initialization
	void Start () {
	}
	
	// Update is called once per frame
	void Update () {
		// http://angryant.com/2013/08/04/Unity-Hacks-Dual-sticks/ --- GOOD PS3 CONTROLLER CLASSES?
		if(Input.inputString != ""){
				Debug.Log(Input.inputString);
		}

		if(Input.GetAxisRaw("Horizontal") != 0){ // From name in Edit > Project Settings > Input
			Debug.Log("D Pad Left/Right:" + Input.GetAxisRaw("Horizontal"));
			//*DTA NOTE THAT THIS ISNT PER CONTROLLER
		}
		if(Input.GetAxisRaw("Vertical") != 0){ // From name in Edit > Project Settings > Input
			Debug.Log("D Pad Up/Down:" + Input.GetAxisRaw("Vertical"));
			//*DTA NOTE THAT THIS ISNT PER CONTROLLER
		}
		if (Input.GetKey("joystick 1 button 0")) {
			Debug.Log("^");
		}
		if (Input.GetKey("joystick 1 button 1")) {
			Debug.Log("O");
		}
		if (Input.GetKey("joystick 1 button 2")) {
			Debug.Log("X");
		}
		if (Input.GetKey("joystick 1 button 3")) {
			Debug.Log("[]");
		}
		if (Input.GetKey("joystick 1 button 4")) {
			Debug.Log("L2");
		}
		if (Input.GetKey("joystick 1 button 5")) {
			Debug.Log("R2");
		}
		if (Input.GetKey("joystick 1 button 6")) {
			Debug.Log("L1");
		}
		if (Input.GetKey("joystick 1 button 7")) {
			Debug.Log("R1");
		}
		if (Input.GetKey("joystick 1 button 8")) {
			Debug.Log("SELECT");
		}
		if (Input.GetKey("joystick 1 button 9")) {
			Debug.Log("START");
		}
		if (Input.GetKey("joystick 1 button 10")) {
			Debug.Log("L3");
		}
		if (Input.GetKey("joystick 1 button 11")) {
			Debug.Log("R3");
		}
		if (Input.GetKey("joystick 1 button 12")) {
			Debug.Log("Supposedly the home button...");
		}
		if (Input.GetKey("joystick 1 button 13")) {
			Debug.Log("13");
		}
		if (Input.GetKey("joystick 1 button 14")) {
			Debug.Log("14");
		}
		if (Input.GetKey("joystick 1 button 15")) {
			Debug.Log("15");
		}
		if (Input.GetKey("joystick 1 button 16")) {
			Debug.Log("16");
		}
		if (Input.GetKey("joystick 1 button 17")) {
			Debug.Log("17");
		}
		if (Input.GetKey("joystick 1 button 18")) {
			Debug.Log("18");
		}
		if (Input.GetKey("joystick 1 button 19")) {
			Debug.Log("19");
		}
//		if (Input.GetKey("joystick 2 button 0")) {
//			Debug.Log("joystick 2 button 0");
//		}	
	
	}
}
