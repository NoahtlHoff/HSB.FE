using HackStreeBoys_Website.Models;
using Microsoft.AspNetCore.Mvc;

namespace HackStreeBoys_Website.Controllers;

public class AccountController : Controller
{
    private const string SuccessLevel = "success";
    private const string ErrorLevel = "error";

    [HttpGet]
    public IActionResult Register()
    {
        return View(new RegisterViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Register(RegisterViewModel model)
    {
        if (!ModelState.IsValid)
        {
            SetFormStatus(ErrorLevel, "Please fix the highlighted issues before continuing.");
            return View(model);
        }

        SetFormStatus(SuccessLevel, $"Welcome aboard, {ExtractFirstName(model.Name)}! Your profile is ready.");
        ModelState.Clear();
        return View(new RegisterViewModel());
    }

    [HttpGet]
    public IActionResult Login()
    {
        return View(new LoginViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            SetFormStatus(ErrorLevel, "Enter a valid email and password to continue.");
            return View(model);
        }

        SetFormStatus(SuccessLevel, "You're logged in. We'll keep your seat warm while we sync accounts.");
        ModelState.Clear();
        return View(new LoginViewModel());
    }

    private void SetFormStatus(string level, string message)
    {
        ViewData["FormStatusLevel"] = level;
        ViewData["FormStatusMessage"] = message;
    }

    private static string ExtractFirstName(string fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName))
        {
            return "there";
        }

        var parts = fullName.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        return parts.Length > 0 ? parts[0] : fullName;
    }
}
