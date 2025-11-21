using System.ComponentModel.DataAnnotations;

namespace HackStreeBoys_Website.Settings
{
	public class ApiSettings
	{
		[Required]
		public string BaseUrl { get; set; } = default!;
	}
}
