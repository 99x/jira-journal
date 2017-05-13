namespace Workplace.Eureka.Services.Secrets
{
    public class SymmetricAlgorithmKey
    {
        public string Password { get; set; }
        public string Salt { get; set; }
        public string IV { get; set; }
    }
}
