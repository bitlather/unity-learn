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
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/025-unity3d-tutorial-character-creation-55

_I skipped the fifth tutorial because it was just changing literals to constants. This did not interest me._

- Assets with unity icons are scenes
- Create C# script _Character/PlayerCharacter:_

```
public class PlayerCharacter : BaseCharacter {

}
```

- Create C# script _Character/CharacterGenerator:_

```
using UnityEngine;
using System.Collections;
using System;               // <-- FOR ENUM!!

public class CharacterGenerator : MonoBehaviour {
	private PlayerCharacter _toon;
	private const int STARTING_POINTS = 350;
	private const int MIN_STARTING_ATTRIBUTE_VALUE = 10;
	private const int STARTING_VALUE = 50;
	private int pointsLeft;

	// Use this for initialization
	void Start () {
		_toon = new PlayerCharacter (); // <-- This will create a warning that says cannot use 'new' keyword. Actually, you can... just not a great way of doing it. He says he will show a different method later.
		_toon.Awake ();

		pointsLeft = STARTING_POINTS;

		for (int cnt = 0; cnt < Enum.GetValues (typeof(AttributeName)).Length; cnt++) {
			_toon.GetPrimaryAttribute(cnt).BaseValue = STARTING_VALUE;
			pointsLeft -= (STARTING_VALUE - MIN_STARTING_ATTRIBUTE_VALUE);
		}
		_toon.StatUpdate ();
	}
	
	// Update is called once per frame
	void Update () {
	}

	void OnGUI(){
		DisplayName ();
		DisplayPointsLeft ();
		DisplayAttributes ();
		DisplayVitals ();
		DisplaySkills ();
	}

	private void DisplayName(){
		GUI.Label(new Rect(10, 10, 50, 25), "Name:");
		_toon.Name = GUI.TextField (new Rect (65, 10, 100, 25), _toon.Name);
	}

	private void DisplayAttributes(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(AttributeName)).Length; cnt++){
			int top = 40 + (cnt * 25);
			GUI.Label (new Rect(10, top, 100, 25), ((AttributeName)cnt).ToString ());
			GUI.Label (new Rect(115, top, 30, 25), _toon.GetPrimaryAttribute(cnt).AdjustedBaseValue.ToString());
			if(GUI.Button(new Rect(150, top, 25, 25), "-")){
				if(_toon.GetPrimaryAttribute(cnt).BaseValue > MIN_STARTING_ATTRIBUTE_VALUE){
					_toon.GetPrimaryAttribute(cnt).BaseValue--;
					pointsLeft++;
					_toon.StatUpdate ();
				}
			}
			if(GUI.Button(new Rect(180, top, 25, 25), "+")){ // <-- IF BUTTON CLICKED
				if(pointsLeft > 0){
					_toon.GetPrimaryAttribute(cnt).BaseValue++;
					pointsLeft--;
					_toon.StatUpdate ();
				}
			}
		}
	}

	private void DisplayVitals(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(VitalName)).Length; cnt++){
			int top = 40 + ((cnt+7) * 25);
			GUI.Label (new Rect(10, top, 100, 25), ((VitalName)cnt).ToString ());
			GUI.Label (new Rect(115, top, 30, 25), _toon.GetVital(cnt).AdjustedBaseValue.ToString());
		}
	}

	private void DisplaySkills(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(SkillName)).Length; cnt++){
			int top = 40 + (cnt * 25);
			GUI.Label (new Rect(250, top, 100, 25), ((SkillName)cnt).ToString ());
			GUI.Label (new Rect(355, top, 100, 25), _toon.GetSkill(cnt).AdjustedBaseValue.ToString());
		}
	}

	private void DisplayPointsLeft(){
		GUI.Label(new Rect(250, 10, 100, 25), "Points Left: "+pointsLeft);
	}
}
```

- To draw a label: `GUI.Label(new Rect(10, 10, 50, 25), "Name:");`
- To accept multiline input: `_toon.Name = GUI.TextArea (new Rect (65, 10, 100, 25), _toon.Name);`
- To accept single line input: `_toon.Name = GUI.TextField (new Rect (65, 10, 100, 25), _toon.Name);`
- To create a button and handle click event:

```
			if(GUI.Button(new Rect(180, top, 25, 25), "+")){ // <-- IF BUTTON CLICKED
				if(pointsLeft > 0){
					_toon.GetPrimaryAttribute(cnt).BaseValue++;
					pointsLeft--;
					_toon.StatUpdate ();
				}
			}
```

- Author recommends Sprite Manager, but it costs a little money so he doesn't use it in these tutorials
- Unity documentation shows how to do most things with javascript; from what I read in forums, javascript is hard to debug though.

