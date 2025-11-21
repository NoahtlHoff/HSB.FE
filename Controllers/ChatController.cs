using HackStreeBoys_Website.Models;
using Microsoft.AspNetCore.Mvc;

namespace HackStreeBoys_Website.Controllers;

public class ChatController : Controller
{
    public IActionResult Index()
    {
        // Check if user is authenticated by checking for JWT and userId in session
        var token = HttpContext.Session.GetString("JWTToken");
        var userIdString = HttpContext.Session.GetString("UserId");

        if (string.IsNullOrEmpty(token) || string.IsNullOrEmpty(userIdString))
        {
            return RedirectToAction("Login", "Account");
        }

        var viewModel = BuildViewModel();
        viewModel.UserId = userIdString;
        viewModel.JwtToken = token;

        return View(viewModel);
    }

    private static ChatViewModel BuildViewModel()
    {
        return new ChatViewModel
        {
            TraderProfiles = new List<TraderProfileOption>
            {
                new()
                {
                    Id = "day-trader",
                    Label = "Day Trader",
                    Strategies = new List<StrategyOption>
                    {
                        new() { Id = "breakout", Label = "Breakout Scalps", Description = "Capitalize on high-volume breakouts with tight risk controls." },
                        new() { Id = "momentum", Label = "Momentum", Description = "Ride accelerating moves backed by news or order-flow." },
                        new() { Id = "mean-reversion", Label = "VWAP Reversion", Description = "Fade extended moves back into the volume-weighted average price." }
                    }
                },
                new()
                {
                    Id = "swing-trader",
                    Label = "Swing Trader",
                    Strategies = new List<StrategyOption>
                    {
                        new() { Id = "breakout", Label = "Breakout", Description = "Multi-day breakouts from well-defined bases or channels." },
                        new() { Id = "trend-follow", Label = "Trend Follow", Description = "Hold leaders in established uptrends with trailing stops." },
                        new() { Id = "pullback", Label = "Pullback", Description = "Enter on controlled pullbacks into moving averages." }
                    }
                },
                new()
                {
                    Id = "long-term",
                    Label = "Long-Term Investor",
                    Strategies = new List<StrategyOption>
                    {
                        new() { Id = "quality-growth", Label = "Quality Growth", Description = "Compounders with double-digit revenue and durable moats." },
                        new() { Id = "value", Label = "Value Rotation", Description = "Out-of-favor names trading well below intrinsic value." },
                        new() { Id = "dividend", Label = "Dividend Compounders", Description = "Reliable cashflow with sustainable payout growth." }
                    }
                }
            },
            SeedMessages = new List<ChatMessage>
            {
                new() { Role = "assistant", Content = "👋 Welcome! Pick your trading style and strategy, then ask for stock ideas or risk checks when you are ready." },
                new() { Role = "user", Content = "Show me swing trades in semiconductors that are breaking out." },
                new() { Role = "assistant", Content = "Got it. I’ll screen for liquid names with clean bases, accelerating earnings, and trend confirmation." }
            },
            FeaturedIdeas = new List<StockIdea>
            {
                new()
                {
                    Ticker = "ASML",
                    CompanyName = "ASML Holding",
                    Thesis = "Flag breakout with institutional accumulation; watch for retest of 50-day moving average.",
                    ChartPoints = new List<double> { 92, 90, 91, 94, 96, 98, 101, 105, 102, 108 },
                    SuggestedEntry = 102.5,
                    SuggestedExit = 112,
                    RiskNote = "Keep risk tight under the 98 swing low if momentum stalls."
                },
                new()
                {
                    Ticker = "ON",
                    CompanyName = "ON Semiconductor",
                    Thesis = "Reclaiming prior resistance with strong volume and EV demand tailwinds.",
                    ChartPoints = new List<double> { 68, 65, 66, 70, 72, 71, 74, 77, 80, 79 },
                    SuggestedEntry = 76.4,
                    SuggestedExit = 84.6,
                    RiskNote = "Confirm with RSI > 55 on the 4-hour before scaling in."
                },
                new()
                {
                    Ticker = "KLAC",
                    CompanyName = "KLA Corporation",
                    Thesis = "Tight consolidation near highs; earnings gap holding with low volatility.",
                    ChartPoints = new List<double> { 420, 430, 428, 432, 438, 440, 444, 450, 452, 455 },
                    SuggestedEntry = 444,
                    SuggestedExit = 462,
                    RiskNote = "Exit if closes below the 21-day exponential moving average."
                }
            }
        };
    }
}
