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
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}

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
	
	void AdjustCurrentHealth(int amount){ // positive to heal, negative to damage
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


Melee Combat 1/3
================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/005-unity3d-tutorial-melee-combat-13
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/006-unity3d-tutorial-melee-combat-23
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/006-unity3d-tutorial-melee-combat-33
