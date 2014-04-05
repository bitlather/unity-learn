Health Bar 1/2
==============
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/001-unity3d-tutorial-health-bar-12

- When creating project be sure to create a 3d project
- Click `2d` button in *Scene View* to toggle perspective between 2d and 3d
- Hold `Alt` and `click-drag` to rotate in 3d mode
- Click object. Press `F` (shift is important) to center screen on it.
- Add new C# script:

```
using UnityEngine;
using System.Collections;

public class PlayerHealth : MonoBehaviour {
	public int MaxHealth = 100;
	public int CurrentHealth = 100;

	// Use this for initialization
	void Start () {	}
	
	// Update is called once per frame
	void Update () { }

	void OnGUI(){
		GUI.Box(new Rect(10,10,Screen.width / 2 / (MaxHealth / CurrentHealth), 20), CurrentHealth + " / " + MaxHealth);
	}
}
```

- Click first person perspective object and drag script onto their inspector.
- Press play. You will see health bar.
- Public variables can be editted during play.


Health Bar 2/2
==============
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/002-unity3d-tutorial-health-bar-22

- Make health bar script handle division by zero and do less calculation on every frame
- `OnGUI()` function draws something on the screen every frame. Try to minimize computation in this function.
- Script's name must match class name (at least, for C# scripts)

```
using UnityEngine;
using System.Collections;

public class PlayerHealth : MonoBehaviour {
	public int MaxHealth = 100;
	public int CurrentHealth = 100;
	public float HealthBarLength;

	// Use this for initialization
	void Start () {
		HealthBarLength = Screen.width / 2;
	}
	
	// Update is called once per frame
	void Update () {
		AdjustCurrentHealth(0); // Force it to be called every frame for now so we can adjust values while playing
	}

	void OnGUI(){
		GUI.Box(new Rect(10,10,HealthBarLength,20), CurrentHealth + " / " + MaxHealth);
	}
	
	// In later tutorial, other scripts will adjust health, so we need to make this public
	public void AdjustCurrentHealth(int amount){ // positive to heal, negative to damage
		CurrentHealth += amount;
		if(CurrentHealth < 0){ CurrentHealth = 0; }
		if(CurrentHealth > MaxHealth){ CurrentHealth = MaxHealth; }
		if(MaxHealth < 1){ MaxHealth = 1; }
		HealthBarLength = (Screen.width / 2) * (CurrentHealth / (float)MaxHealth);
	}
}
```

- Create a C# script named EnemyHealth, paste in everything we've already done, but change class name to EnemyHealth. Make it appear below the player health box by editing `OnGui()` and associate it with the enemy cube.


Enemy AI 1/2, 2/2
=================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/003-unity3d-tutorial-enemy-ai-12
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/004-unity3d-tutorial-enemy-ai-22

- Use `Debug.DrawLine()` to draw a line between two objects in the wireframe viewer
- Use tags in Unity's UI to quickly look up important objects
- You can create tags in Unity's UI and then assign them to whatever object you want
- `transform` is the position, rotation, etc of the object the script is attached to. It is magically available for your use, but should be cached to speed things up.
- Create this script and drag it onto enemy cube object:

```
using UnityEngine;
using System.Collections;

public class EnemyAI : MonoBehaviour {
	public Transform target;
	public int moveSpeed;
	public int rotationSpeed;

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

		// Move towards target
		myTransform.position += myTransform.forward * moveSpeed * Time.deltaTime;
	}
}
```

- `Quaternion.Slerp()` turns something slowly.
- `Time.deltaTime` ensures that objects move and rotate at the same real-time, regardless of how fast a computer is and how many frames per second occur.


Melee Combat 1/3, 2/3, 3/3
==========================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/005-unity3d-tutorial-melee-combat-13
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/006-unity3d-tutorial-melee-combat-23
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/006-unity3d-tutorial-melee-combat-33

We will build a system for player to be able to melee strike the enemy when the enemy is close and in front of the player. Additionally, there is a cool down associated with an attack, so that player cannot simply attack as fast as they can hit a key.

We will also make the enemy melee attack the hero and improve enemy's movements so that the enemy doesn't move into the exact same pixel as the player. (Collision is still possible with player movements).

- Create a C# script named PlayerAttack:

```
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
```

- In Unity UI, drop this script on the player object. In the script parameters, click and drag Evil Cube into the target.
- Go to [ Window > Console ] to view `Debug.Log()`
- `Vector.Dot()` takes the dot product, which gives a value between [-1,1]
- `Input.GetKeyUp(KeyCode.F)` to determine if `f` or `F` was pressed and released. If do `GetKeyDown()` then user can just hold in the key to fire.
- Float literals should be suffixed with f: `2.5f`
- Create another C# script, EnemyAttack, which is based mostly on PlayerAttack except it attacks based on timer - not key press - and also attacks PlayerHealth:

```
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
```

- Drag EnemyAttack script onto EvilCube and, in the target parameter, drag and drop Player so the cube will target player.

- We also need to update EnemyAI so that EvilCube will stop approaching the player when the player is in striking distance:


```
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
```


Targetting Enemies 1/1, 1/2, 1/3
================================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/008-unity3d-tutorial-targetting-enemies-13
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/009-unity3d-tutorial-targetting-enemies-23

We will create three evil cubes manually and build a targetting system that changes color of selected target.

- Click an object in Hierarchy and press `Ctrl+D` to duplicate it
- `Double click` on an object in Hierarchy to zoom in on it
- Disable evil cubes' movement script to make testing easier
- Create C# script Targetting:

```
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
```

- Add script to player
- When playing, press tab to cycle through closest enemies. Note that closeness is decided the first time tab is pressed.
- Change color of object: `selectedTarget.renderer.material.color = Color.red;`
- Manipulate values in a different script: `PlayerAttack pa = (PlayerAttack)GetComponent ("PlayerAttack"); pa.target = selectedTarget.gameObject;`
- Above script uses lists and sorting algorithm with delegates
- To get all game objects by tag: `GameObject[] go = GameObject.FindGameObjectsWithTag ("Enemy");`


Character Statistics 1/7 - 7/7
==============================
http://www.burgzergarcade.com/tutorials/game-design/011-unity3d-tutorial-character-statistics-17
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/012-unity3d-tutorial-character-statistics-27
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/013-unity3d-tutorial-character-statistics-37
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/014-unity3d-tutorial-character-statisics-47
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/015-unity3d-tutorial-character-statisics-57
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/016-unity3d-tutorial-character-statisics-67

- Create a folder in scripts called _Character Classes_
- Create C# script _Character Classes/BaseStat:_
- Create C# script _Character Classes/Attribute:_
- Create C# script _Character Classes/ModifiedStat:_
- - Create C# script _Character Classes/Vital:_
