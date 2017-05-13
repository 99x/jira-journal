using Microsoft.EntityFrameworkCore;

namespace Workplace.Eureka.Services.Data
{
    public class SeranetDb : DbContext
    {
        public SeranetDb(DbContextOptions<SeranetDb> options) : base(options)
        {
        }
    }
}
