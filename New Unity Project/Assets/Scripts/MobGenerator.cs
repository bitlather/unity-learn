using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class MobGenerator : MonoBehaviour {
	public enum State{
		Idle,
		Initialize,
		Setup,
		SpawnMob
	}

	public GameObject[] mobPrefabs;
	public GameObject[] spawnPoints;
	public State state;

	void Awake(){
		this.state = State.Initialize;
	}

	// Use this for initialization
	IEnumerator Start () {
		while (true) {
			switch(this.state){
			case State.Initialize:
				Initialize();
				break;
			case State.Setup:
				Setup ();
				break;
			case State.SpawnMob:
				SpawnMob ();
				break;
			}

			yield return 0; // Stop at every frame and let the rest of your application run
		}
	}

	private void Initialize(){
		Debug.Log ("*** We are in the Initialize function ***");

		if (!CheckForMobPrefabs ()) {
			return;
		}

		if (!CheckForSpawnPoints ()) {
			return;
		}

		this.state = State.Setup;
	}

	private void Setup(){
		Debug.Log ("*** We are in the Setup function ***");
		this.state = State.SpawnMob;
	}

	private void SpawnMob(){
		Debug.Log ("*** We are in the SpawnMob function ***");

		GameObject[] gos = AvailableSpawnPoints ();

		// spawn random mob
		for (int cnt = 0; cnt < gos.Length; cnt++) {
			GameObject go = Instantiate (mobPrefabs[Random.Range (0, mobPrefabs.Length)],
				gos[cnt].transform.position,
			    Quaternion.identity
			    ) as GameObject;
			go.transform.parent = gos[cnt].transform;
		}

		this.state = State.Idle;
	}

	private bool CheckForMobPrefabs(){
		if (this.mobPrefabs.Length > 0) {
			return true;
		}
		return false;
	}

	private bool CheckForSpawnPoints(){
		if (this.spawnPoints.Length > 0) {
			return true;
		}
		return false;
	}

	// generate list of available spawn points that do not have any mobs childed to it
	private GameObject[] AvailableSpawnPoints(){
		List<GameObject> gos = new List<GameObject> ();
		for (int cnt = 0; cnt < this.spawnPoints.Length; cnt++) {
			if(this.spawnPoints[cnt].transform.childCount == 0){
				Debug.Log ("*** Spawn Point Available **");
				gos.Add (this.spawnPoints[cnt]);
			}
		}
		return gos.ToArray ();
	}
}
