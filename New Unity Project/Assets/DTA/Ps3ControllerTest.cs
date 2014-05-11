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


/*
foreach(string n in Input.GetJoystickNames()){
Debug.Log("JOYSTICK NAMES: "+n);
}
*/

		if(Input.GetAxisRaw("Horizontal") != 0){ // From name in Edit > Project Settings > Input
			Debug.Log("D Pad Left/Right:" + Input.GetAxisRaw("Horizontal"));
			//*DTA NOTE THAT THIS ISNT PER CONTROLLER
		}
		if(Input.GetAxisRaw("Vertical") != 0){ // From name in Edit > Project Settings > Input
			Debug.Log("D Pad Up/Down:" + Input.GetAxisRaw("Vertical"));
			//*DTA NOTE THAT THIS ISNT PER CONTROLLER
		}
		if (Input.GetKey(KeyCode.Joystick1Button0)) {
			Debug.Log("^");
		}
		if (Input.GetKey(KeyCode.Joystick1Button1)) {
			Debug.Log("O");
		}
		if (Input.GetKey(KeyCode.Joystick1Button2)) {
			Debug.Log("X");
		}
		if (Input.GetKey(KeyCode.Joystick1Button3)) {
			Debug.Log("[]");
		}
		if (Input.GetKey(KeyCode.Joystick1Button4)) {
			Debug.Log("L2");
		}
		if (Input.GetKey(KeyCode.Joystick1Button5)) {
			Debug.Log("R2");
		}
		if (Input.GetKey(KeyCode.Joystick1Button6)) {
			Debug.Log("L1");
		}
		if (Input.GetKey(KeyCode.Joystick1Button7)) {
			Debug.Log("R1");
		}
		if (Input.GetKey(KeyCode.Joystick1Button8)) {
			Debug.Log("SELECT");
		}
		if (Input.GetKey(KeyCode.Joystick1Button9)) {
			Debug.Log("START");
		}
		if (Input.GetKey(KeyCode.Joystick1Button10)) {
			Debug.Log("L3");
		}
		if (Input.GetKey(KeyCode.Joystick1Button11)) {
			Debug.Log("R3");
		}
		if (Input.GetKey(KeyCode.Joystick1Button12)) {
			Debug.Log("Supposedly the home button...");
		}
//		if (Input.GetKey("joystick 2 button 0")) {
//			Debug.Log("joystick 2 button 0");
//		}	
		getAxis();
	}




	void getAxis()
	{
		string currentAxis="";
		float axisInput=0;
		if(Input.GetAxisRaw("X axis")> 0.3|| Input.GetAxisRaw("X axis") < -0.3)
		{
			currentAxis = "X axis";
			axisInput = Input.GetAxisRaw("X axis");
		}
		
		if(Input.GetAxisRaw("Y axis")> 0.3|| Input.GetAxisRaw("Y axis") < -0.3)
		{
			currentAxis = "Y axis";
			axisInput = Input.GetAxisRaw("Y axis");
		}
		
		if(Input.GetAxisRaw("3rd axis")> 0.3|| Input.GetAxisRaw("3rd axis") < -0.3)
		{
			currentAxis = "3rd axis";
			axisInput = Input.GetAxisRaw("3rd axis");
		}
		
		if(Input.GetAxisRaw("4th axis")> 0.3|| Input.GetAxisRaw("4th axis") < -0.3)
		{
			currentAxis = "4th axis";
			axisInput = Input.GetAxisRaw("4th axis");
		}
		
		if(Input.GetAxisRaw("5th axis")> 0.3|| Input.GetAxisRaw("5th axis") < -0.3)
		{
			currentAxis = "5th axis";
			axisInput = Input.GetAxisRaw("5th axis");
		}
		
		if(Input.GetAxisRaw("6th axis")> 0.3|| Input.GetAxisRaw("6th axis") < -0.3)
		{
			currentAxis = "6th axis";
			axisInput = Input.GetAxisRaw("6th axis");
		}
		
		if(Input.GetAxisRaw("7th axis")> 0.3|| Input.GetAxisRaw("7th axis") < -0.3)
		{
			currentAxis = "7th axis";
			axisInput = Input.GetAxisRaw("7th axis");
		}
		
		if(Input.GetAxisRaw("8th axis") > 0.3|| Input.GetAxisRaw("8th axis") < -0.3)
		{
			currentAxis = "8th axis";
			axisInput = Input.GetAxisRaw("8th axis");
		}

		Debug.Log("AXIS INPUT: "+axisInput);
	}
}
