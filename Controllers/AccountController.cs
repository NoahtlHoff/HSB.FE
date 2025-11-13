using HackStreeBoys_Website.Models;
using HackStreeBoys_Website.Service;
using Microsoft.AspNetCore.Mvc;

namespace HackStreeBoys_Website.Controllers;

public class AccountController : Controller
{
    private const string SuccessLevel = "success";
    private const string ErrorLevel = "error";

    private readonly AuthService _authService;
    public AccountController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpGet]
    public IActionResult Register()
    {
        return View(new RegisterViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if (!ModelState.IsValid)
        {
            SetFormStatus(ErrorLevel, "Please fix the highlighted issues before continuing.");
            return View(model);

        }

        var registerRequest = new RegisterRequest
        {
            Name = model.Name,
            Email = model.Email,
            Password = model.Password
        };

        var result = await _authService.RegisterAsync(registerRequest);

        if (result != null)
        {
            SetFormStatus(SuccessLevel, $"Welcome aboard, {ExtractFirstName(model.Name)}! Your profile is ready.");

            // If API returns token, auto-login
            if (!string.IsNullOrEmpty(result.Token))
            {
                HttpContext.Session.SetString("JWTToken", result.Token);
                return RedirectToAction("Index", "Home");
            }

            // Otherwise redirect to login
            return RedirectToAction("Login");
        }
        else
        {
            SetFormStatus(ErrorLevel, result?.Message ?? "Registration failed. Please try again.");
            return View(model);
        }
    }

    [HttpGet]
    public IActionResult Login()
    {
        return View(new LoginViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if (!ModelState.IsValid)
        {
            SetFormStatus(ErrorLevel, "Enter a valid email and password to continue.");
            return View(model);
        }

        var loginRequest = new LoginRequest
        {
            Email = model.Email,
            Password = model.Password
        };

        var result = await _authService.LoginAsync(loginRequest);

        if (result != null && !string.IsNullOrEmpty(result.Token))
        {
            HttpContext.Session.SetString("JWTToken", result.Token);

            SetFormStatus(SuccessLevel, "You're logged in. We'll keep your seat warm while we sync accounts.");

            return RedirectToAction("Index", "Home");
        }
        else
        {
            SetFormStatus(ErrorLevel, "Invalid email or password. Please try again.");
            return View(model);
        }
    }
    public IActionResult Logout()
    {
        HttpContext.Session.Clear();
        return RedirectToAction("Login");
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
