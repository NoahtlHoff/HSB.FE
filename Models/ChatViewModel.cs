namespace HackStreeBoys_Website.Models;

public class ChatViewModel
{
	public List<TraderProfileOption> TraderProfiles { get; set; } = new();
	public List<ChatMessage> SeedMessages { get; set; } = new();
	public List<StockIdea> FeaturedIdeas { get; set; } = new();
	public string UserId { get; set; } = string.Empty;
	public string JwtToken { get; set; } = string.Empty;
}

public class TraderProfileOption
{
	public string Id { get; set; } = string.Empty;
	public string Label { get; set; } = string.Empty;
	public List<StrategyOption> Strategies { get; set; } = new();
}

public class StrategyOption
{
	public string Id { get; set; } = string.Empty;
	public string Label { get; set; } = string.Empty;
	public string Description { get; set; } = string.Empty;
}

public class ChatMessage
{
	public string Role { get; set; } = string.Empty;
	public string Content { get; set; } = string.Empty;
}

public class StockIdea
{
	public string Ticker { get; set; } = string.Empty;
	public string CompanyName { get; set; } = string.Empty;
	public string Thesis { get; set; } = string.Empty;
	public List<double> ChartPoints { get; set; } = new();
	public double SuggestedEntry { get; set; }
	public double SuggestedExit { get; set; }
	public string RiskNote { get; set; } = string.Empty;
}