- Create folder _/Assets/Scenes_
- Move old scene into scenes folder
- _File > New Scene_ then `Ctrl+S` and save as _Character Generation_. Move it to scenes folder.
- Double click a scene to make it active scene.
- Click and drag script _CharacterGenerator_ to _Main Camera_ to add it.
- Edit script _BaseCharacter_:

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
		SetupVitalModifiers (); // <--- ADDED FOR CHARACTER CREATION 4/5
	}

	private void SetupSkills(){
		for (int cnt = 0; cnt < _skill.Length; cnt++) {
			_skill[cnt] = new Skill();
		}
		SetupSkillModifiers (); // <--- ADDED FOR CHARACTER CREATION 4/5
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


GUI Style & GUI Skin
====================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/026-unity3d-tutorial-guistyle-guiskin

- Create a .png that is 128x32 pixels
- Right click _Hierarchy > Assets_ and click _Import New Asset_ then look for your image
- Every number in unity should probably be a power of 2. `NPOT` means `Not a power of two`. I think this has to do with images, textures, or something.
- Expand _Main Camera_, _Character Generator Script_, _My Style_, _Normal._ Click and drag the background image to the background option (@2:45). You can use Unity's GUI to change font color, etc.
- Edited script _CharacterGenerator_:

```
using UnityEngine;
using System.Collections;
using System;               // <-- FOR ENUM!!

public class CharacterGenerator : MonoBehaviour {
	private PlayerCharacter _toon;
	private const int STARTING_POINTS = 350;
	private const int MIN_STARTING_ATTRIBUTE_VALUE = 10;
	private const int STARTING_VALUE = 50;
	private int pointsLeft;

	public GUIStyle myStyle;
	public GUISkin mySkin;

	// Use this for initialization
	void Start () {
		_toon = new PlayerCharacter (); // <-- This will create a warning that says cannot use 'new' keyword. Actually, you can... just not a great way of doing it. He says he'll show a different method later.
		_toon.Awake ();

		pointsLeft = STARTING_POINTS;

		for (int cnt = 0; cnt < Enum.GetValues (typeof(AttributeName)).Length; cnt++) {
			_toon.GetPrimaryAttribute(cnt).BaseValue = STARTING_VALUE;
			pointsLeft -= (STARTING_VALUE - MIN_STARTING_ATTRIBUTE_VALUE);
		}
		_toon.StatUpdate ();
	}
	
	// Update is called once per frame
	void Update () {
	}

	void OnGUI(){
		GUI.skin = mySkin;
		DisplayName ();
		DisplayPointsLeft ();
		DisplayAttributes ();
		DisplayVitals ();
		DisplaySkills ();
	}

	private void DisplayName(){
		GUI.Label(new Rect(10, 10, 50, 25), "Name:");
		_toon.Name = GUI.TextField (new Rect (65, 10, 100, 25), _toon.Name);
	}

	private void DisplayAttributes(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(AttributeName)).Length; cnt++){
			int top = 40 + (cnt * 25);
			GUI.Label (new Rect(10,  // X
			                    top, // Y
			                    100, // WIDTH
			                    25   // HEIGHT
				), ((AttributeName)cnt).ToString (), 
			           myStyle  // <-- GUIStyle & GUI.skin --- use the background image!
			    );

			GUI.Label (new Rect(115, top, 30, 25), _toon.GetPrimaryAttribute(cnt).AdjustedBaseValue.ToString());
			if(GUI.Button(new Rect(150, top, 25, 25), "-")){
				if(_toon.GetPrimaryAttribute(cnt).BaseValue > MIN_STARTING_ATTRIBUTE_VALUE){
					_toon.GetPrimaryAttribute(cnt).BaseValue--;
					pointsLeft++;
					_toon.StatUpdate ();
				}
			}
			if(GUI.Button(new Rect(180, // <-- IF BUTTON CLICKED
			                       top, 
			                       25, 
			                       25
			    ), "+",
			   		myStyle  // <-- GUIStyle & GUI.skin --- use the background image!
			   	)){
				if(pointsLeft > 0){
					_toon.GetPrimaryAttribute(cnt).BaseValue++;
					pointsLeft--;
					_toon.StatUpdate ();
				}
			}
		}
	}

	private void DisplayVitals(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(VitalName)).Length; cnt++){
			int top = 40 + ((cnt+7) * 25);
			GUI.Label (new Rect(10, top, 100, 25), ((VitalName)cnt).ToString ());
			GUI.Label (new Rect(115, top, 30, 25), _toon.GetVital(cnt).AdjustedBaseValue.ToString());
		}
	}

	private void DisplaySkills(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(SkillName)).Length; cnt++){
			int top = 40 + (cnt * 25);
			GUI.Label (new Rect(250, top, 100, 25), ((SkillName)cnt).ToString ());
			GUI.Label (new Rect(355, top, 100, 25), _toon.GetSkill(cnt).AdjustedBaseValue.ToString());
		}
	}

	private void DisplayPointsLeft(){
		GUI.Label(new Rect(250, 10, 100, 25), "Points Left: "+pointsLeft);
	}
}
```

- `GUIStyle` for styling a single form element.
- `GUISkin` for styling all form elements. @8:00, Creating and using them. I don't intend to use GUI elements so I did not take notes. Basically, a skin changes the appearance of every single button, text area, etc. Although... may be nice for labels and speech. Something to think about.


Player Prefs 1/7 - 7/7
======================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/027-unity3d-tutorial-playerprefs-1x
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/028-unity3d-tutorial-playerprefs-2x
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/029-unity3d-tutorial-playerprefs-3x
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/030-unity3d-tutorial-playerprefs-4x
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/031-unity3d-tutorial-playerprefs-5x
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/032-unity3d-tutorial-playerprefs-6x

This section discusses how to save player data, how to make prefabs (which are super important for generating enemies, etc, via code!!!), how to make game objects persist between scenes, how to load objects via code, how to move between scenes, how to pick the very first scene that loads on game start.

- `DontDestroyOnLoad (this);` --> Don't destroy this object (script)! When change scene to scene, the object survives so data is still accessible!!!

- `PlayerPrefs` is a unity class that saves player preference data to file
- `PlayerPrefs.SetString(key, value);` saves player's preference data. See manual for where data is saved if interested.
- `PlayerPrefs.DeleteAll ();` removes everything from PlayerPrefs; seems to be necessary... he encountered some caching issue

- `//Todo` creates todos which can be listed at the bottom of mono developer

- Go to _Character Generator_ scene
- Click _Game Object > Create Empty_ and name it *__Game Settings*
- Drag _GameSettings_ script onto *__GameSettings* game object
- _Game Object > Create Empty_ and zero everything out on Transform by using reset and name it _Player Character_ and attach _PlayerCharacter_ script to the object

- Create folder _Prefabs_ and right click folder and select _Create > Prefab_ then rename the prefab to _Player Character Prefab._
- A prefab is a blueprint for creating game objects. You can select the prefab and drop it into scene's hierarchy.
- Click and drag _Player Character_ game object from the hierarchy onto the new prefab. Notice the _Player Character_ game object in hierarchy now has blue text and the prefab now has a blue cube icon. Delete the _Player Character_ game object from hierarchy.
- Earlier we added `public GameObject playerPrefab;` to script _CharacterGenerator._ In Unity, click _Main Camera) and look at _Character Generator (Script)._ Click and drag the player prefab onto the player prefab parameter.



- `Screen.width` returns width of screen
- `GameObject.Find()` can be used to get a game object by name. `GetComponent()` can get a script, etc,  from the game object.
- `Application.LoadLevel()` can load a scene by name, given that the scene has been added to `File > Build Settings > Scenes in Build`.
- You can style a label like a button to make a disabled button: `GUI.Label (new Rect (...), "Create", "Button");`

- To create an object via code:

