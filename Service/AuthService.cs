using HackStreeBoys_Website.Models;

namespace HackStreeBoys_Website.Service
{
	// Handles authentication API calls (Login, Register).
	public class AuthService
	{
		private readonly IHttpClientFactory _httpClientFactory;

		public AuthService(IHttpClientFactory httpClientFactory)
		{
			_httpClientFactory = httpClientFactory;
		}

		// Authenticates a user and returns a JWT token.
		public async Task<AuthResponseDto?> LoginAsync(UserInputDto userInput)
		{
			var client = _httpClientFactory.CreateClient("API");

			var response = await client.PostAsJsonAsync("/api/auth/login", userInput);

			if (response.IsSuccessStatusCode)
			{
				return await response.Content.ReadFromJsonAsync<AuthResponseDto>();
			}

			return null;
		}

		// Registers a new user and returns a JWT token.
		public async Task<AuthResponseDto?> RegisterAsync(UserInputDto userInput)
		{
			var client = _httpClientFactory.CreateClient("API");

			var response = await client.PostAsJsonAsync("/api/auth/register", userInput);

			if (response.IsSuccessStatusCode)
			{
				return await response.Content.ReadFromJsonAsync<AuthResponseDto>();
			}

			return null;
		}
	}
}