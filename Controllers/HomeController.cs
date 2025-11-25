using HackStreeBoys_Website.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace HackStreeBoys_Website.Controllers;

// Handles navigation for the main landing pages (Home, About).
public class HomeController : Controller
{
	private readonly ILogger<HomeController> _logger;

	public HomeController(ILogger<HomeController> logger)
	{
		_logger = logger;
	}

	// Displays the home page.
	public IActionResult Index()
	{
		return View();
	}

	// Displays the about page.
	public IActionResult About()
	{
		return View();
	}

	[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
	public IActionResult Error()
	{
		return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
	}
}