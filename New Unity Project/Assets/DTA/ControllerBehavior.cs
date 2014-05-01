using UnityEngine;
using System.Collections;

public class ControllerBehavior : MonoBehaviour {
	public int
		Player;
	private string 
		CameraPanLeftMessage,
		CameraPanRightMessage,
		CameraPanUpMessage,
		CameraPanDownMessage,
		CameraZoomInMessage,
		CameraZoomOutMessage;
	private KeyCode
		CameraPanLeftKey,
		CameraPanRightKey,
		CameraPanUpKey,
		CameraPanDownKey,
		CameraZoomInKey,
		CameraZoomOutKey;

	/*DTA perhaps help? 
	 * 
	 *   BURGZERG TUTORIAL 89 & 90!!!!!
	 * 
	 *   http://wiki.etc.cmu.edu/unity3d/index.php/Joystick/Controller
	 * 
	 *   http://docs.unity3d.com/Documentation/Manual/Input.html
	 */ 

	// Use this for initialization
	void Start () {
		this.Player = 1;

		// Broadcast messages
		if(this.Player == 1){
			this.CameraPanLeftMessage = "Controller: Player 1: Camera Pan Left";
			this.CameraPanRightMessage = "Controller: Player 1: Camera Pan Right";
			this.CameraPanUpMessage = "Controller: Player 1: Camera Pan Up";
			this.CameraPanDownMessage = "Controller: Player 1: Camera Pan Down";
			this.CameraZoomInMessage = "Controller: Player 1: Camera Zoom In";
			this.CameraZoomOutMessage = "Controller: Player 1: Camera Zoom Out";
		}
		else if(this.Player == 2){
			this.CameraPanLeftMessage = "Controller: Player 2: Camera Pan Left";
			this.CameraPanRightMessage = "Controller: Player 2: Camera Pan Right";
			this.CameraPanUpMessage = "Controller: Player 2: Camera Pan Up";
			this.CameraPanDownMessage = "Controller: Player 2: Camera Pan Down";
			this.CameraZoomInMessage = "Controller: Player 2: Camera Zoom In";
			this.CameraZoomOutMessage = "Controller: Player 2: Camera Zoom Out";
		}

		// Keys
		this.CameraPanLeftKey = KeyCode.LeftArrow;
		this.CameraPanRightKey = KeyCode.RightArrow;
		this.CameraPanUpKey = KeyCode.UpArrow;
		this.CameraPanDownKey = KeyCode.DownArrow;
		this.CameraZoomInKey = KeyCode.PageDown;
		this.CameraZoomOutKey = KeyCode.PageUp;
	}
	
	// Update is called once per frame
	void Update () {
		if (Input.GetKey (this.CameraPanLeftKey)) {
			Messenger.Broadcast (this.CameraPanLeftMessage);
		}
		if (Input.GetKey (this.CameraPanRightKey)) {
			Messenger.Broadcast (this.CameraPanRightMessage);
		}
		if (Input.GetKey (this.CameraPanUpKey)) {
			Messenger.Broadcast (this.CameraPanUpMessage);
		}
		if (Input.GetKey (this.CameraPanDownKey)) {
			Messenger.Broadcast (this.CameraPanDownMessage);
		}
		if (Input.GetKey (this.CameraZoomInKey)) {
			Messenger.Broadcast (this.CameraZoomInMessage);
		}
		if (Input.GetKey (this.CameraZoomOutKey)) {
			Messenger.Broadcast (this.CameraZoomOutMessage);
		}
	}

}
//*** If you put the broadcasts in a different function, like OnGUI(), then it screws with the speed. Update() is called once per frame so always use that! It makes speed consistent!!!
