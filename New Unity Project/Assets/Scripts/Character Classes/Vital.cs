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