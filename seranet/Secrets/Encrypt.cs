using System;
using System.Text;
using System.IO;
using System.Security.Cryptography;
using Microsoft.Extensions.Options;

namespace Workplace.Eureka.Services.Secrets
{
    public class Encrypt
    {
        readonly string PasswordHash ="SampleHash";
        readonly string SaltKey = "SampleSalt";
        readonly string VIKey = "SampleVI";

        

        public string Decrypts(string encryptedText)
        {
            try
            {
               byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);

            byte[] keyBytes = new Rfc2898DeriveBytes(PasswordHash, Encoding.ASCII.GetBytes(SaltKey)).GetBytes(256 / 8);
            var symmetricKey = new RijndaelManaged() { Mode = CipherMode.CBC, Padding = PaddingMode.Zeros };  
                using (SymmetricAlgorithm symmetricKey = CreateAlgorithm())
                {
                     var encryptor = symmetricKey.CreateEncryptor(keyBytes, Encoding.ASCII.GetBytes(VIKey));

                    using (MemoryStream memoryStream = new MemoryStream(cipherTextBytes))
                    {
                        using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                        {
                             cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                             cryptoStream.FlushFinalBlock();
                             cipherTextBytes = memoryStream.ToArray();
                             cryptoStream.Close();
                        }
                     memoryStream.Close();
                    }
                    string encrypted_text = Convert.ToBase64String(cipherTextBytes);
                    return encrypted_text;
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