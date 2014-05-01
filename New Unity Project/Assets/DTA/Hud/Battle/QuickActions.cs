using UnityEngine;
using System.Collections;

namespace Hud.Battle{

	public class QuickActions : MonoBehaviour {
		private const int 
			IconWidth         = 55,
			IconHeight        = 55,
			ButtonWidth       = 22,
			ButtonHeight      = 22,

			IconXPadding       = 8,
			IconYPadding       = 20,
			ButtonXOffset      = ((IconWidth - ButtonWidth) / 2),
			ButtonYOffset      = IconHeight - (ButtonHeight / 2),

			EdgeOfScreenOffset = 15;

		private static int
			BaseLeftPlayer1,
			BaseLeftPlayer2,
			BaseTopPlayer1,
			BaseTopPlayer2;

		// Use this for initialization
		void Start () {
			// Calculate position of first player's quick actions
			BaseLeftPlayer1 = EdgeOfScreenOffset;
			BaseTopPlayer1 = Screen.height 
				- IconHeight 
				- IconYPadding
				- (ButtonHeight / 2)
				- EdgeOfScreenOffset;

			// Calculate position of second player's quick actions
			BaseLeftPlayer2 = Screen.width
				- (3 * IconWidth)
				- (2 * IconXPadding)
				- EdgeOfScreenOffset;
			BaseTopPlayer2 = BaseTopPlayer1;
		}

		void OnGUI(){
			DrawQuickActions (BaseLeftPlayer1, BaseTopPlayer1);
			DrawQuickActions (BaseLeftPlayer2, BaseTopPlayer2);
		}

		private void DrawQuickActions(int baseLeft, int baseTop){
			//**DTA PERHAPS RECT SHOULD BE CACHED?

			// Left quick action icon
			GUI.Box(new Rect(
				baseLeft,
				baseTop,
				IconWidth, 
				IconHeight), "");

			// Left quick action button
			GUI.Box (new Rect (
				baseLeft + ButtonXOffset,
				baseTop + ButtonYOffset,
				ButtonWidth,
				ButtonHeight), "");

			// Middle quick action icon
			GUI.Box(new Rect(
				baseLeft + IconWidth + IconXPadding,
				baseTop + IconYPadding,
				IconWidth, 
				IconHeight), "");

			// Middle quick action button
			GUI.Box(new Rect(
				baseLeft + IconWidth + IconXPadding + ButtonXOffset,
				baseTop + IconYPadding + ButtonYOffset,
				ButtonWidth, 
				ButtonHeight), "");

			// Right quick action icon
			GUI.Box(new Rect(
				baseLeft + 2 * (IconWidth + IconXPadding),
				baseTop,
				IconWidth, 
				IconHeight), "");

			// Right quick action button
			GUI.Box(new Rect(
				baseLeft + 2 * (IconWidth + IconXPadding) + ButtonXOffset,
				baseTop + ButtonYOffset,
				ButtonWidth, 
				ButtonHeight), "");
		}
	}
}