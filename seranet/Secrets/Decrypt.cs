using System;
using System.Text;
using System.IO;
using System.Security.Cryptography;
using Microsoft.Extensions.Options;

namespace Workplace.Eureka.Services.Secrets
{
    public class Decrypt
    {
        readonly string PasswordHash;
        readonly string SaltKey;
        readonly string VIKey;

        public Decrypt(IOptions<SymmetricAlgorithmKey> options)
        {
            SymmetricAlgorithmKey opt = options.Value;
            PasswordHash = opt.Password;
            SaltKey = opt.Salt;
            VIKey = opt.IV;
        }

        public string Decrypts(string encryptedText)
        {
            try
            {
                byte[] cipherTextBytes = Convert.FromBase64String(encryptedText);
                byte[] keyBytes = new Rfc2898DeriveBytes(PasswordHash, Encoding.ASCII.GetBytes(SaltKey)).GetBytes(256 / 8);
                using (SymmetricAlgorithm symmetricKey = CreateAlgorithm())
                {
                    ICryptoTransform decryptor = symmetricKey.CreateDecryptor(keyBytes, Encoding.ASCII.GetBytes(VIKey));

                    using (MemoryStream memoryStream = new MemoryStream(cipherTextBytes))
                    {
                        using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                        {
                            byte[] plainTextBytes = new byte[cipherTextBytes.Length];

                            int decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
                            return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount).TrimEnd("\0".ToCharArray());
                        }
                    }
                }
            }
            catch (Exception)
            {
                return null;
            }
        }

        static SymmetricAlgorithm CreateAlgorithm()
        {
            SymmetricAlgorithm algo = Aes.Create();
            algo.Mode = CipherMode.CBC;
            algo.Padding = PaddingMode.None;

            return algo;
        }
    }
}