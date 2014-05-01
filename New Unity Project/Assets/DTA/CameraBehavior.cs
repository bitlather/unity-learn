using UnityEngine;
using System.Collections;

/*
 * A Warcraft 3 esque camera.
 * Our camera is an angled top-down view where some minor adjustments can be made.
 * If the camera is rotated then Vector3.back and Vector3.forward will move with 
 *   respect to the rotation.
 * So, we create a cube "cursor" with no rotation that moves around.
 * The camera follows the cube, so rotation does not impact forward and backward movement.
 */
public class CameraBehavior : MonoBehaviour {
	private int Speed = 3;
	private GameObject Cursor;
	private Camera PlayerCamera;

	private const int 
		MaxPositionY = 7,
		MinPositionY = 2,
		MinRotationX = 15,
		MaxRotationX = 75;

	public void Initiate(int playerNumber, int numberOfPlayers){
		// Create cursor
		this.Cursor = GameObject.CreatePrimitive (PrimitiveType.Cube);

		// Make cursor invisible
		this.Cursor.renderer.enabled = false;

		// Create another game object to attach camera to so angle does not get wonky
		GameObject cameraAngleCursor = GameObject.CreatePrimitive (PrimitiveType.Cube);
		cameraAngleCursor.renderer.enabled = false;

		// Initialize camera
		this.PlayerCamera = (Camera)cameraAngleCursor.AddComponent(typeof(Camera));

		if (playerNumber == 1) {
			Messenger.AddListener ("Controller: Player 1: Camera Pan Left", OnCameraPanLeft); //*DTA need to update AddListener or create a wrapper that whitelists listeners by name to make failures easier to find
			Messenger.AddListener ("Controller: Player 1: Camera Pan Right", OnCameraPanRight);
			Messenger.AddListener ("Controller: Player 1: Camera Pan Up", OnCameraPanUp);
			Messenger.AddListener ("Controller: Player 1: Camera Pan Down", OnCameraPanDown);
			Messenger.AddListener ("Controller: Player 1: Camera Zoom In", OnCameraZoomIn);
			Messenger.AddListener ("Controller: Player 1: Camera Zoom Out", OnCameraZoomOut);
		}

		// Set viewport rect and camera name
		if(numberOfPlayers == 1 && playerNumber == 1){
			this.Cursor.name = "Camera.Cursor.Player1";
			this.PlayerCamera.rect = new Rect(0, 0, 1, 1);
			cameraAngleCursor.name = "Camera.Cursor.Angle.Player1";
		}
		else if (numberOfPlayers == 2 && playerNumber == 1){
			this.Cursor.name = "Camera.Cursor.Player1";
			this.PlayerCamera.rect = new Rect(0, 0, 0.5F, 1);
			cameraAngleCursor.name = "Camera.Cursor.Angle.Player1";
		}
		else if (numberOfPlayers == 2 && playerNumber == 2){
			this.Cursor.name = "Camera.Cursor.Player2";
			this.PlayerCamera.rect = new Rect(0.5F, 0, 0.5F, 1);
			cameraAngleCursor.name = "Camera.Cursor.Angle.Player2";
		}
		else {
			Debug.LogError ("Can't handle number of players or player number");
		}

		// Set cursor position
		this.Cursor.transform.position = new Vector3 (0, MaxPositionY, 0);

		// Set camera angle
		this.PlayerCamera.transform.Rotate (
			MaxRotationX,
			0, 
			0);
		
		// Glue camera to cursor on load
		this.PlayerCamera.transform.position = this.Cursor.transform.position;
	}

	void Start () {

	}
	