```
Instantiate ( // when function is called, it creates the game object (you will see it in Hierarchy pane)
	playerPrefab,         // The prefab
	Vector3.zero,         // (0,0,0)
	Quaternion.identity); // Direction parent is in
```

- To create an object via code and modify the object, such as it's name in the hierarchy pane:

```
GameObject pc = 
	Instantiate (
		playerPrefab,         // The prefab
		Vector3.zero,         // (0,0,0)
		Quaternion.identity) // Direction parent is in
			as GameObject; // as can be used for type casting

pc.name = "pc"; // Change name of game object in hierarchy pane
```

- You can use `as` in C# to typecast
- We can get rid of the warning form using 'new' when instantiated player character in script _CharacterGenerator:_

```
// OLD CODE (throws warnings!) -----
_toon = new PlayerCharacter (); // <-- This will create a warning that says cannot use 'new' keyword. Actually, you can... just not a great way of doing it. He says he'll show a different method later.
_toon.Awake ();

// NEW CODE ------------------------
_toon = pc.GetComponent <PlayerCharacter> ();
```

- Create a level: _File > Build Settings_ then click and drag your scenes into the big "scenes to build" area. The scene you want to load first should be listed first. Close popup. Save project. 
 
- Create C# script _Scripts/GameSettings_:

```
using UnityEngine;
using System.Collections;
using System;                 // <-- ACCESS TO ENUM CLASS!

public class GameSettings : MonoBehaviour {

	void Awake(){
		DontDestroyOnLoad (this);
	}

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	public void SaveCharacterData(){
		GameObject pc = GameObject.Find ("pc");
		PlayerCharacter pcClass = pc.GetComponent <PlayerCharacter> ();

		PlayerPrefs.DeleteAll ();

		PlayerPrefs.SetString ("Player Name", pcClass.Name);

		// Save attribute values
		for(int cnt=0; cnt < Enum.GetValues(typeof(AttributeName)).Length; cnt++){
			PlayerPrefs.SetInt (
				((AttributeName)cnt).ToString () + " - Base Value",
				pcClass.GetPrimaryAttribute (cnt).BaseValue);

			PlayerPrefs.SetInt (
				((AttributeName)cnt).ToString () + " - Exp To Level",
				pcClass.GetPrimaryAttribute (cnt).ExpToLevel);
		}

		// Save vital values
		for(int cnt=0; cnt < Enum.GetValues(typeof(VitalName)).Length; cnt++){
			PlayerPrefs.SetInt (
				((VitalName)cnt).ToString () + " - Base Value",
				pcClass.GetVital (cnt).BaseValue);
			
			PlayerPrefs.SetInt (
				((VitalName)cnt).ToString () + " - Exp To Level",
				pcClass.GetVital (cnt).ExpToLevel);

			PlayerPrefs.SetInt (
				((VitalName)cnt).ToString () + " - Current Value",
				pcClass.GetVital (cnt).CurrentValue);

			PlayerPrefs.SetString (
				((VitalName)cnt).ToString () + " - Mods",
				pcClass.GetVital (cnt).GetModifyingAttributeString());
		}

		// Save skill values
		for(int cnt=0; cnt < Enum.GetValues(typeof(SkillName)).Length; cnt++){
			PlayerPrefs.SetInt (
				((SkillName)cnt).ToString () + " - Base Value",
				pcClass.GetSkill (cnt).BaseValue);
			
			PlayerPrefs.SetInt (
				((SkillName)cnt).ToString () + " - Exp To Level",
				pcClass.GetSkill (cnt).ExpToLevel);

			PlayerPrefs.SetString (
				((SkillName)cnt).ToString () + " - Mods",
				pcClass.GetSkill (cnt).GetModifyingAttributeString());

		}
	}

	public void LoadCharacterData(){
	}
}
```

- Edit script _CharacterGenerator:_

