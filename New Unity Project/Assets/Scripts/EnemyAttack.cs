using UnityEngine;
using System.Collections;

public class EnemyAttack : MonoBehaviour {
	public GameObject target; 
	public float attackTimer;
	public float attackCoolDown;
	
	// Use this for initialization
	void Start () {
		attackTimer = 0;
		attackCoolDown = 2.0f; // 2 seconds
	}
	
	// Update is called once per frame
	void Update () {
		if (attackTimer > 0) {
			attackTimer -= Time.deltaTime;
		}
		if (attackTimer < 0) {
			attackTimer = 0;
		}
		if(attackTimer == 0){ // <-- NO KEY PRESS JUST TIME!
			Attack();
			// After successful swing, set cool down so you can't hit 
			// as fast as you can press the attack key
			attackTimer = attackCoolDown;
		}	
	}
	
	private void Attack(){
		float distance = Vector3.Distance (target.transform.position, transform.position);

		// We've decided a distance of 2.5 or less is good for melee attack
		if (distance > 2.5F) { // Put F at end of decimal FLOAT value
			return;
		}
		
		// Make sure we're facing the evil cube
		// -- Take the direction he's in and I'm in, and create vector and make it 1 unit long
		Vector3 dir = (target.transform.position - transform.position).normalized;
		// -- Dot product. transform.forward is 1 unit forward.
		float direction = Vector3.Dot (dir, transform.forward);

		// Enemy is behind us so quit
		if (direction <= 0) {
			return;
		}

		PlayerHealth eh = (PlayerHealth)target.GetComponent ("PlayerHealth");
		eh.AdjustCurrentHealth (-10);
	}
}
