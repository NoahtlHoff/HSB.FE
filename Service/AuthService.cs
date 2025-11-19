using HackStreeBoys_Website.Models;

namespace HackStreeBoys_Website.Service
{
    public class AuthService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest loginRequest)
        {
            var client = _httpClientFactory.CreateClient("API");

            var response = await client.PostAsJsonAsync("/api/auth/login", loginRequest);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<LoginResponse>();
            }

            return null;
        }

        public async Task<RegisterResponse?> RegisterAsync(RegisterRequest registerRequest)
        {
            var client = _httpClientFactory.CreateClient("API");

            var response = await client.PostAsJsonAsync("/api/auth/register", registerRequest);

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<RegisterResponse>();
            }

            return null;
        }
    }
}