```
using UnityEngine;
using System.Collections;
using System;               // <-- FOR ENUM!!

public class CharacterGenerator : MonoBehaviour {
	private PlayerCharacter _toon;
	private const int STARTING_POINTS = 281;
	private const int MIN_STARTING_ATTRIBUTE_VALUE = 10;
	private const int STARTING_VALUE = 50;
	private int pointsLeft;

	public GUIStyle myStyle;
	public GUISkin mySkin;
	public GameObject playerPrefab;

	// Use this for initialization
	void Start () {
		GameObject pc = 
		Instantiate (
			playerPrefab,         // The prefab
			Vector3.zero,         // (0,0,0)
			Quaternion.identity) // Direction parent is in
				as GameObject;
		pc.name = "pc";

//		_toon = new PlayerCharacter (); // <-- This will create a warning that says cannot use 'new' keyword. Actually, you can... just not a great way of doing it. He says he'll show a different method later.
//		_toon.Awake ();
		_toon = pc.GetComponent <PlayerCharacter> ();

		pointsLeft = STARTING_POINTS;

		for (int cnt = 0; cnt < Enum.GetValues (typeof(AttributeName)).Length; cnt++) {
			_toon.GetPrimaryAttribute(cnt).BaseValue = STARTING_VALUE;
			pointsLeft -= (STARTING_VALUE - MIN_STARTING_ATTRIBUTE_VALUE);
		}
		_toon.StatUpdate ();
	}
	
	// Update is called once per frame
	void Update () {
	}

	void OnGUI(){
		GUI.skin = mySkin;
		DisplayName ();
		DisplayPointsLeft ();
		DisplayAttributes ();
		DisplayVitals ();
		DisplaySkills ();

		if(_toon.Name == "" || pointsLeft > 0){
			DisplayCreateLabel ();
		} else {
			DisplayCreateButton ();
		}
	}

	private void DisplayName(){
		GUI.Label(new Rect(10, 10, 50, 25), "Name:");
		_toon.Name = GUI.TextField (new Rect (65, 10, 100, 25), _toon.Name);
	}

	private void DisplayAttributes(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(AttributeName)).Length; cnt++){
			int top = 40 + (cnt * 25);
			GUI.Label (new Rect(10,  // X
			                    top, // Y
			                    100, // WIDTH
			                    25   // HEIGHT
				), ((AttributeName)cnt).ToString (), 
			           myStyle  // <-- GUIStyle & GUI.skin --- use the background image!
			    );

			GUI.Label (new Rect(115, top, 30, 25), _toon.GetPrimaryAttribute(cnt).AdjustedBaseValue.ToString());
			if(GUI.Button(new Rect(150, top, 25, 25), "-")){
				if(_toon.GetPrimaryAttribute(cnt).BaseValue > MIN_STARTING_ATTRIBUTE_VALUE){
					_toon.GetPrimaryAttribute(cnt).BaseValue--;
					pointsLeft++;
					_toon.StatUpdate ();
				}
			}
			if(GUI.Button(new Rect(180, // <-- IF BUTTON CLICKED
			                       top, 
			                       25, 
			                       25
			    ), "+",
			   		myStyle  // <-- GUIStyle & GUI.skin --- use the background image!
			   	)){
				if(pointsLeft > 0){
					_toon.GetPrimaryAttribute(cnt).BaseValue++;
					pointsLeft--;
					_toon.StatUpdate ();
				}
			}
		}
	}

	private void DisplayVitals(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(VitalName)).Length; cnt++){
			int top = 40 + ((cnt+7) * 25);
			GUI.Label (new Rect(10, top, 100, 25), ((VitalName)cnt).ToString ());
			GUI.Label (new Rect(115, top, 30, 25), _toon.GetVital(cnt).AdjustedBaseValue.ToString());
		}
	}

	private void DisplaySkills(){
		for(int cnt = 0; cnt < Enum.GetValues (typeof(SkillName)).Length; cnt++){
			int top = 40 + (cnt * 25);
			GUI.Label (new Rect(250, top, 100, 25), ((SkillName)cnt).ToString ());
			GUI.Label (new Rect(355, top, 100, 25), _toon.GetSkill(cnt).AdjustedBaseValue.ToString());
		}
	}

	private void DisplayPointsLeft(){
		GUI.Label(new Rect(250, 10, 100, 25), "Points Left: "+pointsLeft);
	}

	private void DisplayCreateLabel(){
		GUI.Label (new Rect (
				Screen.width / 2 - 50, // center of screen
				40 + (10 * 25),
				100,
				25
			), 
		    "Set name & use all points before continuing",
		    "Button");
	}

	private void DisplayCreateButton(){
		if (GUI.Button (new Rect (
			Screen.width / 2 - 50, // center of screen
			40 + (10 * 25),
			100,
			25
			), "Create")) {

			GameObject gs = GameObject.Find ("__GameSettings");
			GameSettings gsScript = gs.GetComponent<GameSettings>();

			// change the current value of vitals to the max modified value of that vital
			UpdateCurVitalValues();

			gsScript.SaveCharacterData();
			Application.LoadLevel ("hackandslash"); // Scene name
		}
	}

	private void UpdateCurVitalValues(){
		for (int cnt=0; cnt<Enum.GetValues (typeof(VitalName)).Length; cnt++) {
			_toon.GetVital (cnt).CurrentValue = _toon.GetVital (cnt).AdjustedBaseValue;
		}
	}

}
```

