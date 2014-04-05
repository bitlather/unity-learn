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
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/017-unity3d-tutorial-character-statisics-77

I find the inheritance set up in the tutorial confusing and the statistics a bit too simplistic, but I think it's necessary to continue in the tutorials, so code is here.

- Create a folder in scripts called _Character Classes_
- Create C# script _Character Classes/BaseStat:_

```
public class BaseStat {
	private int _baseValue;       // The base value of this stat; goes up 1 on each level up
	private int _buffValue;       // Amount of the buff to this stat
	private int _expToLevel;      // Total amount of exp needed to raise this skill
	private float _levelModifier; // How much experience will be needed for the following level to be achieved

	public BaseStat(){
		_baseValue = 0;
		_buffValue = 0;
		_expToLevel = 100;
		_levelModifier = 1.1f;
		// First level takes 100 exp; next level takes (100*1.1 = 110), etc
	}

	private int CalcuateExpToLevel(){
		return (int)(_expToLevel * _levelModifier);
	}

	public void LevelUp(){
		_expToLevel = CalcuateExpToLevel ();
		_baseValue++;
	}

	public int AdjustedBaseValue{
		get { return _baseValue + _buffValue; }
	}

#region Basic setters and getters
	public int BaseValue {
		get{ return _baseValue; }
		set{ _baseValue = value; }
	}
	public int BuffValue {
		get{ return _buffValue; }
		set{ _buffValue = value; }
	}
	public int ExpToLevel {
		get{ return _expToLevel; }
		set{ _expToLevel = value; }
	}
	public float LevelModifier {
		get{ return _levelModifier; }
		set{ _levelModifier = value; }
	}
#endregion
}
```

- Note how getters and setters work in C#

- Create C# script _Character Classes/Attribute:_

```
public class Attribute : BaseStat{
	public Attribute(){
		ExpToLevel = 50;
		LevelModifier = 1.05f;
	}
}

public enum AttributeName {
	Might,
	Constitution,
	Nimbleness,
	Speed,
	Concentration,
	Willpower,
	Charisma
}
```

- Note how enums are created in C#

- Create C# script _Character Classes/ModifiedStat:_

```
using System.Collections.Generic;

public class ModifiedStat : BaseStat{
	private List<ModifyingAttribute> _mods;   // A list of attributes that modify the stat
	private int _modValue;                    // Amount added to base value of modifiers

	public ModifiedStat(){
		_mods = new List<ModifyingAttribute> ();
		_modValue = 0;
	}

	public void AddModifier(ModifyingAttribute mod){
		_mods.Add (mod);
	}

	private void CalculateModValue(){
		_modValue = 0;
		if (_mods.Count > 0) {
			foreach (ModifyingAttribute att in _mods) {
				_modValue += (int)(att.attribute.AdjustedBaseValue * att.ratio);
			}
		}
	}

	public new int AdjustedBaseValue{
		get{ return BaseValue + BuffValue + _modValue; }
	}

	public void Update(){
		CalculateModValue ();
	}
}

public struct ModifyingAttribute{
	public Attribute attribute;
	public float ratio;
}
```

- Note how to override a getter/setter in C# using _new_ keyword

- Create C# script _Character Classes/Vital:_

```
public class Vital : ModifiedStat {
	private int _curValue;

	public Vital(){
		_curValue = 0;
		ExpToLevel = 50;
		LevelModifier = 1.1f;
	}

	public int CurrentValue{
		get{ 
			if(_curValue > AdjustedBaseValue){
				// Don't let current value exceed maximum value
				_curValue = AdjustedBaseValue;
			}
			return _curValue;
		}
		set{ _curValue = value; }
	}
}

public enum VitalName{
	Health,
	Energy,
	Mana
}
```

- Create C# script _Character Classes/Skill:_

```
public class Skill : ModifiedStat {
	private bool _known;

	public Skill(){
		_known = false;
		ExpToLevel = 25;
		LevelModifier = 1.1f;
	}

	public bool Known{
		get{ return _known;}
		set{_known = value;}
	}
}

public enum SkillName {
	// Could be Mace, Shield, etc... we're keeping it simple
	Melee_Offense,
	Melee_Defense,
	Ranged_Offense,
	Ranged_Defense,
	Magic_Offense,
	Magic_Defense
}
```

Base Character Class 1/3 - 3/3
==============================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/018-unity3d-tutorial-base-character-class-13
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/019-unity3d-tutorial-base-character-class-23
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/020-unity3d-tutorial-base-character-class-33

Not a fan of this code but it's needed to move on in the tutorial.

- Create C# script _CharacterClasses/BaseCharacter:_

