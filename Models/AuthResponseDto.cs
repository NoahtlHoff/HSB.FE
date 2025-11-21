namespace HackStreeBoys_Website.Models
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }
        public string Email { get; set; } = string.Empty;
        public int UserId { get; set; }
    }
}