	// Update is called once per frame
	void Update () {
/*
		bool isMoving = false;
		if (Input.GetKey (KeyCode.UpArrow)) {
			this.Cursor.transform.Translate(Vector3.forward * this.Speed * Time.deltaTime);
			isMoving = true;
		}
		if (Input.GetKey (KeyCode.DownArrow)) {
			this.Cursor.transform.Translate(Vector3.back * this.Speed * Time.deltaTime);
			isMoving = true;
		}
		if (Input.GetKey (KeyCode.LeftArrow)) {
			this.Cursor.transform.Translate(Vector3.left * this.Speed * Time.deltaTime);
			isMoving = true;
		}
		if (Input.GetKey (KeyCode.RightArrow)) {
			this.Cursor.transform.Translate(Vector3.right * this.Speed * Time.deltaTime);
			isMoving = true;
		}
		if (Input.GetKey (KeyCode.PageDown) && this.Cursor.transform.position.y >= MinPositionY) {
			this.Cursor.transform.Translate (Vector3.down * (this.Speed / 2) * Time.deltaTime);
			this.Cursor.transform.Translate (Vector3.back * (this.Speed / 2) * Time.deltaTime);
			SetCameraAngle();
			isMoving = true;
		}
		if (Input.GetKey (KeyCode.PageUp) && this.Cursor.transform.position.y <= MaxPositionY) {
			this.Cursor.transform.Translate (Vector3.up * (this.Speed / 2) * Time.deltaTime);
			this.Cursor.transform.Translate (Vector3.forward * (this.Speed / 2) * Time.deltaTime);
			SetCameraAngle();
			isMoving = true;
		}
		if (isMoving) {
			// Move camera if cursor moved
			// *DTA surely there is a way to set what the camera targets so we don't have to move it like this?
			this.PlayerCamera.transform.position = this.Cursor.transform.position;
		}
*/
	}

	
	
	public void OnCameraPanLeft(){
		this.Cursor.transform.Translate(Vector3.left * this.Speed * Time.deltaTime);
		MoveCamera ();
	}

	public void OnCameraPanRight(){
		this.Cursor.transform.Translate(Vector3.right * this.Speed * Time.deltaTime);
		MoveCamera ();
	}

	public void OnCameraPanUp(){
		this.Cursor.transform.Translate(Vector3.forward * this.Speed * Time.deltaTime);
		MoveCamera ();
	}

	public void OnCameraPanDown(){
		this.Cursor.transform.Translate(Vector3.back * this.Speed * Time.deltaTime);
		MoveCamera ();
	}

	public void OnCameraZoomIn(){
		if(this.Cursor.transform.position.y <= MinPositionY){
			return;
		}
		this.Cursor.transform.Translate (Vector3.down * (this.Speed / 2) * Time.deltaTime);
		this.Cursor.transform.Translate (Vector3.back * (this.Speed / 2) * Time.deltaTime);
		SetCameraAngle();
		MoveCamera ();
	}

	public void OnCameraZoomOut(){
		if(this.Cursor.transform.position.y >= MaxPositionY){
			return;
		}
		this.Cursor.transform.Translate (Vector3.up * (this.Speed / 2) * Time.deltaTime);
		this.Cursor.transform.Translate (Vector3.forward * (this.Speed / 2) * Time.deltaTime);
		SetCameraAngle();
		MoveCamera ();
	}

	private void MoveCamera(){
		// *DTA surely there is a way to set what the camera targets so we don't have to move it like this?
		this.PlayerCamera.transform.position = this.Cursor.transform.position;
	}

	private void SetCameraAngle(){
		/* 
		 * Equation:
		 * 
		 *                    Current Y position - Min Y position
		 *   Position ratio = -----------------------------------
		 *                      Max Y position - Min Y position
		 *   
		 * 
		 *   Desired X rotation = 
		 *     (Max X rotation - Min X rotation)
		 *     * Position Ratio
		 *     + Min X rotation
		 */
		float positionRatio = 
			(this.Cursor.transform.position.y - MinPositionY)
			/ (MaxPositionY - MinPositionY);

		float desiredRotation = 
			(MaxRotationX - MinRotationX)
			* positionRatio
			+ MinRotationX;

		// Set absolute rotation
		this.PlayerCamera.transform.localEulerAngles = new Vector3 (
			desiredRotation, 
			0,
			0);
	}
}
//*** Input.GetKey() allows for continuous press
//*** Vector3.up|down|left|right|forward|back
//*** To make a game object invisible, do gameObjectVariable.renderer.enabled = false;
//*** gameObject.transform.localEulerAngles = new Vector3(...) --> set absolute rotation
//*** camera.Rect to set viewport
