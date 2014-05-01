using UnityEngine;
using System.Collections;

public class PlayerAttack : MonoBehaviour {
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
		if (Input.GetKeyUp (KeyCode.F)) {
			if(attackTimer == 0){
				Attack();
				// After successful swing, set cool down so you can't hit 
				// as fast as you can press the attack key
				attackTimer = attackCoolDown;
			}
		}	
	}

	private void Attack(){
		float distance = Vector3.Distance (target.transform.position, transform.position);

		// Now play the game, turn off evil cube's movements, 
		// and find a good distance where melee is acceptable
		// Open Window > Console to see output.
		Debug.Log ("Distance: " + distance); 

		// We've decided a distance of 2.5 or less is good for melee attack
		if (distance > 2.5F) { // Put F at end of decimal FLOAT value
			return;
		}

		// Make sure we're facing the evil cube
		// -- Take the direction he's in and I'm in, and create vector and make it 1 unit long
		Vector3 dir = (target.transform.position - transform.position).normalized;
		// -- Dot product. transform.forward is 1 unit forward.
		float direction = Vector3.Dot (dir, transform.forward);
		// -- Check the direction --- -1 if enemy is behind, 1 if ahead, and 0 if on left or right
		Debug.Log ("Direction: " + direction);

		// Enemy is behind us so quit
		if (direction <= 0) {
			return;
		}



		EnemyHealth eh = (EnemyHealth)target.GetComponent ("EnemyHealth");
		eh.AdjustCurrentHealth (-10);
	}
}

//*** ALSO HAVE ENEMY ATTACK SCRIPT!!! MOSTLY COPY AND PASTE JOB. Have to drag onto evil cube and assign target as player. And change reference from EnemyHealth to PlayerHealth
//*** WE HAVE TO FIX ENEMY AI SO IT DOESNT JUST SPIN AROUND US... WITHOUT UPDATING ENEMY AI THEN IT CAN'T HIT US MULTIPLE TIMES