- Edit script _BaseCharacter:_

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
			_primaryAttribute[cnt].Name = ((AttributeName)cnt).ToString ();
		}
	}

	private void SetupVitals(){
		for (int cnt = 0; cnt < _vital.Length; cnt++) {
			_vital[cnt] = new Vital();
		}
		SetupVitalModifiers (); // <--- ADDED FOR CHARACTER CREATION 4/5
	}

	private void SetupSkills(){
		for (int cnt = 0; cnt < _skill.Length; cnt++) {
			_skill[cnt] = new Skill();
		}
		SetupSkillModifiers (); // <--- ADDED FOR CHARACTER CREATION 4/5
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

- Edit script _Attribute:_

```
public class Attribute : BaseStat{
	private string _name;

	public Attribute(){
		_name = "";
		ExpToLevel = 50;
		LevelModifier = 1.05f;
	}
	public string Name {
		get{ return _name;}
		set{ _name = value;}
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

- Edit script _ModifiedStat:_

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

	public string GetModifyingAttributeString(){
		string temp = "";

//		UnityEngine.Debug.Log (_mods.Count);

		for (int cnt = 0; cnt < _mods.Count; cnt++) {
			temp += _mods[cnt].attribute.Name
				+ "_"
				+ _mods[cnt].ratio;

			if(cnt < _mods.Count - 1){
				temp += "|";
			}

			UnityEngine.Debug.Log (temp);
		}
		return temp;
	}
}

public struct ModifyingAttribute{
	public Attribute attribute;
	public float ratio;

	public ModifyingAttribute(Attribute att, float rat){
		attribute = att;
		ratio = rat;
	}
}
```

- To debug: `UnityEngine.Debug.Log ()`


Instantiating our Character 1/5 - 5/5
=====================================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/033-unity3d-tutorial-instantiating-our-character-1x

Learned how to load PlayerPref data

- _File > New Scene_ saved as _Level 1_ and double click scene to ensure you're editing it
- Create C# _Script/GameMaster_
- Create empty game object named _  Game Master_ prefixed with two spaces.
















Instantiating our Character 1/5 - 5/5
=====================================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/033-unity3d-tutorial-instantiating-our-character-1x
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/034-unity3d-tutorial-instantiating-our-character-2x
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/035-unity3d-tutorial-instantiating-our-character-3x
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/036-unity3d-tutorial-instantiating-our-character-4x
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/037-unity3d-tutorial-instantiating-our-character-55

Learned how to load PlayerPref data, work with 3d model that has a skeleton, cameras that follow an object. I stopped paying attention around the fourth tutorial because it was loading data from PlayerPref, which is easy and I would probably like to replace with a database. Also, I did not want to get too deep into how he implemented stats.

- _File > New Scene_ saved as _Level 1_ and double click scene to ensure you're editing it

- Create C# _Script/GameMaster:_

```
using UnityEngine;
using System.Collections;

public class GameMaster : MonoBehaviour {
	public GameObject playerCharacter; // The prefab w/ 3d model
	public Camera mainCamera;          // The camera that will follow player around
	public GameObject gameSettings;

	public float zOffset;
	public float yOffset;
	public float xRotationOffset;
	
	private GameObject _pc;            // Cached instantiated object

	private PlayerCharacter _pcScript;

	// Use this for initialization
	void Start () {
		_pc = (GameObject)Instantiate (        // Put player character in game world
			playerCharacter,  
			Vector3.zero,    // Center of world
			Quaternion.identity); // "facing straight ahead" is what author said
		_pc.name = "pc";
		_pcScript = _pc.GetComponent<PlayerCharacter>();

		//mainCamera.transform.position = _pc.transform.position; // Camera is on top of player character model

		zOffset = -2.5f;
		yOffset = 2.5f;
		xRotationOffset = 22.5f;

		mainCamera.transform.position = new Vector3 (
			_pc.transform.position.x,
			_pc.transform.position.y + yOffset,
			_pc.transform.position.z + zOffset);
		mainCamera.transform.Rotate (
			xRotationOffset, 
			0, 
			0);

		LoadCharacter ();
	}

	public void LoadCharacter(){
		GameObject gs = GameObject.Find ("__GameSettings");

		if (gs == null) {
			// Instantiate game settings if not set
			GameObject gs1 = Instantiate(gameSettings, Vector3.zero, Quaternion.identity) as GameObject;
			gs1.name = "__GameSettings";
		}
		GameSettings gsScript = GameObject.Find ("__GameSettings").GetComponent<GameSettings>();

		gsScript.LoadCharacterData ();
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
```

- `Quaternion.identity` is "facing straight ahead," according to the author.

- `Camera` object

- `_pcScript = _pc.GetComponent<PlayerCharacter>();` to get the _pc object's PlayerCharacter script.

- `GameSettings gsScript = GameObject.Find ("__GameSettings").GetComponent<GameSettings>();` to get the _GameSettings_ script associated with the GameSettings object

- Create empty game object named _  Game Master_ prefixed with two spaces.

- Drag _GameMaster_ script onto _Game Master_ game object

- Drag the player character prefab into GameMaster parameter _Player Character_

- Install blender so you can use a 3d model: http://www.blender.org/download/ When I tried to use the version from the tutorial, I got this error: _Blender could not convert the .blend file to FBX file. You need to use Blender 2.45-2.49 or 2.58 and later versions for direct Blender import to work._ This is likely because my version of unity is much newer (4.3.x). So I installed Blender 2.7 then reimported the object by clicking and dragging the .blend file into assets. It worked!

- Download _249HumanAnimated_ from his assets: http://www.burgzergarcade.com/catalog/educational/3d-models/humanoid ... unzip it, *right click the .blend file and make sure it opens with blender*, then click and drag _249HumanAnimated.blend_ into _Assets._

- Note: There are some good assets for learning at burgzergarcade.com

- Drag the _Player Character Prefab_ into _Hierarchy. Drag 249HumanAnimated onto the prefab. Zero out the transform for both the prefab and the 3d model. Now drag the prefab from Hierarchy into your assets prefab folder on top of the old _Player Character Prefab_ to replace it. Delete prefab from hierarchy (because it gets loaded by script on runtime).

- _Game Object > Create Other_ and add a directional light. Move to (1000,1000,0) to get it out of the way. Rotate to (30,50,14) to get good light. Add `public Camera mainCamera;` to GameMaster script then, in unity, drop the camera onto the script parameter. When playing, you can move character in scene editor to see how things look.

- In File > Build Settings, add _Level 1_ to list of scenes. Edit CharacterGenerator script so it loads _Level 1_ on confirm. Now, if you play game from _Character Generator_ scene, the __GameSettings object will persist to _Level 1._

- But... we don't want to enter name every time. So create new prefab named _Game Settings._ Then go into character generator scene and drag _Game Settings_ object from hierarchy to prefab. Go to scene _Level 1._ Edit script _GameMaster_ by adding `public GameObject gameSettings;`. Save script and in unity, click and drag prefab onto the _Game Master_ hierarchy object's game settings parameter.

- Edit script GameSettings:

```
using UnityEngine;
using System.Collections;
using System;                 // <-- ACCESS TO ENUM CLASS!

public class GameSettings : MonoBehaviour {

	void Awake(){
		DontDestroyOnLoad (this);
	}

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	public void SaveCharacterData(){
		GameObject pc = GameObject.Find ("pc");
		PlayerCharacter pcClass = pc.GetComponent <PlayerCharacter> ();

		PlayerPrefs.DeleteAll ();

		PlayerPrefs.SetString ("Player Name", pcClass.Name);

		// Save attribute values
		for(int cnt=0; cnt < Enum.GetValues(typeof(AttributeName)).Length; cnt++){
			PlayerPrefs.SetInt (
				((AttributeName)cnt).ToString () + " - Base Value",
				pcClass.GetPrimaryAttribute (cnt).BaseValue);

			PlayerPrefs.SetInt (
				((AttributeName)cnt).ToString () + " - Exp To Level",
				pcClass.GetPrimaryAttribute (cnt).ExpToLevel);
		}

		// Save vital values
		for(int cnt=0; cnt < Enum.GetValues(typeof(VitalName)).Length; cnt++){
			PlayerPrefs.SetInt (
				((VitalName)cnt).ToString () + " - Base Value",
				pcClass.GetVital (cnt).BaseValue);
			
			PlayerPrefs.SetInt (
				((VitalName)cnt).ToString () + " - Exp To Level",
				pcClass.GetVital (cnt).ExpToLevel);

			PlayerPrefs.SetInt (
				((VitalName)cnt).ToString () + " - Current Value",
				pcClass.GetVital (cnt).CurrentValue);

			PlayerPrefs.SetString (
				((VitalName)cnt).ToString () + " - Mods",
				pcClass.GetVital (cnt).GetModifyingAttributeString());
		}

		// Save skill values
		for(int cnt=0; cnt < Enum.GetValues(typeof(SkillName)).Length; cnt++){
			PlayerPrefs.SetInt (
				((SkillName)cnt).ToString () + " - Base Value",
				pcClass.GetSkill (cnt).BaseValue);
			
			PlayerPrefs.SetInt (
				((SkillName)cnt).ToString () + " - Exp To Level",
				pcClass.GetSkill (cnt).ExpToLevel);

			PlayerPrefs.SetString (
				((SkillName)cnt).ToString () + " - Mods",
				pcClass.GetSkill (cnt).GetModifyingAttributeString());

		}
	}

	public void LoadCharacterData(){
		// LIKELY BROKEN. I STOPPED CARING ABOUT THIS FUNCTION IN VIDEO [ Instantiating our Character 4/5 ] BECAUSE I AM NOT SOLD ON USING PLAYPREF.
		GameObject pc = GameObject.Find ("pc");
		PlayerCharacter pcClass = pc.GetComponent <PlayerCharacter> ();
				
		pcClass.Name = PlayerPrefs.GetString ("Player Name", "Name Me");

		// Load attribute values
		for(int cnt=0; cnt < Enum.GetValues(typeof(AttributeName)).Length; cnt++){
			pcClass.GetPrimaryAttribute (cnt).BaseValue = 
				PlayerPrefs.GetInt (
				((AttributeName)cnt).ToString () + " - Base Value",
				0);
			
			pcClass.GetPrimaryAttribute (cnt).ExpToLevel =
				PlayerPrefs.GetInt (
					((AttributeName)cnt).ToString () + " - Exp To Level",
					0);
		}
		
		// Load vital values
		for(int cnt=0; cnt < Enum.GetValues(typeof(VitalName)).Length; cnt++){
			pcClass.GetVital (cnt).BaseValue =
				PlayerPrefs.GetInt (
					((VitalName)cnt).ToString () + " - Base Value",
					0);
			
			pcClass.GetVital (cnt).ExpToLevel=
				PlayerPrefs.GetInt (
					((VitalName)cnt).ToString () + " - Exp To Level",
					0);
			
			pcClass.GetVital (cnt).CurrentValue =
				PlayerPrefs.GetInt (
					((VitalName)cnt).ToString () + " - Current Value",
					0);

// COMMENT OUT FOR NOW B/C NEEDS PARSING ETC
//			pcClass.GetVital (cnt).GetModifyingAttributeString() = 
//				PlayerPrefs.GetString (
//					((VitalName)cnt).ToString () + " - Mods",
//					0);
		}
		
		// Load skill values
		for(int cnt=0; cnt < Enum.GetValues(typeof(SkillName)).Length; cnt++){
			pcClass.GetSkill (cnt).BaseValue =
				PlayerPrefs.GetInt (
					((SkillName)cnt).ToString () + " - Base Value",
					0);
				
			pcClass.GetSkill (cnt).ExpToLevel = 
				PlayerPrefs.GetInt (
					((SkillName)cnt).ToString () + " - Exp To Level",
					0);

// COMMENT OUT FOR NOW B/C NEEDS PARSING ETC
//			PlayerPrefs.SetString (
//				((SkillName)cnt).ToString () + " - Mods",
//				pcClass.GetSkill (cnt).GetModifyingAttributeString());
			
		}
	}

}


```

- `PlayerPrefs.GetString()` can take a default value as second param if key not found


NOTE
====
Four tutorials before this were skipped because just code cleanup.

Player Spawn Point 1/2-2/2
==========================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/042-unity3d-tutorial-player-spawn-point-12
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/043-unity3d-tutorial-player-spawn-point-22

Learned how to spawn character on map.

- Edit scene _Level 1_ by adding a terrain via GameObject. You can make bumps, etc, clicking the terrain 

object in hierarchy and using tools under _Terrain (Script)_ in Inspector. You can also add textures; just 

click around.

- Create empty game object named _Player Spawn Point._ Drag it to where you want to spawn. Move it up a bit on 

the Y axis because when it spawns, it will fall to the earth.

- Edit script _GameSettings:_

```
public const string PLAYER_SPAWN_POINT = "Player Spawn Point"; // Name of game object
```

- Edit script _GameMaster:_

```
using UnityEngine;
using System.Collections;

public class GameMaster : MonoBehaviour {
	public GameObject playerCharacter; // The prefab w/ 3d model
	public Camera mainCamera;          // The camera that will follow player around
	public GameObject gameSettings;

	public float zOffset;
	public float yOffset;
	public float xRotationOffset;
	
	private GameObject _pc;            // Cached instantiated object

	private PlayerCharacter _pcScript;

	private Vector3 _playerSpawnPointPosition;

	// Use this for initialization
	void Start () {
		_playerSpawnPointPosition = new Vector3 (32, 3, 21); // default position for player spawn 

point
		GameObject go = GameObject.Find (GameSettings.PLAYER_SPAWN_POINT);
		if (go == null) {
			Debug.Log("cannot find spawn point; creating one");
			go = new GameObject(GameSettings.PLAYER_SPAWN_POINT);
			go.transform.position = _playerSpawnPointPosition;
		}

		_pc = (GameObject)Instantiate (        // Put player character in game world
			playerCharacter,  
			Vector3.zero,    // Center of world
			Quaternion.identity); // "facing straight ahead" is what author said
		_pc.name = "pc";
		_pcScript = _pc.GetComponent<PlayerCharacter>();

		_pc.transform.position = go.transform.position;

		//mainCamera.transform.position = _pc.transform.position; // Camera is on top of player 

character model

		zOffset = -2.5f;
		yOffset = 2.5f;
		xRotationOffset = 22.5f;

		mainCamera.transform.position = new Vector3 (
			_pc.transform.position.x,
			_pc.transform.position.y + yOffset,
			_pc.transform.position.z + zOffset);
		mainCamera.transform.Rotate (
			xRotationOffset, 
			0, 
			0);

		LoadCharacter ();
	}

	public void LoadCharacter(){
		GameObject gs = GameObject.Find ("__GameSettings");

		if (gs == null) {
			// Instantiate game settings if not set
			GameObject gs1 = Instantiate(gameSettings, Vector3.zero, Quaternion.identity) as 

GameObject;
			gs1.name = "__GameSettings";
		}
		GameSettings gsScript = GameObject.Find ("__GameSettings").GetComponent<GameSettings>();

		gsScript.LoadCharacterData ();
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
```


Getting CSharp Messenger Extended & GUITexture Healthbar 1/3 - 3/3
===================================================================
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/044-unity3d-tutorial-getting-csharpmessenger-

extended
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/045-unity3d-tutorial-guitexture-healthbar-13
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/046-unity3d-tutorial-guitexture-healthbar-23
http://www.burgzergarcade.com/tutorials/game-engines/unity3d/047-unity3d-tutorial-guitexture-healthbar-33

Learned how to message between objects, set up mob health bar and player health bar.

- We will use this wiki page: http://wiki.unity3d.com/index.php?title=CSharpMessenger_Extended

- Create C# script _Scripts/MessengerExtended/CallBack_ and delete everything, then paste the following (from 

the wiki page):

