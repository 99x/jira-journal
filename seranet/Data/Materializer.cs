// 
// This code is borrowed from https://github.com/alertbox/snikt
// 
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Data;

namespace Workplace.Eureka.Services.Data
{
    public class Materializer<T> where T : class
    {
        readonly ParameterExpression recordParameter = Expression.Parameter(typeof(IDataRecord), "record");
        readonly MethodInfo fieldOfTOrdinalMethod = typeof(DataExtensions).GetMethod("Field", new Type[] { typeof(IDataRecord), typeof(int) });

        readonly Func<IDataRecord, T> shaperDelegate;

        public Materializer(IDataReader shape)
        {
            shaperDelegate = GetDefaultShaper(shape);
        }

        public T Map(IDataReader reader)
        {
            return shaperDelegate(reader);
        }

        Func<IDataRecord, T> GetDefaultShaper(IDataReader shape)
        {
            IEnumerable<string> fieldNames = shape.GetFieldNames();
            IEnumerable<MemberBinding> memberBindings = GetMemberBindings(fieldNames);
            Expression<Func<IDataRecord, T>> shaper =
                Expression.Lambda<Func<IDataRecord, T>>(Expression.MemberInit(Expression.New(typeof(T)), memberBindings), recordParameter);

            return shaper.Compile();
        }

        IEnumerable<MemberBinding> GetMemberBindings(IEnumerable<string> fieldNames)
        {
            Type t = typeof(T);
            return fieldNames.Select((name, ordinal) => CreateMemberBinding(t, name, ordinal));
        }

        MemberBinding CreateMemberBinding(Type t, string fieldName, int ordinal)
        {
            PropertyInfo property = t.GetProperty(fieldName);
            MethodInfo setterMethod = property.GetSetMethod();
            MethodInfo fieldOfTMethod = fieldOfTOrdinalMethod.MakeGenericMethod(property.PropertyType);
            Expression fieldArg = Expression.Constant(ordinal);
            Expression getterArg = Expression.Call(fieldOfTMethod, recordParameter, fieldArg);

            return Expression.Bind(setterMethod, getterArg);
        }
    }
}
