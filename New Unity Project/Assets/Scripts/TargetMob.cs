using UnityEngine;
using System.Collections;
using System.Collections.Generic; // Need this for lists!

public class TargetMob : MonoBehaviour {
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
		selectedTarget.FindChild ("Name").GetComponent<MeshRenderer> ().enabled = false;
		selectedTarget = null;
	}
	
	private void SelectTarget(){
		Transform name = selectedTarget.FindChild ("Name");
		if (name == null) {
			Debug.LogError("Could not find the Name on " + selectedTarget.name);
			return;
		}
		name.GetComponent<TextMesh> ().text = selectedTarget.GetComponent<Mob> ().Name;
		name.GetComponent<MeshRenderer> ().enabled = true;
		selectedTarget.GetComponent<Mob> ().DisplayHealth ();
	}
}
