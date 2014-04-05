using System;
using System.IO;
using System.Collections.Generic;

namespace FlickrShutterCounter
{
	public class DBRecord
	{
		public string UserId { get; set; }
		public string Model {get;set;}
		public int ImageNumber {get;set;}

		public override int GetHashCode ()
		{
			return Key.GetHashCode ();
		}

		public string Key { 
			get {
				return UserId + "_" + Model;
			}
		}

		public override string ToString ()
		{
			return string.Format ("{0} {1} {2}", UserId, Model, ImageNumber);
		}
	}

	public class DB
	{
		public readonly Dictionary<string, DBRecord> Records = new Dictionary<string, DBRecord>();

		public string DBFilename { get; private set; }

		private DateTime lastAcitiviyTime;

		public DB ()
		{
			this.DBFilename = "SC.txt";
		}

		public void Load()
		{
			lastAcitiviyTime = DateTime.Now;

			if (!File.Exists (DBFilename))
				return;

			using (var sr = new StreamReader(DBFilename)) {
				while (!sr.EndOfStream) {
					var items = sr.ReadLine ().Split (new [] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
					if (items.Length != 3)
						continue;
					var record = new DBRecord {
						UserId = items [0],
						Model = items [1],
						ImageNumber = int.Parse (items [2])
					};

					this.Records[record.Key] = record;
				}
			}

			Console.WriteLine ("[DB] {0} records loaded!", Records.Count);
		}

		public void AddRecord(string userId, string model, int imageNumber)
		{
			if (imageNumber < 0) {
				Console.WriteLine ("[DB] !Warning image number < 0. Ignored!");
				return;
			}

			var record = new DBRecord {
				UserId = userId,
				Model = model,
				ImageNumber = imageNumber
			};

			if (Records.ContainsKey (record.Key)) {
				var dbRecord = Records [record.Key];
				if (dbRecord.ImageNumber >= imageNumber) {
					Console.WriteLine ("[DB] !Warning image number in DB larger than new record. {0} > {1} Ignored!", dbRecord.ImageNumber, imageNumber);
					return;
				}
				var oldImageNumber = dbRecord.ImageNumber;
				dbRecord.ImageNumber = imageNumber;
				Console.WriteLine ("[DB] ImageNumber updated! {0} -> {1} | {2}", oldImageNumber, imageNumber, dbRecord);
			} else {
				Records.Add (record.Key, record);
				Console.WriteLine ("[DB] New entry added! {0}", record);
			}

			if (DateTime.Now.Subtract (lastAcitiviyTime).TotalMinutes > 1) {
				this.Save ();
			}
		}

		public void Save()
		{
			using (var sw = new StreamWriter(DBFilename)) {
				foreach (var item in Records) {
					sw.WriteLine (item.Value);
				}
			}
			lastAcitiviyTime = DateTime.Now;

			Console.WriteLine ("[DB] {0} records saved!", Records.Count);
		}
	}
}

