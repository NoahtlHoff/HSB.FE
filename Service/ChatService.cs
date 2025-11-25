using HackStreeBoys_Website.Models;

namespace HackStreeBoys_Website.Service
{
    // Handles chat-related API calls (fetching conversations).
    public class ChatService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public ChatService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        // Retrieves a list of conversations for a specific user.
        public async Task<List<ConversationDto>?> GetConversationsAsync(string userId)
        {
            var client = _httpClientFactory.CreateClient("API");

            var response = await client.GetAsync($"/api/conversations?userId={userId}");

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<List<ConversationDto>>();
            }

            return null;
        }

        // Retrieves details for a specific conversation.
        public async Task<ConversationDetailDto?> GetConversationByIdAsync(string conversationId)
        {
            var client = _httpClientFactory.CreateClient("API");

            var response = await client.GetAsync($"/api/conversations/{conversationId}");

            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<ConversationDetailDto>();
            }

            return null;
        }
    }
}
