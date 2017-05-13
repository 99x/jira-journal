// 
// This code is borrowed from https://github.com/alertbox/snikt
// 
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace Workplace.Eureka.Services.Data
{
    public static class DataExtensions
    {
        public static IEnumerable<T> SqlQuery<T>(this DbContext db, string sql, params dynamic[] args) where T : class
        {
            using (IDbCommand cmd = SetupStoredCommand(db.Database.GetDbConnection(), sql))
            {
                db.Database.OpenConnection();
                using (IDataReader reader = cmd.ExecuteReader())
                {
                    Materializer<T> materializer = new Materializer<T>(reader);
                    while (reader.Read())
                    {
                        yield return materializer.Map(reader);
                    }
                }
            }
        }

        public static IDbCommand SetupStoredCommand(IDbConnection conn, string sql)
        {
            IDbCommand comm = conn.CreateCommand();
            comm.CommandText = sql;
            comm.CommandType = CommandType.Text;
            return comm;
        }

        public static T Field<T>(this IDataRecord record, int ordinal)
        {
            object val = record.IsDBNull(ordinal) ? null : record.GetValue(ordinal);
            return (T)val;
        }

        public static IEnumerable<string> GetFieldNames(this IDataReader reader)
        {
            return Enumerable
                .Range(0, reader.FieldCount)
                .Select(ordinal => reader.GetName(ordinal));
        }
    }
}