```
// MessengerUnitTest.cs v1.0 by Magnus Wolffelt, magnus.wolffelt@gmail.com
//
// Delegates used in Messenger.cs.
 
public delegate void Callback();
public delegate void Callback<T>(T arg1);
public delegate void Callback<T, U>(T arg1, U arg2);
public delegate void Callback<T, U, V>(T arg1, U arg2, V arg3);
```

- Create C# script _Scripts/MessengerExtended/Messenger_ and delete everything, then paste the following (from 

the wiki page):

```
// Messenger.cs v1.0 by Magnus Wolffelt, magnus.wolffelt@gmail.com
//
// Inspired by and based on Rod Hyde's Messenger:
// http://www.unifycommunity.com/wiki/index.php?title=CSharpMessenger
//
// This is a C# messenger (notification center). It uses delegates
// and generics to provide type-checked messaging between event producers and
// event consumers, without the need for producers or consumers to be aware of
// each other. The major improvement from Hyde's implementation is that
// there is more extensive error detection, preventing silent bugs.
//
// Usage example:
// Messenger<float>.AddListener("myEvent", MyEventHandler);
// ...
// Messenger<float>.Broadcast("myEvent", 1.0f);
 
 
using System;
using System.Collections.Generic;
 
public enum MessengerMode {
	DONT_REQUIRE_LISTENER,
	REQUIRE_LISTENER,
}
 
 
static internal class MessengerInternal {
	static public Dictionary<string, Delegate> eventTable = new Dictionary<string, Delegate>();
	static public readonly MessengerMode DEFAULT_MODE = MessengerMode.REQUIRE_LISTENER;
 
	static public void OnListenerAdding(string eventType, Delegate listenerBeingAdded) {
		if (!eventTable.ContainsKey(eventType)) {
			eventTable.Add(eventType, null);
		}
 
		Delegate d = eventTable[eventType];
		if (d != null && d.GetType() != listenerBeingAdded.GetType()) {
			throw new ListenerException(string.Format("Attempting to add listener with 

inconsistent signature for event type {0}. Current listeners have type {1} and listener being added has type 

{2}", eventType, d.GetType().Name, listenerBeingAdded.GetType().Name));
		}
	}
 
	static public void OnListenerRemoving(string eventType, Delegate listenerBeingRemoved) {
		if (eventTable.ContainsKey(eventType)) {
			Delegate d = eventTable[eventType];
 
			if (d == null) {
				throw new ListenerException(string.Format("Attempting to remove listener with 

for event type {0} but current listener is null.", eventType));
			} else if (d.GetType() != listenerBeingRemoved.GetType()) {
				throw new ListenerException(string.Format("Attempting to remove listener with 

inconsistent signature for event type {0}. Current listeners have type {1} and listener being removed has type 

{2}", eventType, d.GetType().Name, listenerBeingRemoved.GetType().Name));
			}
		} else {
			throw new ListenerException(string.Format("Attempting to remove listener for type {0} 

but Messenger doesn't know about this event type.", eventType));
		}
	}
 
	static public void OnListenerRemoved(string eventType) {
		if (eventTable[eventType] == null) {
			eventTable.Remove(eventType);
		}
	}
 
	static public void OnBroadcasting(string eventType, MessengerMode mode) {
		if (mode == MessengerMode.REQUIRE_LISTENER && !eventTable.ContainsKey(eventType)) {
			throw new MessengerInternal.BroadcastException(string.Format("Broadcasting message {0} 

but no listener found.", eventType));
		}
	}
 
	static public BroadcastException CreateBroadcastSignatureException(string eventType) {
		return new BroadcastException(string.Format("Broadcasting message {0} but listeners have a 

different signature than the broadcaster.", eventType));
	}
 
	public class BroadcastException : Exception {
		public BroadcastException(string msg)
			: base(msg) {
		}
	}
 
	public class ListenerException : Exception {
		public ListenerException(string msg)
			: base(msg) {
		}
	}
}
 
 
// No parameters
static public class Messenger {
	private static Dictionary<string, Delegate> eventTable = MessengerInternal.eventTable;
 
	static public void AddListener(string eventType, Callback handler) {
		MessengerInternal.OnListenerAdding(eventType, handler);
		eventTable[eventType] = (Callback)eventTable[eventType] + handler;
	}
 
	static public void RemoveListener(string eventType, Callback handler) {
		MessengerInternal.OnListenerRemoving(eventType, handler);	
		eventTable[eventType] = (Callback)eventTable[eventType] - handler;
		MessengerInternal.OnListenerRemoved(eventType);
	}
 
	static public void Broadcast(string eventType) {
		Broadcast(eventType, MessengerInternal.DEFAULT_MODE);
	}
 
	static public void Broadcast(string eventType, MessengerMode mode) {
		MessengerInternal.OnBroadcasting(eventType, mode);
		Delegate d;
		if (eventTable.TryGetValue(eventType, out d)) {
			Callback callback = d as Callback;
			if (callback != null) {
				callback();
			} else {
				throw MessengerInternal.CreateBroadcastSignatureException(eventType);
			}
		}
	}
}
 
// One parameter
static public class Messenger<T> {
	private static Dictionary<string, Delegate> eventTable = MessengerInternal.eventTable;
 
	static public void AddListener(string eventType, Callback<T> handler) {
		MessengerInternal.OnListenerAdding(eventType, handler);
		eventTable[eventType] = (Callback<T>)eventTable[eventType] + handler;
	}
 
	static public void RemoveListener(string eventType, Callback<T> handler) {
		MessengerInternal.OnListenerRemoving(eventType, handler);
		eventTable[eventType] = (Callback<T>)eventTable[eventType] - handler;
		MessengerInternal.OnListenerRemoved(eventType);
	}
 
	static public void Broadcast(string eventType, T arg1) {
		Broadcast(eventType, arg1, MessengerInternal.DEFAULT_MODE);
	}
 
	static public void Broadcast(string eventType, T arg1, MessengerMode mode) {
		MessengerInternal.OnBroadcasting(eventType, mode);
		Delegate d;
		if (eventTable.TryGetValue(eventType, out d)) {
			Callback<T> callback = d as Callback<T>;
			if (callback != null) {
				callback(arg1);
			} else {
				throw MessengerInternal.CreateBroadcastSignatureException(eventType);
			}
		}
	}
}
 
 
// Two parameters
static public class Messenger<T, U> {
	private static Dictionary<string, Delegate> eventTable = MessengerInternal.eventTable;
 
	static public void AddListener(string eventType, Callback<T, U> handler) {
		MessengerInternal.OnListenerAdding(eventType, handler);
		eventTable[eventType] = (Callback<T, U>)eventTable[eventType] + handler;
	}
 
	static public void RemoveListener(string eventType, Callback<T, U> handler) {
		MessengerInternal.OnListenerRemoving(eventType, handler);
		eventTable[eventType] = (Callback<T, U>)eventTable[eventType] - handler;
		MessengerInternal.OnListenerRemoved(eventType);
	}
 
	static public void Broadcast(string eventType, T arg1, U arg2) {
		Broadcast(eventType, arg1, arg2, MessengerInternal.DEFAULT_MODE);
	}
 
	static public void Broadcast(string eventType, T arg1, U arg2, MessengerMode mode) {
		MessengerInternal.OnBroadcasting(eventType, mode);
		Delegate d;
		if (eventTable.TryGetValue(eventType, out d)) {
			Callback<T, U> callback = d as Callback<T, U>;
			if (callback != null) {
				callback(arg1, arg2);
			} else {
				throw MessengerInternal.CreateBroadcastSignatureException(eventType);
			}
		}
	}
}
 
 
// Three parameters
static public class Messenger<T, U, V> {
	private static Dictionary<string, Delegate> eventTable = MessengerInternal.eventTable;
 
	static public void AddListener(string eventType, Callback<T, U, V> handler) {
		MessengerInternal.OnListenerAdding(eventType, handler);
		eventTable[eventType] = (Callback<T, U, V>)eventTable[eventType] + handler;
	}
 
	static public void RemoveListener(string eventType, Callback<T, U, V> handler) {
		MessengerInternal.OnListenerRemoving(eventType, handler);
		eventTable[eventType] = (Callback<T, U, V>)eventTable[eventType] - handler;
		MessengerInternal.OnListenerRemoved(eventType);
	}
 
	static public void Broadcast(string eventType, T arg1, U arg2, V arg3) {
		Broadcast(eventType, arg1, arg2, arg3, MessengerInternal.DEFAULT_MODE);
	}
 
	static public void Broadcast(string eventType, T arg1, U arg2, V arg3, MessengerMode mode) {
		MessengerInternal.OnBroadcasting(eventType, mode);
		Delegate d;
		if (eventTable.TryGetValue(eventType, out d)) {
			Callback<T, U, V> callback = d as Callback<T, U, V>;
			if (callback != null) {
				callback(arg1, arg2, arg3);
			} else {
				throw MessengerInternal.CreateBroadcastSignatureException(eventType);
			}
		}
	}
}
```

