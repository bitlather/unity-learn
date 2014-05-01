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

