using UnityEngine;
using System.Collections;

/*
 * A Warcraft 3 esque camera.
 * Our camera is an angled top-down view where some minor adjustments can be made.
 * If the camera is rotated then Vector3.back and Vector3.forward will move with 
 *   respect to the rotation.
 * So, we create a cube "cursor" with no rotation that moves around.
 * The camera follows the cube, so rotation does not impact forward and backward movement.
 * 
 * To make from scratch:
 *   - Create prefab "Camera Prefab"
 *   - GameObject > Create Other > Camera
 *   - Drag "Camera" from hierarchy to prefab
 *   - Delete "Camera" from hierarchy
 *   - Drag this script to "Camera Prefab"
 *   - Drag "Camera Prefab" from assets to hierarchy
 */
public class OLDCameraBehavior : MonoBehaviour {
	/*
	 * 1. Created prefab
	 * 2. Dragged scene's "Main Camera" object from hierarchy onto prefab
	 * 3. Created script "CameraBehavior"
	 * 4. Clicked box next to "Mono Behavior" in the prefab's params and selected
	 *    script "CameraBehavior" (click and drag does not work)
	 * 5. Deleted "Main Camera" from hierarchy and dropped in prefab
	 */
	private GameObject Cursor;
	private int Speed = 8;
	//private Camera camera; /* RENAME camera RENAME camera */
	
	/*
	 * TRY TO REMOVE MONOBEHAVIOR
	 * TRY TO REMOVE MONOBEHAVIOR
	 * TRY TO REMOVE MONOBEHAVIOR
	 */
	
	private const int 
		MaxPositionY = 7,
		MinPositionY = 2,
		MinRotationX = 15,
		MaxRotationX = 75;
	
	public void Initiate(GameObject prefabGameObject, int playerNumber, int numberOfPlayers){
		// Create cursor
		this.Cursor = GameObject.CreatePrimitive (PrimitiveType.Cube);
		
		// Make cursor invisible
		this.Cursor.renderer.enabled = false;
		
		// Initialize camera
		//this.camera = prefabGameObject.AddComponent<Camera> ();
		
		// Set viewport rect and camera name
		if(numberOfPlayers == 1 && playerNumber == 1){
			Debug.Log("ONE PLAYER; PLAYER 1");
			this.Cursor.name = "Camera.Cursor.Player1";
			camera.rect = new Rect(0, 0, 1, 1);
		}
		else if (numberOfPlayers == 2 && playerNumber == 1){
			Debug.Log("TWO PLAYERS; PLAYER 1");
			this.Cursor.name = "Camera.Cursor.Player1";
			camera.rect = new Rect(0, 0, 0.5F, 1);
		}
		else if (numberOfPlayers == 2 && playerNumber == 2){
			Debug.Log("TWO PLAYERS; PLAYER 2");
			this.Cursor.name = "Camera.Cursor.Player2";
			camera.rect = new Rect(0.5F, 0, 0.5F, 1);
		}
		else {
			Debug.LogError ("Can't handle number of players or player number");
		}
		
		// Set cursor position
		this.Cursor.transform.position = new Vector3 (0, MaxPositionY, 0);
		
		// Set camera angle
		camera.transform.Rotate (
			MaxRotationX,
			0, 
			0);
		
		// Glue camera to cursor on load
		camera.transform.position = this.Cursor.transform.position;
	}
	
	void Start () {
		
	}
	
	// Update is called once per frame
	void Update () {
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
			this.camera.transform.position = this.Cursor.transform.position;
		}
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
		camera.transform.localEulerAngles = new Vector3 (
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