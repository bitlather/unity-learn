Health Bar 1/2
==============

http://www.burgzergarcade.com/tutorials/game-engines/unity3d/001-unity3d-tutorial-health-bar-12

- When creating project be sure to create a 3d project
- Click `2d` button to toggle perspective between 2d and 3d
- Hold `Alt` and `click-drag` to rotate in 3d mode
- Click object. Press `F` (shift is important) to center screen on it.
- Add new C# script:

```
using UnityEngine;
using System.Collections;

public class NewBehaviourScript : MonoBehaviour {
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



Health Bar 2/2
==============

http://www.burgzergarcade.com/tutorials/game-engines/unity3d/002-unity3d-tutorial-health-bar-22

- 