```
using UnityEngine;
using System.Collections;
using System;               // <-- So can quickly access enum class

public class BaseCharacter : MonoBehaviour {
	private string _name;
	private int _level;
	private uint _freeExp;

	private Attribute[] _primaryAttribute;
	private Vital[] _vital;
	private Skill[] _skill;

	public void Awake(){
		_name = string.Empty;
		_level = 0;
		_freeExp = 0;

		// Make array the same size as number of items in Enum
		_primaryAttribute = new Attribute[Enum.GetValues (typeof(AttributeName)).Length];
		_vital = new Vital[Enum.GetValues (typeof(VitalName)).Length];
		_skill = new Skill[Enum.GetValues (typeof(SkillName)).Length];

		SetupPrimaryAttributes ();
		SetupVitals ();
		SetupSkills ();
	}

	public string Name{
		get{ return _name; }
		set{ _name = value;}
	}

	public int Level{
		get{ return _level; }
		set{ _level = value;}
	}

	public uint FreeExp{
		get{ return _freeExp; }
		set{ _freeExp = value;}
	}

	public void AddExp(uint exp){
		_freeExp += exp;
		CalculateLevel ();
	}

	public void CalculateLevel(){
		//TODO Take the average of all the player's skills and assign that as player level	
	}

	private void SetupPrimaryAttributes(){
		for (int cnt = 0; cnt < _primaryAttribute.Length; cnt++) {
			_primaryAttribute[cnt] = new Attribute();
		}
	}

	private void SetupVitals(){
		for (int cnt = 0; cnt < _vital.Length; cnt++) {
			_vital[cnt] = new Vital();
		}
	}

	private void SetupSkills(){
		for (int cnt = 0; cnt < _skill.Length; cnt++) {
			_skill[cnt] = new Skill();
		}
	}

	public Attribute GetPrimaryAttribute(int index){
		return _primaryAttribute [index];
	}
	public Vital GetVital(int index){
		return _vital [index];
	}
	public Skill GetSkill(int index){
		return _skill [index];
	}

	private void SetupVitalModifiers(){
		// THIS CODE IS PRETTY ROUGH BECAUSE HE SAID UNITY 2.X IS NOT CAPABLE OF THINGS UNITY 3.X IS CAPABLE OF
		// health --- Add half of our constitution to health
		ModifyingAttribute health = new ModifyingAttribute ();
		health.attribute = GetPrimaryAttribute ((int)AttributeName.Constitution);
		health.ratio = 0.5f; // how much of that particular attribute goes to modifying vital (half of constitution is assigned to health)

		GetVital ((int)VitalName.Health).AddModifier (health);
		GetVital ((int)VitalName.Health).AddModifier (
			new ModifyingAttribute{
				attribute = GetPrimaryAttribute((int)AttributeName.Constitution), 
				ratio = 0.5f
			}
		);

		// energy
		ModifyingAttribute energyModifier = new ModifyingAttribute ();
		energyModifier.attribute = GetPrimaryAttribute ((int)AttributeName.Constitution);
		energyModifier.ratio = 1; // how much of that particular attribute goes to modifying vital (half of constitution is assigned to health)

		GetVital ((int)VitalName.Energy).AddModifier (energyModifier);

		// mana
		ModifyingAttribute manaModifier = new ModifyingAttribute ();
		manaModifier.attribute = GetPrimaryAttribute ((int)AttributeName.Willpower);
		manaModifier.ratio = 1; // how much of that particular attribute goes to modifying vital (half of constitution is assigned to health)
		
		GetVital ((int)VitalName.Mana).AddModifier (manaModifier);
	}

	private void SetupSkillModifiers(){
		ModifyingAttribute MeleeOffenseModifier1 = new ModifyingAttribute ();
		ModifyingAttribute MeleeOffenseModifier2 = new ModifyingAttribute ();

		MeleeOffenseModifier1.attribute = GetPrimaryAttribute ((int)AttributeName.Might);
		MeleeOffenseModifier1.ratio = .33f; // --> Add third of might to melee

		MeleeOffenseModifier2.attribute = GetPrimaryAttribute ((int)AttributeName.Nimbleness);
		MeleeOffenseModifier2.ratio = .33f; // --> Add third of nimbleness to melee

		GetSkill ((int)SkillName.Melee_Offense).AddModifier (MeleeOffenseModifier1);
		GetSkill ((int)SkillName.Melee_Offense).AddModifier (MeleeOffenseModifier2);
	}

	public void StatUpdate(){
		for (int cnt = 0; cnt < _vital.Length; cnt++) {
			_vital[cnt].Update ();
		}
		for (int cnt = 0; cnt < _skill.Length; cnt++) {
			_skill[cnt].Update ();
		}
	}
}
```

- Reminder: C# has `uint`


Character Creation 1/5 - 5/5
============================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/021-unity3d-tutorial-character-creation-15
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/022-unity3d-tutorial-character-creation-25
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/023-unity3d-tutorial-character-creation-35
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/024-unity3d-tutorial-character-creation-45

- Assets with unity icons are scenes
- Create C# script _Character/PlayerCharacter:_
- Create C# script _Character/CharacterGenerator:_
- Create folder _/Assets/Scenes_
- Move old scene into scenes folder
- _File > New Scene_ then `Ctrl+S` and save as _Character Generation_. Move it to scenes folder.
- Double click a scene to make it active scene.
- Click and drag script _CharacterGenerator_ to _Main Camera_ to add it.
- Edit script _BaseCharacter_:
