namespace HackStreeBoys_Website.Models
{
    public class ConversationDetailDto
    {
        public string ConversationId { get; set; } = string.Empty;
        public string ConversationTitle { get; set; } = string.Empty;
        public List<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
