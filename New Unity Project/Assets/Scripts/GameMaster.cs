using UnityEngine;
using System.Collections;

public class GameMaster : MonoBehaviour {
	public GameObject playerCharacter; // The prefab w/ 3d model
	public Camera mainCamera;          // The camera that will follow player around
	public GameObject gameSettings;

	public float zOffset;
	public float yOffset;
	public float xRotationOffset;
	
	private GameObject _pc;            // Cached instantiated object

	private PlayerCharacter _pcScript;

	private Vector3 _playerSpawnPointPosition;

	// Use this for initialization
	void Start () {
		_playerSpawnPointPosition = new Vector3 (32, 3, 21); // default position for player spawn point
		GameObject go = GameObject.Find (GameSettings.PLAYER_SPAWN_POINT);
		if (go == null) {
			Debug.Log("cannot find spawn point; creating one");
			go = new GameObject(GameSettings.PLAYER_SPAWN_POINT);
			go.transform.position = _playerSpawnPointPosition;
		}

		_pc = (GameObject)Instantiate (        // Put player character in game world
			playerCharacter,  
			Vector3.zero,    // Center of world
			Quaternion.identity); // "facing straight ahead" is what author said
		_pc.name = "pc";
		_pcScript = _pc.GetComponent<PlayerCharacter>();

		_pc.transform.position = go.transform.position;

		//mainCamera.transform.position = _pc.transform.position; // Camera is on top of player character model

		zOffset = -2.5f;
		yOffset = 2.5f;
		xRotationOffset = 22.5f;

		mainCamera.transform.position = new Vector3 (
			_pc.transform.position.x,
			_pc.transform.position.y + yOffset,
			_pc.transform.position.z + zOffset);
		mainCamera.transform.Rotate (
			xRotationOffset, 
			0, 
			0);

		LoadCharacter ();
	}

	public void LoadCharacter(){
		GameObject gs = GameObject.Find ("__GameSettings");

		if (gs == null) {
			// Instantiate game settings if not set
			GameObject gs1 = Instantiate(gameSettings, Vector3.zero, Quaternion.identity) as GameObject;
			gs1.name = "__GameSettings";
		}
		GameSettings gsScript = GameObject.Find ("__GameSettings").GetComponent<GameSettings>();

		gsScript.LoadCharacterData ();
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
