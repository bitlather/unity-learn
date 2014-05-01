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
