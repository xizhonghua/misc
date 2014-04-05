using System;
using System.Numerics;
using Numerics;

namespace Likelyhood
{
	public static class Util
	{
		public static double ToDouble (this BigRational num)
		{
			if (num.Numerator == 0 || num.Denominator == 0)
				return 0;
			if (num.Sign > 0)
				return Math.Exp (BigInteger.Log (num.Numerator) - BigInteger.Log (num.Denominator));
			else
				return -Math.Exp (BigInteger.Log (-num.Numerator) - BigInteger.Log (num.Denominator));
		}

		public static double ComputeLikelyhood (uint clientNum, uint insiderNum, uint apNum, uint attackedAPNum)
		{
			if (attackedAPNum > insiderNum)
				return 0.0;

			var unattackedAPNum = apNum - attackedAPNum;
			var clientPerAp = (uint)Math.Round ((decimal)clientNum / apNum);
			var likelyhood = BigRational.Zero;


			bool neg = true;

			for (var j = unattackedAPNum; j <= apNum; ++j) {
				var attackedPop = clientNum - clientPerAp * j;
				if (attackedPop < insiderNum) {
					break;
				}
				uint step = j - unattackedAPNum;			
				if (step > unattackedAPNum)
					step = unattackedAPNum;

				neg = !neg;


				var new_item = BigRational.One;

				uint term_pt_1 = apNum - j + 1;
				uint term_pt_2 = 1;
				uint term_pt_3 = 1;
				uint term_pt_4 = attackedPop - insiderNum + 1;
				uint term_pt_5 = clientNum - insiderNum + 1;
				uint curr_pt_1 = apNum;
				uint curr_pt_2 = step;
				uint curr_pt_3 = j - step;
				uint curr_pt_4 = attackedPop;
				uint curr_pt_5 = clientNum;

				while ((curr_pt_1 >= term_pt_1) || (curr_pt_2 >= term_pt_2) || (curr_pt_3 >= term_pt_3)
				       || (curr_pt_4 >= term_pt_4) || (curr_pt_5 >= term_pt_5)) {
					if (curr_pt_1 < term_pt_1)
						curr_pt_1 = 1;
					if (curr_pt_2 < term_pt_2)
						curr_pt_2 = 1;
					if (curr_pt_3 < term_pt_3)
						curr_pt_3 = 1;
					if (curr_pt_4 < term_pt_4)
						curr_pt_4 = 1;
					if (curr_pt_5 < term_pt_5)
						curr_pt_5 = 1;
						
					new_item *= curr_pt_1;
					new_item *= curr_pt_4;
					uint tmp = curr_pt_2 * curr_pt_3;
					new_item /= tmp;
					new_item /= curr_pt_5;


					//			Console.WriteLine ("new_item = {0}", new_item);

					if (curr_pt_1 >= term_pt_1)
						curr_pt_1 = curr_pt_1 - 1;
					if (curr_pt_2 >= term_pt_2)
						curr_pt_2 = curr_pt_2 - 1;
					if (curr_pt_3 >= term_pt_3)
						curr_pt_3 = curr_pt_3 - 1;
					if (curr_pt_4 >= term_pt_4)
						curr_pt_4 = curr_pt_4 - 1;
					if (curr_pt_5 >= term_pt_5)
						curr_pt_5 = curr_pt_5 - 1;
				}

				if (neg)
					new_item = -new_item;



				likelyhood += new_item;

				Console.WriteLine ("new_item = {0}, likelyhood = {1}", new_item.ToDouble (), likelyhood.ToDouble ());

				if (Math.Abs (new_item.ToDouble ()) < 1e-8)
					break;
			}

			return likelyhood.ToDouble ();
		}
	}
}

