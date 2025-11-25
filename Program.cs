using HackStreeBoys_Website.Service;
using HackStreeBoys_Website.Settings;
using Microsoft.Extensions.Options;

namespace HackStreeBoys_Website;

public class Program
{
	public static void Main(string[] args)
	{
		var builder = WebApplication.CreateBuilder(args);

		// Add services to the container.
		builder.Services.AddControllersWithViews();

		builder.Services.AddSession(options =>
		{
			options.IdleTimeout = TimeSpan.FromMinutes(30);
		});

		builder.Services
		.AddOptions<ApiSettings>()
		.Bind(builder.Configuration.GetSection("ApiSettings"))
		.ValidateDataAnnotations()
		.ValidateOnStart();

	    builder.Services.AddScoped<AuthService>();
	    builder.Services.AddScoped<ChatService>();
		builder.Services.AddHttpClient("API", (sp, client) =>
		{
			var settings = sp.GetRequiredService<IOptions<ApiSettings>>().Value;

			client.BaseAddress = new Uri(settings.BaseUrl);
			client.DefaultRequestHeaders.Add("Accept", "application/json");
		});

		builder.Services.AddScoped<AuthService>();

		var app = builder.Build();

		// Configure the HTTP request pipeline.
		if (!app.Environment.IsDevelopment())
		{
			app.UseExceptionHandler("/Home/Error");
			// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
			app.UseHsts();
		}

		app.UseSession();

		app.UseHttpsRedirection();
		app.UseRouting();

		app.UseAuthorization();

		app.MapStaticAssets();
		app.MapControllerRoute(
				name: "default",
				pattern: "{controller=Home}/{action=Index}/{id?}")
			.WithStaticAssets();

		app.Run();
	}
}