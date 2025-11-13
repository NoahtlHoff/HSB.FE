using HackStreeBoys_Website.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

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
    public IActionResult Login(string? returnUrl = null)
    {
        return View(new LoginViewModel
        {
            ReturnUrl = ResolveReturnUrl(returnUrl)
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Login(LoginViewModel model)
    {
        var destination = ResolveReturnUrl(model.ReturnUrl);
        model.ReturnUrl = destination;

        if (!ModelState.IsValid)
        {
            SetFormStatus(ErrorLevel, "Enter a valid email and password to continue.");
            return View(model);
        }

        HttpContext.Session.SetString(SessionKeys.JwtToken, GenerateDemoToken());
        return Redirect(destination);
    }

    [HttpGet]
    public IActionResult Logout()
    {
        HttpContext.Session.Remove(SessionKeys.JwtToken);
        return RedirectToAction("Index", "Home");
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

    private string ResolveReturnUrl(string? returnUrl)
    {
        if (!string.IsNullOrWhiteSpace(returnUrl) && Url.IsLocalUrl(returnUrl))
        {
            return returnUrl;
        }

        return Url.Action("Index", "Chat") ?? "/";
    }

    private static string GenerateDemoToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }
}