- Create prefab _Prefabs/Player Health Bar Prefab_

- _GameObjects > Create Other > GUI Texture._ Drop an image in the texture's GUITexture section of Inspector. 

Set width to 200, height 30. Play with the position; I settled on <0.15, 0.98, 0>. 

- Drop script VitalBar onto the texture.

- Drag texture onto _Player Health Bar Prefab._

- Delete texture then drop prefab into hierarchy.

- Duplicate _Player Health Bar Prefab_ and rename to _Mob Health Bar Prefab._ (I duplicated by dragging the 

prefab from inspector into assets).

- Drag _Mob Health Bar Prefab_ onto Hierarchy. Set X position to 0.7.

- Check out wiki link from earlier for info on how to message

- Create C# script _Scripts/HUD Classes/VitalBar:_

```
using UnityEngine;
using System.Collections;

// Display vitals for player or a mob
public class VitalBar : MonoBehaviour {
	public bool _isPlayerHealthbar;
	private int _maxBarLength;        // length of bar at 100% health
	private int _curBarLength;
	private GUITexture _display;

	// Use this for initialization
	void Start () {
//		_isPlayerHealthbar = true; // Set in inspector for now
		_display = gameObject.GetComponent<GUITexture> ();
		_maxBarLength = (int)_display.pixelInset.width;
		OnEnable ();
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	public void SetPlayerHealthBar(bool b){
		_isPlayerHealthbar = b;
	}

	public void OnChangeHealthBarSize(int curHealth, int maxHealth){
//		Debug.Log ("We heard a health event: "+curHealth+" / "+maxHealth);
		_curBarLength = (int)(1.0 * curHealth / maxHealth * _maxBarLength);
		_display.pixelInset = new Rect(
			_display.pixelInset.x, 
			_display.pixelInset.y, 
			_curBarLength, 
			_display.pixelInset.height);

	}

	public void OnEnable(){
		// listen to broadcast messages sent from other objects
		if(_isPlayerHealthbar){
			Messenger<int, int>.AddListener("player health update", OnChangeHealthBarSize);
		} else {
			Messenger<int, int>.AddListener("mob health update", OnChangeHealthBarSize);
		}

	}

	public void OnDisable(){
		// stop listening for broadcast messages
		if(_isPlayerHealthbar){
			Messenger<int, int>.RemoveListener("player health update", OnChangeHealthBarSize);
		} else {
			Messenger<int, int>.RemoveListener("mob health update", OnChangeHealthBarSize);
		}
	}
}
```

- Note the `Messenger<int, int>.AddListener("player health update", OnChangeHealthBarSize);` which is tied to 

the messenger class we got from the wiki earlier on - this is not a Unity specific thing.

- Note: For scripts associated with a prefab, you can use `gameObject` to reference the Game Object associated 

with the prefab!

- To set manipulate width of a GUITexture: `_guiTextureVariable.pixelInset.width;` (can also be discovered in 

Inspector)

- Edit script _PlayerCharacter:_

```
public class PlayerCharacter : BaseCharacter {
	void Update(){
		Messenger<int, int>.Broadcast ("player health update", 80, 100);
	}
}
```

- Note the `Messenger<int, int>.Broadcast("player health update", 80, 100);` which is tied to the messenger 

class we got from the wiki earlier on - this is not a Unity specific thing.
