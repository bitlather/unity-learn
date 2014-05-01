using UnityEngine;
using System.Collections;

public class EnemyAI : MonoBehaviour {
	public Transform target;
	public int moveSpeed;
	public int rotationSpeed;
	public int maxDistance; // If enemy is closer than this, then he will stop moving towards player.

	private Transform myTransform;

	void Awake(){ // This is called before everything else
		// Cache transform so it's much faster.
		// "transform" is the transform of the object.
		myTransform = transform;
	}

	// Use this for initialization
	void Start () {
		// Select player in Unity's UI and see the "tag" attribute. Set it to "Player".
		GameObject go = GameObject.FindGameObjectWithTag("Player");
		target = go.transform;
		rotationSpeed = 5;
		moveSpeed = 3;

		maxDistance = 2;
	}
	
	// Update is called once per frame
	void Update () {
		Debug.DrawLine (target.position, myTransform.position, Color.yellow);

		// Look at target. 
		// Quaternion slerp turns slowly.
		// Time.deltaTime makes sure all systems, no matter how many frames per second possible, will turn at same human time.
		myTransform.rotation = Quaternion.Slerp (
			myTransform.rotation, 
			Quaternion.LookRotation(target.position - myTransform.position),
			rotationSpeed * Time.deltaTime);

		if (Vector3.Distance (target.position, myTransform.position) > maxDistance) {
			// Move towards target
			myTransform.position += myTransform.forward * moveSpeed * Time.deltaTime;
		}
	}
}
