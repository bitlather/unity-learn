using UnityEngine;
using System.Collections;
using System.Collections.Generic; // Need this for lists!

public class Targetting : MonoBehaviour {
	public List<Transform> targets;
	public Transform selectedTarget;
	private Transform myTransform;

	// Use this for initialization
	void Start () {
		targets = new List<Transform> ();
		selectedTarget = null;
		AddAllEnemies ();
		myTransform = transform; // Cache it!!!
	}

	// Update is called once per frame
	void Update () {
		if (Input.GetKeyDown (KeyCode.Tab)) {
			TargetEnemy();
		}
	}

	public void AddAllEnemies(){
		GameObject[] go = GameObject.FindGameObjectsWithTag ("Enemy");
		foreach (GameObject enemy in go) {
			AddTarget(enemy.transform);
		}
	}

	private void SortTargetsByDistance(){
		targets.Sort (delegate(Transform t1, Transform t2) {
			return (Vector3.Distance(t1.position, myTransform.position)
				.CompareTo (Vector3.Distance (t2.position, myTransform.position)));
		});
	}

	public void AddTarget(Transform enemy){
		targets.Add (enemy);
	}

	private void TargetEnemy(){
		if (selectedTarget == null) {
			// If no targets, select closest
			SortTargetsByDistance ();
			selectedTarget = targets [0];
		} else {
			int index = targets.IndexOf (selectedTarget);
			if(index < targets.Count - 1){
				index++;
			} else {
				index = 0;
			}
			DeselectTarget ();
			selectedTarget = targets[index];
		}
		SelectTarget();
	}

	public void DeselectTarget(){
		selectedTarget.renderer.material.color = Color.blue;
		selectedTarget = null;
	}

	private void SelectTarget(){
		selectedTarget.renderer.material.color = Color.red;
		PlayerAttack pa = (PlayerAttack)GetComponent ("PlayerAttack");
		pa.target = selectedTarget.gameObject;
	}
}
//***ADD SCRIPT TO PLAYER
//***CYCLE THROUGH TARGETS BASED ON WHATS CLOSEST AND CHANGE COLOR TO RED